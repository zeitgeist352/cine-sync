-- ============================================================
-- CLUB CRITERIA SEED DATA
-- Adds watch-history prerequisites for joining clubs
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ── Criterion Circle (clubID=1) ────────────────────────────────────────────────
-- Must have watched at least 3 Drama films
INSERT INTO Criteria (criteriaID, clubID) VALUES (1, 1);
INSERT INTO GenreCriteria (criteriaID, clubID, typeOfGenre, thresholdOfGenre) VALUES
(1, 1, 'Drama', 3);

-- ── Neon Nights (clubID=2) ────────────────────────────────────────────────────
-- Must have watched at least 2 Sci-Fi films
INSERT INTO Criteria (criteriaID, clubID) VALUES (2, 2);
INSERT INTO GenreCriteria (criteriaID, clubID, typeOfGenre, thresholdOfGenre) VALUES
(2, 2, 'Sci-Fi', 2);

-- ── Space Cadets (clubID=3) ───────────────────────────────────────────────────
-- Must have watched at least 3 Sci-Fi films
INSERT INTO Criteria (criteriaID, clubID) VALUES (3, 3);
INSERT INTO GenreCriteria (criteriaID, clubID, typeOfGenre, thresholdOfGenre) VALUES
(3, 3, 'Sci-Fi', 3);

-- ── Spaghetti West (clubID=4) ─────────────────────────────────────────────────
-- Must have watched at least 1 Western film
INSERT INTO Criteria (criteriaID, clubID) VALUES (4, 4);
INSERT INTO GenreCriteria (criteriaID, clubID, typeOfGenre, thresholdOfGenre) VALUES
(4, 4, 'Western', 1);

-- ── Arthouse Collective (clubID=5) ────────────────────────────────────────────
-- Must follow director Arthur Villeneuve (creatorID=4)
INSERT INTO Criteria (criteriaID, clubID) VALUES (5, 5);
INSERT INTO CelebrityCriteria (criteriaID, clubID, thresholdOfCelebrity, creatorID) VALUES
(5, 5, 1, 4);

-- ── World Cinema Club (clubID=6) ──────────────────────────────────────────────
-- Must have watched at least 2 films from 2020-2024 era
INSERT INTO Criteria (criteriaID, clubID) VALUES (6, 6);
INSERT INTO EraCriteria (criteriaID, clubID, startOfEra, endOfEra, thresholdOfEra) VALUES
(6, 6, '2020-01-01', '2024-12-31', 2);

-- ── Thriller Society (clubID=7) ───────────────────────────────────────────────
-- Must have watched at least 2 Thriller films
INSERT INTO Criteria (criteriaID, clubID) VALUES (7, 7);
INSERT INTO GenreCriteria (criteriaID, clubID, typeOfGenre, thresholdOfGenre) VALUES
(7, 7, 'Thriller', 2);

SET FOREIGN_KEY_CHECKS = 1;
