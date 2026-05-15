-- Remove existing ratings for Series
DELETE FROM RatingLog WHERE contentID IN (SELECT contentID FROM Series);
DELETE FROM OfficialReviews WHERE contentID IN (SELECT contentID FROM Series);

-- Create EpisodeRatingLog table
CREATE TABLE IF NOT EXISTS EpisodeRatingLog (
    userID INT,
    contentID INT,
    seasonNo INT,
    episodeNo INT,
    rating INT,
    timestamp DATETIME,
    PRIMARY KEY (userID, contentID, seasonNo, episodeNo),
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE,
    FOREIGN KEY (contentID, seasonNo, episodeNo) REFERENCES Episode(contentID, seasonNo, episodeNo) ON DELETE CASCADE
) ENGINE=InnoDB;

DELIMITER $$

-- Triggers for EpisodeRatingLog to update Episode.episodeRating
CREATE TRIGGER episode_rating_after_insert
AFTER INSERT ON EpisodeRatingLog
FOR EACH ROW
BEGIN
    UPDATE Episode
    SET episodeRating = (
        SELECT AVG(rating) FROM EpisodeRatingLog
        WHERE contentID = NEW.contentID AND seasonNo = NEW.seasonNo AND episodeNo = NEW.episodeNo
    )
    WHERE contentID = NEW.contentID AND seasonNo = NEW.seasonNo AND episodeNo = NEW.episodeNo;
END$$

CREATE TRIGGER episode_rating_after_update
AFTER UPDATE ON EpisodeRatingLog
FOR EACH ROW
BEGIN
    UPDATE Episode
    SET episodeRating = (
        SELECT AVG(rating) FROM EpisodeRatingLog
        WHERE contentID = NEW.contentID AND seasonNo = NEW.seasonNo AND episodeNo = NEW.episodeNo
    )
    WHERE contentID = NEW.contentID AND seasonNo = NEW.seasonNo AND episodeNo = NEW.episodeNo;
END$$

CREATE TRIGGER episode_rating_after_delete
AFTER DELETE ON EpisodeRatingLog
FOR EACH ROW
BEGIN
    UPDATE Episode
    SET episodeRating = (
        SELECT COALESCE(AVG(rating), NULL) FROM EpisodeRatingLog
        WHERE contentID = OLD.contentID AND seasonNo = OLD.seasonNo AND episodeNo = OLD.episodeNo
    )
    WHERE contentID = OLD.contentID AND seasonNo = OLD.seasonNo AND episodeNo = OLD.episodeNo;
END$$

-- Create trigger on Episode update to recalculate Series globalScore
DROP TRIGGER IF EXISTS series_score_after_episode_update$$

CREATE TRIGGER series_score_after_episode_update
AFTER UPDATE ON Episode
FOR EACH ROW
BEGIN
    DECLARE v_critic DECIMAL(5,2);
    DECLARE v_user   DECIMAL(5,2);
    DECLARE v_weight DECIMAL(4,2);

    -- Calculate the average of episode ratings
    SET v_user = (SELECT AVG(episodeRating) FROM Episode WHERE contentID = NEW.contentID AND episodeRating IS NOT NULL);
    
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

DELIMITER ;
