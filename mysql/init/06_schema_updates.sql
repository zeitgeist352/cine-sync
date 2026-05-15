-- ============================================================
-- SCHEMA UPDATES
-- 1. Club moderator tracking (moderatorID)
-- 2. Weighted critic score (weightedScore column + triggers)
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ── 1. Add moderatorID to Club ─────────────────────────────────────────────────
ALTER TABLE Club ADD COLUMN moderatorID INT NULL;
ALTER TABLE Club ADD CONSTRAINT fk_club_moderator
    FOREIGN KEY (moderatorID) REFERENCES Users(userID) ON DELETE SET NULL;

-- Assign moderators to existing clubs (use first-joined member as moderator)
UPDATE Club c
JOIN (
    SELECT clubID, MIN(userID) AS firstUser
    FROM UserClub
    GROUP BY clubID
) AS first ON first.clubID = c.clubID
SET c.moderatorID = first.firstUser
WHERE c.moderatorID IS NULL;

-- ── 2. Add weightedScore column to Content ────────────────────────────────────
ALTER TABLE Content ADD COLUMN weightedScore DECIMAL(4,2) DEFAULT 0.00;

-- ── 3. Drop old score triggers and recreate with weightedScore update ──────────
DROP TRIGGER IF EXISTS critic_score_after_insert;
DROP TRIGGER IF EXISTS critic_score_after_update;
DROP TRIGGER IF EXISTS critic_score_after_delete;
DROP TRIGGER IF EXISTS global_score_after_insert;
DROP TRIGGER IF EXISTS global_score_after_update;
DROP TRIGGER IF EXISTS global_score_after_delete;

DELIMITER $$

-- Recompute criticScore and weightedScore after critic review insert
CREATE TRIGGER critic_score_after_insert
AFTER INSERT ON OfficialReviews
FOR EACH ROW
BEGIN
    DECLARE v_critic DECIMAL(5,2);
    DECLARE v_user   DECIMAL(5,2);
    DECLARE v_weight DECIMAL(4,2);

    SET v_critic = (SELECT AVG(points) FROM OfficialReviews WHERE contentID = NEW.contentID);
    SET v_user   = (SELECT AVG(rating) FROM RatingLog WHERE contentID = NEW.contentID);
    SET v_weight = ROUND(
        CASE
            WHEN COALESCE(v_critic, 0) > 0 AND COALESCE(v_user, 0) > 0
                THEN 0.6 * v_critic + 0.4 * v_user
            WHEN COALESCE(v_critic, 0) > 0 THEN v_critic
            WHEN COALESCE(v_user, 0)   > 0 THEN v_user
            ELSE 0
        END, 2);

    UPDATE Content
    SET criticScore = COALESCE(v_critic, 0),
        weightedScore = v_weight
    WHERE contentID = NEW.contentID;
END$$

-- Recompute criticScore and weightedScore after critic review update
CREATE TRIGGER critic_score_after_update
AFTER UPDATE ON OfficialReviews
FOR EACH ROW
BEGIN
    DECLARE v_critic DECIMAL(5,2);
    DECLARE v_user   DECIMAL(5,2);
    DECLARE v_weight DECIMAL(4,2);

    SET v_critic = (SELECT AVG(points) FROM OfficialReviews WHERE contentID = NEW.contentID);
    SET v_user   = (SELECT AVG(rating) FROM RatingLog WHERE contentID = NEW.contentID);
    SET v_weight = ROUND(
        CASE
            WHEN COALESCE(v_critic, 0) > 0 AND COALESCE(v_user, 0) > 0
                THEN 0.6 * v_critic + 0.4 * v_user
            WHEN COALESCE(v_critic, 0) > 0 THEN v_critic
            WHEN COALESCE(v_user, 0)   > 0 THEN v_user
            ELSE 0
        END, 2);

    UPDATE Content
    SET criticScore = COALESCE(v_critic, 0),
        weightedScore = v_weight
    WHERE contentID = NEW.contentID;
END$$

-- Recompute criticScore and weightedScore after critic review delete
CREATE TRIGGER critic_score_after_delete
AFTER DELETE ON OfficialReviews
FOR EACH ROW
BEGIN
    DECLARE v_critic DECIMAL(5,2);
    DECLARE v_user   DECIMAL(5,2);
    DECLARE v_weight DECIMAL(4,2);

    SET v_critic = (SELECT AVG(points) FROM OfficialReviews WHERE contentID = OLD.contentID);
    SET v_user   = (SELECT AVG(rating) FROM RatingLog WHERE contentID = OLD.contentID);
    SET v_weight = ROUND(
        CASE
            WHEN COALESCE(v_critic, 0) > 0 AND COALESCE(v_user, 0) > 0
                THEN 0.6 * v_critic + 0.4 * v_user
            WHEN COALESCE(v_critic, 0) > 0 THEN v_critic
            WHEN COALESCE(v_user, 0)   > 0 THEN v_user
            ELSE 0
        END, 2);

    UPDATE Content
    SET criticScore = COALESCE(v_critic, 0),
        weightedScore = v_weight
    WHERE contentID = OLD.contentID;
END$$

-- Recompute globalScore and weightedScore after user rating insert
CREATE TRIGGER global_score_after_insert
AFTER INSERT ON RatingLog
FOR EACH ROW
BEGIN
    DECLARE v_critic DECIMAL(5,2);
    DECLARE v_user   DECIMAL(5,2);
    DECLARE v_weight DECIMAL(4,2);

    SET v_user   = (SELECT AVG(rating) FROM RatingLog WHERE contentID = NEW.contentID);
    SET v_critic = (SELECT AVG(points) FROM OfficialReviews WHERE contentID = NEW.contentID);
    SET v_weight = ROUND(
        CASE
            WHEN COALESCE(v_critic, 0) > 0 AND COALESCE(v_user, 0) > 0
                THEN 0.6 * v_critic + 0.4 * v_user
            WHEN COALESCE(v_critic, 0) > 0 THEN v_critic
            WHEN COALESCE(v_user, 0)   > 0 THEN v_user
            ELSE 0
        END, 2);

    UPDATE Content
    SET globalScore = COALESCE(v_user, 0),
        weightedScore = v_weight
    WHERE contentID = NEW.contentID;
END$$

-- Recompute globalScore and weightedScore after user rating update
CREATE TRIGGER global_score_after_update
AFTER UPDATE ON RatingLog
FOR EACH ROW
BEGIN
    DECLARE v_critic DECIMAL(5,2);
    DECLARE v_user   DECIMAL(5,2);
    DECLARE v_weight DECIMAL(4,2);

    SET v_user   = (SELECT AVG(rating) FROM RatingLog WHERE contentID = NEW.contentID);
    SET v_critic = (SELECT AVG(points) FROM OfficialReviews WHERE contentID = NEW.contentID);
    SET v_weight = ROUND(
        CASE
            WHEN COALESCE(v_critic, 0) > 0 AND COALESCE(v_user, 0) > 0
                THEN 0.6 * v_critic + 0.4 * v_user
            WHEN COALESCE(v_critic, 0) > 0 THEN v_critic
            WHEN COALESCE(v_user, 0)   > 0 THEN v_user
            ELSE 0
        END, 2);

    UPDATE Content
    SET globalScore = COALESCE(v_user, 0),
        weightedScore = v_weight
    WHERE contentID = NEW.contentID;
END$$

-- Recompute globalScore and weightedScore after user rating delete
CREATE TRIGGER global_score_after_delete
AFTER DELETE ON RatingLog
FOR EACH ROW
BEGIN
    DECLARE v_critic DECIMAL(5,2);
    DECLARE v_user   DECIMAL(5,2);
    DECLARE v_weight DECIMAL(4,2);

    SET v_user   = (SELECT AVG(rating) FROM RatingLog WHERE contentID = OLD.contentID);
    SET v_critic = (SELECT AVG(points) FROM OfficialReviews WHERE contentID = OLD.contentID);
    SET v_weight = ROUND(
        CASE
            WHEN COALESCE(v_critic, 0) > 0 AND COALESCE(v_user, 0) > 0
                THEN 0.6 * v_critic + 0.4 * v_user
            WHEN COALESCE(v_critic, 0) > 0 THEN v_critic
            WHEN COALESCE(v_user, 0)   > 0 THEN v_user
            ELSE 0
        END, 2);

    UPDATE Content
    SET globalScore = COALESCE(v_user, 0),
        weightedScore = v_weight
    WHERE contentID = OLD.contentID;
END$$

DELIMITER ;

-- ── 4. Recreate ContentBrowseView to include weightedScore ────────────────────
CREATE OR REPLACE VIEW ContentBrowseView AS
SELECT
    c.contentID,
    c.title,
    c.genre,
    c.language,
    c.date,
    c.globalScore,
    c.criticScore,
    c.weightedScore,
    c.synopsis,
    c.duration,
    CASE
        WHEN m.contentID  IS NOT NULL THEN 'Movie'
        WHEN s.contentID  IS NOT NULL THEN 'Series'
        WHEN ls.contentID IS NOT NULL THEN 'LiveStream'
        ELSE 'ShortContent'
    END AS contentType
FROM Content c
LEFT JOIN Movies     m  ON m.contentID  = c.contentID
LEFT JOIN Series     s  ON s.contentID  = c.contentID
LEFT JOIN LiveStreams ls ON ls.contentID = c.contentID;

-- ── 5. Seed initial weightedScore values for existing data ────────────────────
UPDATE Content c
LEFT JOIN (
    SELECT c2.contentID,
        ROUND(
            CASE
                WHEN COALESCE(AVG(or2.points), 0) > 0 AND COALESCE(AVG(rl.rating), 0) > 0
                    THEN 0.6 * AVG(or2.points) + 0.4 * AVG(rl.rating)
                WHEN COALESCE(AVG(or2.points), 0) > 0 THEN AVG(or2.points)
                WHEN COALESCE(AVG(rl.rating),   0) > 0 THEN AVG(rl.rating)
                ELSE 0
            END, 2) as new_score
    FROM Content c2
    LEFT JOIN OfficialReviews or2 ON or2.contentID = c2.contentID
    LEFT JOIN RatingLog rl        ON rl.contentID  = c2.contentID
    GROUP BY c2.contentID
) as scores ON c.contentID = scores.contentID
SET c.weightedScore = scores.new_score;

SET FOREIGN_KEY_CHECKS = 1;
