-- ============================================================
-- Challenge content linking (specific items or type-based)
-- ============================================================

ALTER TABLE GroupChallenges
ADD COLUMN challengeType ENUM('specific', 'type_based') NOT NULL DEFAULT 'specific',
ADD COLUMN contentType VARCHAR(50) DEFAULT NULL,
ADD COLUMN genre VARCHAR(100) DEFAULT NULL,
ADD COLUMN requiredCount INT NOT NULL DEFAULT 1;

-- Content items required for specific-content challenges
CREATE TABLE IF NOT EXISTS ChallengeContent (
    challengeID INT,
    contentID INT,
    PRIMARY KEY (challengeID, contentID),
    FOREIGN KEY (challengeID) REFERENCES GroupChallenges (challengeID) ON DELETE CASCADE,
    FOREIGN KEY (contentID) REFERENCES Content (contentID) ON DELETE CASCADE
) ENGINE = InnoDB;