-- ============================================================
-- CINELOG DATABASE SCHEMA
-- CS 353-2 Database Systems - Group 4
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- CORE USER TABLES
-- ============================================================

-- Main users table - stores all user accounts
CREATE TABLE IF NOT EXISTS Users (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    age INT,
    name VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    listCount INT DEFAULT 0,
    password_hash VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

-- Standard (general viewer) users - subset of Users
CREATE TABLE IF NOT EXISTS StandardUsers (
    userID INT PRIMARY KEY,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Critics - verified reviewers with weighted scores
CREATE TABLE IF NOT EXISTS Critics (
    userID INT PRIMARY KEY,
    reviewCount INT DEFAULT 0,
    avgPointsGiven DECIMAL(5,2) DEFAULT 0.00,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Platform administrators
CREATE TABLE IF NOT EXISTS Admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(150) UNIQUE NOT NULL
) ENGINE=InnoDB;

-- ============================================================
-- SOCIAL TABLES
-- ============================================================

-- User-to-user follow relationships (self-referential)
CREATE TABLE IF NOT EXISTS Follower (
    followerID INT,
    followedID INT,
    PRIMARY KEY (followerID, followedID),
    FOREIGN KEY (followerID) REFERENCES Users(userID) ON DELETE CASCADE,
    FOREIGN KEY (followedID) REFERENCES Users(userID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- CONTENT CREATOR TABLES
-- ============================================================

-- Approved actors and directors on the platform
CREATE TABLE IF NOT EXISTS ApprovedContentCreator (
    creatorID INT AUTO_INCREMENT PRIMARY KEY,
    age INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    nationality VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    numOfFollowers INT DEFAULT 0
) ENGINE=InnoDB;

-- User follows a content creator (actor/director)
CREATE TABLE IF NOT EXISTS Follow (
    userID INT,
    creatorID INT,
    followedAt DATE,
    PRIMARY KEY (userID, creatorID),
    FOREIGN KEY (creatorID) REFERENCES ApprovedContentCreator(creatorID) ON DELETE CASCADE,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- CONTENT TABLES
-- ============================================================

-- Parent content table - all content types inherit from this
CREATE TABLE IF NOT EXISTS Content (
    contentID INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    date DATE,
    producer VARCHAR(200),
    genre VARCHAR(100),
    language VARCHAR(50),
    globalScore DECIMAL(4,2) DEFAULT 0.00,
    criticScore DECIMAL(4,2) DEFAULT 0.00,
    duration INT,
    synopsis TEXT
) ENGINE=InnoDB;

-- Movie subtype
CREATE TABLE IF NOT EXISTS Movies (
    contentID INT PRIMARY KEY,
    FOREIGN KEY (contentID) REFERENCES Content(contentID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Series subtype
CREATE TABLE IF NOT EXISTS Series (
    contentID INT PRIMARY KEY,
    FOREIGN KEY (contentID) REFERENCES Content(contentID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Live stream subtype (replays of sports/documentaries - not actually live)
CREATE TABLE IF NOT EXISTS LiveStreams (
    contentID INT PRIMARY KEY,
    FOREIGN KEY (contentID) REFERENCES Content(contentID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Short content subtype (trailers, summaries, clips)
CREATE TABLE IF NOT EXISTS ShortContents (
    contentID INT PRIMARY KEY,
    FOREIGN KEY (contentID) REFERENCES Content(contentID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Episodes belong to a Series (hierarchical dependency)
CREATE TABLE IF NOT EXISTS Episode (
    contentID INT,
    seasonNo INT,
    episodeNo INT,
    title VARCHAR(200),
    episodeRating DECIMAL(4,2),
    PRIMARY KEY (contentID, seasonNo, episodeNo),
    FOREIGN KEY (contentID) REFERENCES Series(contentID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Many-to-many: content creator participated in content
CREATE TABLE IF NOT EXISTS TakePart (
    creatorID INT,
    contentID INT,
    PRIMARY KEY (creatorID, contentID),
    FOREIGN KEY (creatorID) REFERENCES ApprovedContentCreator(creatorID) ON DELETE CASCADE,
    FOREIGN KEY (contentID) REFERENCES Content(contentID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- WATCHLIST TABLES
-- ============================================================

-- User-created watchlists (public or private)
CREATE TABLE IF NOT EXISTS WatchList (
    watchListID INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200),
    visibility VARCHAR(50) DEFAULT 'public',
    numOfContent INT DEFAULT 0,
    userID INT NOT NULL,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Junction table: which content is in which watchlist
CREATE TABLE IF NOT EXISTS WatchListContent (
    watchListID INT,
    contentID INT,
    PRIMARY KEY (watchListID, contentID),
    FOREIGN KEY (watchListID) REFERENCES WatchList(watchListID) ON DELETE CASCADE,
    FOREIGN KEY (contentID) REFERENCES Content(contentID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- LOG TABLES
-- ============================================================

-- Records when a user watched content and how much (percentage)
CREATE TABLE IF NOT EXISTS WatchLog (
    userID INT,
    contentID INT,
    timestamp DATETIME,
    percentage DECIMAL(5,2) DEFAULT 0.00,
    PRIMARY KEY (userID, contentID),
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE,
    FOREIGN KEY (contentID) REFERENCES Content(contentID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Records user ratings (1 rating per user per content - overwrites)
CREATE TABLE IF NOT EXISTS RatingLog (
    userID INT,
    contentID INT,
    rating INT,
    timestamp DATETIME,
    PRIMARY KEY (userID, contentID),
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE,
    FOREIGN KEY (contentID) REFERENCES Content(contentID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Records user comments (multiple comments allowed)
CREATE TABLE IF NOT EXISTS CommentLog (
    commentID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT,
    contentID INT,
    timestamp DATETIME,
    comment TEXT,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE,
    FOREIGN KEY (contentID) REFERENCES Content(contentID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- CLUB TABLES
-- ============================================================

-- Cinephile clubs based on shared interests
CREATE TABLE IF NOT EXISTS Club (
    clubID INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    numOfMembers INT DEFAULT 0
) ENGINE=InnoDB;

-- Junction table: which users belong to which club
CREATE TABLE IF NOT EXISTS UserClub (
    userID INT,
    clubID INT,
    joinDate DATE,
    PRIMARY KEY (userID, clubID),
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE,
    FOREIGN KEY (clubID) REFERENCES Club(clubID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- CRITERIA TABLES (for club membership requirements)
-- ============================================================

-- Base criteria table - clubs can have multiple criteria
CREATE TABLE IF NOT EXISTS Criteria (
    criteriaID INT AUTO_INCREMENT,
    clubID INT,
    PRIMARY KEY (criteriaID, clubID),
    FOREIGN KEY (clubID) REFERENCES Club(clubID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Celebrity-based criteria (follow a specific creator to join)
CREATE TABLE IF NOT EXISTS CelebrityCriteria (
    criteriaID INT,
    clubID INT,
    thresholdOfCelebrity DECIMAL(10,2),
    creatorID INT,
    PRIMARY KEY (criteriaID, clubID),
    FOREIGN KEY (criteriaID, clubID) REFERENCES Criteria(criteriaID, clubID) ON DELETE CASCADE,
    FOREIGN KEY (creatorID) REFERENCES ApprovedContentCreator(creatorID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Genre-based criteria (watch N% of a genre to join)
CREATE TABLE IF NOT EXISTS GenreCriteria (
    criteriaID INT,
    clubID INT,
    typeOfGenre VARCHAR(100),
    thresholdOfGenre DECIMAL(10,2),
    PRIMARY KEY (criteriaID, clubID),
    FOREIGN KEY (criteriaID, clubID) REFERENCES Criteria(criteriaID, clubID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Era-based criteria (watch films from a certain period)
CREATE TABLE IF NOT EXISTS EraCriteria (
    criteriaID INT,
    clubID INT,
    startOfEra DATE,
    endOfEra DATE,
    thresholdOfEra DECIMAL(10,2),
    PRIMARY KEY (criteriaID, clubID),
    FOREIGN KEY (criteriaID, clubID) REFERENCES Criteria(criteriaID, clubID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- OFFICIAL REVIEWS TABLE
-- ============================================================

-- Critic-submitted official reviews with weighted scoring
CREATE TABLE IF NOT EXISTS OfficialReviews (
    reviewID INT AUTO_INCREMENT PRIMARY KEY,
    points DECIMAL(5,2),
    review TEXT,
    criticUserID INT NOT NULL,
    contentID INT NOT NULL,
    UNIQUE KEY unique_critic_content (criticUserID, contentID),
    FOREIGN KEY (criticUserID) REFERENCES Critics(userID) ON DELETE CASCADE,
    FOREIGN KEY (contentID) REFERENCES Content(contentID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- GROUP CHALLENGES + BADGES
-- ============================================================

-- Club-specific group challenges with progress tracking
CREATE TABLE IF NOT EXISTS GroupChallenges (
    challengeID INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100),
    startDate DATE,
    endDate DATE,
    numOfMembers INT DEFAULT 0,
    groupProgress VARCHAR(100) DEFAULT 'Not Started',
    clubID INT NOT NULL,
    FOREIGN KEY (clubID) REFERENCES Club(clubID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Junction: users participating in group challenges
CREATE TABLE IF NOT EXISTS UserGroupChallenge (
    userID INT,
    challengeID INT,
    joinDate DATE,
    progress DECIMAL(5,2) DEFAULT 0.00,
    PRIMARY KEY (userID, challengeID),
    FOREIGN KEY (challengeID) REFERENCES GroupChallenges(challengeID) ON DELETE CASCADE,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Badges awarded upon challenge completion
CREATE TABLE IF NOT EXISTS Badge (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    explanation TEXT,
    challengeID INT NOT NULL,
    FOREIGN KEY (challengeID) REFERENCES GroupChallenges(challengeID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Junction: badges earned by users
CREATE TABLE IF NOT EXISTS UserBadge (
    userID INT,
    badgeID INT,
    earnedAt DATE,
    PRIMARY KEY (userID, badgeID),
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE,
    FOREIGN KEY (badgeID) REFERENCES Badge(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- WATCH PARTY TABLES
-- ============================================================

-- Watch parties at authorized cinemas (club events)
CREATE TABLE IF NOT EXISTS WatchParty (
    partyID INT AUTO_INCREMENT PRIMARY KEY,
    date DATETIME,
    authorizedCinema VARCHAR(200),
    capacity INT,
    contentID INT,
    clubID INT,
    FOREIGN KEY (contentID) REFERENCES Content(contentID) ON DELETE CASCADE,
    FOREIGN KEY (clubID) REFERENCES Club(clubID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Junction: users attending a watch party
CREATE TABLE IF NOT EXISTS WatchPartyUser (
    partyID INT,
    userID INT,
    PRIMARY KEY (partyID, userID),
    FOREIGN KEY (partyID) REFERENCES WatchParty(partyID) ON DELETE CASCADE,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- PERSONALISED FEED TABLES
-- ============================================================

-- User's personalised short content feed
CREATE TABLE IF NOT EXISTS Feed (
    feedID INT AUTO_INCREMENT PRIMARY KEY,
    mainCategory VARCHAR(100),
    numOfContents INT DEFAULT 0,
    userID INT,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Junction: which short contents appear in which feed
CREATE TABLE IF NOT EXISTS ShortContent_Feed_Stream (
    contentID INT,
    feedID INT,
    PRIMARY KEY (contentID, feedID),
    FOREIGN KEY (contentID) REFERENCES ShortContents(contentID) ON DELETE CASCADE,
    FOREIGN KEY (feedID) REFERENCES Feed(feedID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- REPORT TABLES
-- ============================================================

-- Base report entity
CREATE TABLE IF NOT EXISTS Report (
    reportID INT AUTO_INCREMENT PRIMARY KEY,
    date DATETIME,
    explanation VARCHAR(400) NOT NULL,
    adminID INT,
    FOREIGN KEY (adminID) REFERENCES Admin(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Content-specific reports
CREATE TABLE IF NOT EXISTS ContentReport (
    reportID INT PRIMARY KEY,
    contentID INT,
    FOREIGN KEY (reportID) REFERENCES Report(reportID) ON DELETE CASCADE,
    FOREIGN KEY (contentID) REFERENCES Content(contentID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- User-specific reports
CREATE TABLE IF NOT EXISTS UserReport (
    reportID INT PRIMARY KEY,
    userID INT,
    FOREIGN KEY (reportID) REFERENCES Report(reportID) ON DELETE CASCADE,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- CHECK CONSTRAINTS
-- ============================================================

-- Prevent self-following
ALTER TABLE Follower
    ADD CONSTRAINT chk_no_self_follow CHECK (followerID <> followedID);

-- Watch party must have positive capacity
ALTER TABLE WatchParty
    ADD CONSTRAINT chk_positive_capacity CHECK (capacity > 0);

-- Critic points must be between 0 and 10
ALTER TABLE OfficialReviews
    ADD CONSTRAINT chk_valid_points CHECK (points >= 0 AND points <= 10);

-- Watch percentage must be 0-100
ALTER TABLE WatchLog
    ADD CONSTRAINT chk_valid_percentage CHECK (percentage >= 0 AND percentage <= 100);

-- Challenge end date must be after start date
ALTER TABLE GroupChallenges
    ADD CONSTRAINT chk_challenge_dates CHECK (endDate > startDate);

-- ============================================================
-- VIEWS
-- ============================================================

-- View 1: ContentStatistics - unified stats per content item
CREATE OR REPLACE VIEW ContentStatistics AS
SELECT
    c.contentID,
    c.title,
    c.genre,
    c.language,
    c.duration,
    c.date,
    ROUND(AVG(rl.rating), 2)     AS avgUserRating,
    COUNT(DISTINCT rl.userID)    AS totalUserRatings,
    ROUND(AVG(or2.points), 2)    AS avgCriticScore,
    COUNT(DISTINCT or2.reviewID) AS totalCriticReviews,
    CASE
        WHEN m.contentID  IS NOT NULL THEN 'Movie'
        WHEN s.contentID  IS NOT NULL THEN 'Series'
        WHEN ls.contentID IS NOT NULL THEN 'LiveStream'
        ELSE 'ShortContent'
    END AS contentType
FROM Content c
LEFT JOIN RatingLog      rl  ON rl.contentID  = c.contentID
LEFT JOIN OfficialReviews or2 ON or2.contentID = c.contentID
LEFT JOIN Movies          m  ON m.contentID   = c.contentID
LEFT JOIN Series          s  ON s.contentID   = c.contentID
LEFT JOIN LiveStreams      ls ON ls.contentID  = c.contentID
LEFT JOIN ShortContents   sc ON sc.contentID  = c.contentID
GROUP BY c.contentID, c.title, c.genre, c.language, c.duration, c.date,
         m.contentID, s.contentID, ls.contentID;

-- View 2: UserActivitySummary - comprehensive activity per user
CREATE OR REPLACE VIEW UserActivitySummary AS
SELECT
    u.userID,
    u.username,
    u.email,
    COUNT(DISTINCT wl2.contentID)  AS watchedCount,
    ROUND(COALESCE(AVG(rl.rating), AVG(or2.points)), 2) AS avgRating,
    COUNT(DISTINCT wl.watchListID) AS watchListCount,
    COUNT(DISTINCT f.followedID)   AS followingCount,
    COUNT(DISTINCT f2.followerID)  AS followerCount,
    COUNT(DISTINCT uc.clubID)      AS clubCount,
    COUNT(DISTINCT ub.badgeID)     AS badgeCount,
    COUNT(DISTINCT or2.reviewID)   AS officialReviewCount
FROM Users u
LEFT JOIN WatchLog        wl2 ON wl2.userID       = u.userID
LEFT JOIN RatingLog       rl  ON rl.userID         = u.userID
LEFT JOIN WatchList       wl  ON wl.userID         = u.userID
LEFT JOIN Follower        f   ON f.followerID      = u.userID
LEFT JOIN Follower        f2  ON f2.followedID     = u.userID
LEFT JOIN UserClub        uc  ON uc.userID         = u.userID
LEFT JOIN UserBadge       ub  ON ub.userID         = u.userID
LEFT JOIN OfficialReviews or2 ON or2.criticUserID  = u.userID
GROUP BY u.userID, u.username, u.email;

-- View 3: ContentBrowseView - simplified browsing with content type
-- Note: weightedScore column is added in 06_schema_updates.sql and the view
-- is recreated there to include it.
CREATE OR REPLACE VIEW ContentBrowseView AS
SELECT
    c.contentID,
    c.title,
    c.genre,
    c.language,
    c.date,
    c.globalScore,
    c.criticScore,
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

-- View 4: UserWatchHistoryView - combined watch/rating/comment per user
CREATE OR REPLACE VIEW UserWatchHistoryView AS
SELECT
    wl.userID,
    wl.contentID,
    c.title,
    c.genre,
    rl.rating,
    wl.percentage,
    wl.timestamp,
    cl.comment
FROM WatchLog wl
JOIN Content c ON c.contentID = wl.contentID
LEFT JOIN RatingLog  rl ON rl.userID = wl.userID AND rl.contentID = wl.contentID
LEFT JOIN (
    SELECT userID, contentID, comment
    FROM CommentLog
    WHERE commentID IN (
        SELECT MAX(commentID) FROM CommentLog GROUP BY userID, contentID
    )
) cl ON cl.userID = wl.userID AND cl.contentID = wl.contentID;

-- View 5: WatchListSummary - watchlist metadata with actual content count
CREATE OR REPLACE VIEW WatchListSummary AS
SELECT
    wl.watchListID,
    wl.userID,
    wl.title,
    wl.visibility,
    COUNT(wlc.contentID) AS contentCount
FROM WatchList wl
LEFT JOIN WatchListContent wlc ON wlc.watchListID = wl.watchListID
GROUP BY wl.watchListID, wl.userID, wl.title, wl.visibility;

-- View 6: ClubMembersView - club membership with user details
CREATE OR REPLACE VIEW ClubMembersView AS
SELECT
    uc.clubID,
    u.userID,
    u.username,
    uc.joinDate
FROM UserClub uc
JOIN Users u ON u.userID = uc.userID;

-- View 7: UpcomingWatchParties - future parties with participant counts
CREATE OR REPLACE VIEW UpcomingWatchParties AS
SELECT
    wp.partyID,
    wp.clubID,
    c.title,
    wp.date,
    wp.authorizedCinema,
    wp.capacity,
    COUNT(wpu.userID) AS joined
FROM WatchParty wp
JOIN Content c ON c.contentID = wp.contentID
LEFT JOIN WatchPartyUser wpu ON wpu.partyID = wp.partyID
WHERE wp.date > NOW()
GROUP BY wp.partyID, wp.clubID, c.title, wp.date, wp.authorizedCinema, wp.capacity;

-- View 8: UserBadgesView - badges earned by users with metadata
CREATE OR REPLACE VIEW UserBadgesView AS
SELECT
    ub.userID,
    b.id   AS badgeID,
    b.name,
    b.explanation,
    ub.earnedAt
FROM UserBadge ub
JOIN Badge b ON b.id = ub.badgeID;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Trigger 1: Auto-increment watchlist content count on insert
DELIMITER $$
CREATE TRIGGER watchlist_content_added
AFTER INSERT ON WatchListContent
FOR EACH ROW
BEGIN
    UPDATE WatchList
    SET numOfContent = numOfContent + 1
    WHERE watchListID = NEW.watchListID;
END$$

-- Trigger 2: Auto-decrement watchlist content count on delete
CREATE TRIGGER watchlist_content_removed
AFTER DELETE ON WatchListContent
FOR EACH ROW
BEGIN
    UPDATE WatchList
    SET numOfContent = CASE
        WHEN numOfContent > 0 THEN numOfContent - 1
        ELSE 0
    END
    WHERE watchListID = OLD.watchListID;
END$$

-- Trigger 3: Auto-increment club member count when user joins
CREATE TRIGGER club_member_added
AFTER INSERT ON UserClub
FOR EACH ROW
BEGIN
    UPDATE Club
    SET numOfMembers = numOfMembers + 1
    WHERE clubID = NEW.clubID;
END$$

-- Trigger 4: Auto-decrement club member count when user leaves
CREATE TRIGGER club_member_removed
AFTER DELETE ON UserClub
FOR EACH ROW
BEGIN
    UPDATE Club
    SET numOfMembers = CASE
        WHEN numOfMembers > 0 THEN numOfMembers - 1
        ELSE 0
    END
    WHERE clubID = OLD.clubID;
END$$

-- Trigger 5: Recalculate criticScore when a new official review is inserted
CREATE TRIGGER critic_score_after_insert
AFTER INSERT ON OfficialReviews
FOR EACH ROW
BEGIN
    UPDATE Content
    SET criticScore = (
        SELECT AVG(points)
        FROM OfficialReviews
        WHERE contentID = NEW.contentID
    )
    WHERE contentID = NEW.contentID;
END$$

-- Trigger 6: Recalculate criticScore when an official review is updated
CREATE TRIGGER critic_score_after_update
AFTER UPDATE ON OfficialReviews
FOR EACH ROW
BEGIN
    UPDATE Content
    SET criticScore = (
        SELECT AVG(points)
        FROM OfficialReviews
        WHERE contentID = NEW.contentID
    )
    WHERE contentID = NEW.contentID;
END$$

-- Trigger 7: Recalculate criticScore when an official review is deleted
CREATE TRIGGER critic_score_after_delete
AFTER DELETE ON OfficialReviews
FOR EACH ROW
BEGIN
    UPDATE Content
    SET criticScore = (
        SELECT COALESCE(AVG(points), 0)
        FROM OfficialReviews
        WHERE contentID = OLD.contentID
    )
    WHERE contentID = OLD.contentID;
END$$

-- Trigger 8: Recalculate globalScore when a user rating is inserted
CREATE TRIGGER global_score_after_insert
AFTER INSERT ON RatingLog
FOR EACH ROW
BEGIN
    UPDATE Content
    SET globalScore = (
        SELECT AVG(rating)
        FROM RatingLog
        WHERE contentID = NEW.contentID
    )
    WHERE contentID = NEW.contentID;
END$$

-- Trigger 9: Recalculate globalScore when a user rating is updated
CREATE TRIGGER global_score_after_update
AFTER UPDATE ON RatingLog
FOR EACH ROW
BEGIN
    UPDATE Content
    SET globalScore = (
        SELECT AVG(rating)
        FROM RatingLog
        WHERE contentID = NEW.contentID
    )
    WHERE contentID = NEW.contentID;
END$$

-- Trigger 10: Recalculate globalScore when a user rating is deleted
CREATE TRIGGER global_score_after_delete
AFTER DELETE ON RatingLog
FOR EACH ROW
BEGIN
    UPDATE Content
    SET globalScore = (
        SELECT COALESCE(AVG(rating), 0)
        FROM RatingLog
        WHERE contentID = OLD.contentID
    )
    WHERE contentID = OLD.contentID;
END$$

DELIMITER ;
