-- ============================================================
-- Add CHECK constraints to prevent negative thresholds
-- ============================================================

ALTER TABLE GenreCriteria 
ADD CONSTRAINT chk_genre_threshold CHECK (thresholdOfGenre > 0);

ALTER TABLE CelebrityCriteria 
ADD CONSTRAINT chk_celebrity_threshold CHECK (thresholdOfCelebrity > 0);

ALTER TABLE EraCriteria 
ADD CONSTRAINT chk_era_threshold CHECK (thresholdOfEra > 0);

ALTER TABLE GroupChallenges 
ADD CONSTRAINT chk_challenge_required_count CHECK (requiredCount > 0);
