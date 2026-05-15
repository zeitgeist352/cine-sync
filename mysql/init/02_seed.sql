-- ============================================================
-- CINELOG SEED DATA
-- Realistic sample data to populate the platform
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- ADMIN
-- ============================================================
INSERT INTO Admin (id, name, email) VALUES
(1, 'Platform Admin', 'admin@cinelog.com');

-- ============================================================
-- USERS (passwords are bcrypt hashes of 'password123')
-- ============================================================
INSERT INTO Users (userID, username, email, age, name, lastName, password_hash) VALUES
(1,  'aral_m',    'aral@cinelog.com',   22, 'Aral',   'Müftüoğlu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMUCYQAAGz2qZ0.8JpJaGGzKe.'),
(2,  'husnu_a',   'husnu@cinelog.com',  23, 'Hüsnü',  'Arkca',     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMUCYQAAGz2qZ0.8JpJaGGzKe.'),
(3,  'mehmet_d',  'mehmet@cinelog.com', 22, 'Mehmet', 'Dizdar',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMUCYQAAGz2qZ0.8JpJaGGzKe.'),
(4,  'onur_y',    'onur@cinelog.com',   21, 'Onur',   'Yakar',     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMUCYQAAGz2qZ0.8JpJaGGzKe.'),
(5,  'yunus_a',   'yunus@cinelog.com',  22, 'Yunus',  'Aslan',     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMUCYQAAGz2qZ0.8JpJaGGzKe.'),
(6,  'sofia_q',   'sofia@cinelog.com',  28, 'Sofia',  'Qin',       '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMUCYQAAGz2qZ0.8JpJaGGzKe.'),
(7,  'leon_m',    'leon@cinelog.com',   31, 'Leon',   'Mertens',   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMUCYQAAGz2qZ0.8JpJaGGzKe.'),
(8,  'tariq_o',   'tariq@cinelog.com',  26, 'Tariq',  'Osman',     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMUCYQAAGz2qZ0.8JpJaGGzKe.'),
(9,  'hana_b',    'hana@cinelog.com',   29, 'Hana',   'Becker',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMUCYQAAGz2qZ0.8JpJaGGzKe.'),
(10, 'arthur_v',  'arthurv@cinelog.com',38, 'Arthur', 'Villeneuve','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMUCYQAAGz2qZ0.8JpJaGGzKe.'),
(11, 'mia_s',     'mia@cinelog.com',    34, 'Mia',    'Sorensen',  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMUCYQAAGz2qZ0.8JpJaGGzKe.'),
(12, 'james_ok',  'jamesk@cinelog.com', 41, 'James',  'Okonkwo',   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMUCYQAAGz2qZ0.8JpJaGGzKe.');

-- Standard users (userIDs 1-9)
INSERT INTO StandardUsers (userID) VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9);

-- Critics (userIDs 10-12)
INSERT INTO Critics (userID, reviewCount, avgPointsGiven) VALUES
(10, 0, 0.00),
(11, 0, 0.00),
(12, 0, 0.00);

-- ============================================================
-- APPROVED CONTENT CREATORS
-- ============================================================
INSERT INTO ApprovedContentCreator (creatorID, age, name, gender, nationality, role, numOfFollowers) VALUES
(1,  45, 'Elena Marchetti',    'Female', 'Italian',    'Actor',    1200),
(2,  38, 'James Holt',         'Male',   'British',    'Director', 850),
(3,  52, 'Yuki Tanaka',        'Female', 'Japanese',   'Actor',    990),
(4,  61, 'Arthur Villeneuve',  'Male',   'French',     'Director', 2300),
(5,  34, 'Sofia Reyes',        'Female', 'Mexican',    'Actor',    770),
(6,  47, 'Marcus Webb',        'Male',   'American',   'Director', 1050),
(7,  29, 'Lena Hoffmann',      'Female', 'German',     'Actor',    630),
(8,  55, 'Chen Wei',           'Male',   'Chinese',    'Director', 1780),
(9,  41, 'Priya Sharma',       'Female', 'Indian',     'Actor',    440),
(10, 36, 'Omar Al-Farsi',      'Male',   'Emirati',    'Actor',    320),
(11, 48, 'Nadia Kozlov',       'Female', 'Russian',    'Director', 560),
(12, 33, 'Diego Fuentes',      'Male',   'Spanish',    'Actor',    290),
(13, 57, 'Ingrid Larsen',      'Female', 'Norwegian',  'Director', 820),
(14, 43, 'Samuel Okafor',      'Male',   'Nigerian',   'Actor',    410),
(15, 39, 'Mei-Lin Zhao',       'Female', 'Chinese',    'Actor',    680);

-- ============================================================
-- CONTENT (Movies, Series, Short Contents)
-- ============================================================

-- Insert base Content rows
INSERT INTO Content (contentID, title, date, producer, genre, language, duration, synopsis, globalScore, criticScore) VALUES
(1,  'The Criterion Hour',     '2023-03-15', 'Prestige Films',   'Drama',    'English', 142, 'An extraordinary work of contemporary cinema that challenges the boundaries of its genre.',         8.70, 9.10),
(2,  'Neon Requiem',           '2024-01-20', 'NightOwl Prods',   'Thriller', 'English', 118, 'A neon-drenched thriller through the underbelly of a future megalopolis.',                          7.80, 7.00),
(3,  'Saltwater Dreams',       '2022-07-04', 'Coastal Films',    'Romance',  'English',  98, 'A bittersweet love story set against the backdrop of a coastal fishing village.',                  7.30, 6.80),
(4,  'Iron Meridian',          '2024-04-12', 'Apex Studios',     'Action',   'English', 135, 'A relentless action epic following a rogue mercenary across three continents.',                    8.10, 0.00),
(5,  'The Hollow Garden',      '2022-10-28', 'Dark Matter Films','Horror',   'English', 105, 'A chilling psychological horror that blurs the line between grief and the supernatural.',         8.40, 0.00),
(6,  'Orbital',                '2024-02-14', 'Cosmos Pictures',  'Sci-Fi',   'English', 162, 'A visually stunning sci-fi epic exploring humanity first contact with an alien civilisation.',     9.00, 9.40),
(7,  'Marble & Dust',          '2024-03-01', 'Arthaus Films',    'Drama',    'English', 127, 'A slow-burn drama set inside a crumbling Renaissance restoration project in Florence.',            7.50, 0.00),
(8,  'Crimson Dusk',           '2024-05-22', 'Frontier Prods',   'Western',  'English', 154, 'An epic revisionist western about justice, myth, and the last days of the frontier era.',         8.60, 0.00),
(9,  'The Glass Protocol',     '2023-11-10', 'Cipher Studios',   'Thriller', 'English', 111, 'A high-stakes espionage thriller where nothing is what it seems.',                                 7.90, 0.00),
(10, 'Silent Echoes',          '2023-06-20', 'Quiet Storm Films','Drama',    'English', 138, 'A meditation on loss and memory, told through a series of interconnected silent vignettes.',       8.20, 0.00),
-- Series
(11, 'Neon Nights',            '2024-01-08', 'StreamCorp',       'Sci-Fi',   'English',  45, 'A sci-fi anthology series exploring the dark side of technological progress.',                    8.50, 0.00),
(12, 'Space Cadets',           '2023-09-15', 'Orbital Media',    'Sci-Fi',   'English',  38, 'A coming-of-age series set aboard the first international youth space station.',                  8.30, 0.00),
(13, 'The Criterion Series',   '2022-04-01', 'Prestige Films',   'Drama',    'English',  55, 'A prestige drama following five interconnected families across three decades.',                    9.10, 0.00),
-- Live Streams
(14, 'Sci-Fi Cinema Symposium','2024-06-01', 'CineLog Live',     'Sci-Fi',   'English', 240, 'A live panel discussion with directors and actors from the sci-fi genre.',                         0.00, 0.00),
(15, 'World Cinema Retrospect','2024-03-20', 'CineLog Live',     'Drama',    'English', 180, 'A curated retrospective of world cinema classics with live commentary.',                           0.00, 0.00),
-- Short Contents
(16, 'Drama Behind Criterion',       '2023-04-01', 'Prestige Films',   'Drama',    'English', 12, 'Behind-the-scenes look at The Criterion Hour.',       0.00, 0.00),
(17, 'Orbital Extended Reel',        '2024-02-20', 'Cosmos Pictures',  'Sci-Fi',   'English', 18, 'Extended concept art and VFX breakdown for Orbital.',  0.00, 0.00),
(18, 'Neon Requiem Director Cut',    '2024-02-01', 'NightOwl Prods',   'Thriller', 'English',  8, 'Directors commentary on the opening sequence.',        0.00, 0.00),
(19, 'Saltwater Teaser',             '2022-06-15', 'Coastal Films',    'Romance',  'English',  3, 'Official teaser trailer for Saltwater Dreams.',        0.00, 0.00),
(20, 'The Horror Behind Garden',     '2022-11-01', 'Dark Matter Films','Horror',   'English', 15, 'Making-of documentary for The Hollow Garden.',         0.00, 0.00);

-- Subtype tables
INSERT INTO Movies (contentID) VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9),(10);
INSERT INTO Series (contentID) VALUES (11),(12),(13);
INSERT INTO LiveStreams (contentID) VALUES (14),(15);
INSERT INTO ShortContents (contentID) VALUES (16),(17),(18),(19),(20);

-- Episodes for series
INSERT INTO Episode (contentID, seasonNo, episodeNo, title, episodeRating) VALUES
(11, 1, 1, 'Pilot: Neon Genesis',      8.6),
(11, 1, 2, 'The Upload',               8.4),
(11, 1, 3, 'Ghost Protocol',           8.7),
(11, 1, 4, 'Data Storm',               8.2),
(11, 1, 5, 'Zero Hour',                9.1),
(12, 1, 1, 'Launch Day',               8.3),
(12, 1, 2, 'Weightless',               8.1),
(12, 1, 3, 'The Void Between',         8.5),
(13, 1, 1, 'Prologue: 1992',           9.2),
(13, 1, 2, 'The Inheritance',          8.9),
(13, 1, 3, 'Divided by Glass',         9.0),
(13, 2, 1, 'Twenty Years Later',       9.3),
(13, 2, 2, 'Echoes',                   9.1);

-- Content creator participation
INSERT INTO TakePart (creatorID, contentID) VALUES
(1,  1),(2,  1),(3,  1),   -- The Criterion Hour
(4,  2),(5,  2),           -- Neon Requiem
(6,  3),(7,  3),           -- Saltwater Dreams
(8,  4),(9,  4),(10, 4),   -- Iron Meridian
(11, 5),(12, 5),           -- The Hollow Garden
(1,  6),(2,  6),(3,  6),   -- Orbital (same cast as Criterion)
(4,  7),(13, 7),           -- Marble & Dust
(6,  8),(14, 8),           -- Crimson Dusk
(8,  9),(15, 9),           -- The Glass Protocol
(11,10),(7, 10),           -- Silent Echoes
(4, 11),(5, 11),           -- Neon Nights
(8, 12),(9, 12),           -- Space Cadets
(1, 13),(2, 13),(3, 13);   -- The Criterion Series

-- ============================================================
-- CLUBS
-- ============================================================
INSERT INTO Club (clubID, title, numOfMembers) VALUES
(1, 'Criterion Circle',   0),
(2, 'Neon Nights',        0),
(3, 'Space Cadets',       0),
(4, 'Spaghetti West',     0);

-- User-club memberships (triggers will update numOfMembers)
INSERT INTO UserClub (userID, clubID, joinDate) VALUES
(1, 1, '2024-01-12'), (2, 1, '2024-01-15'), (3, 1, '2024-02-01'),
(4, 1, '2024-02-10'), (5, 1, '2024-03-05'), (6, 1, '2024-03-12'),
(1, 3, '2024-01-20'), (4, 3, '2024-02-05'), (7, 3, '2024-02-18'),
(8, 2, '2024-02-01'), (9, 2, '2024-02-14'),
(5, 4, '2024-03-01'), (6, 4, '2024-03-10');

-- ============================================================
-- FOLLOWER RELATIONSHIPS (user → user)
-- ============================================================
INSERT INTO Follower (followerID, followedID) VALUES
(1, 2),(1, 3),(1, 7),
(2, 1),(2, 6),
(3, 1),(3, 4),
(4, 5),(4, 6),
(5, 1),(5, 8),
(6, 7),(6, 8),
(7, 1),(7, 2),
(8, 3),(8, 9);

-- User follows content creators
INSERT INTO Follow (userID, creatorID, followedAt) VALUES
(1, 1, '2024-01-15'),(1, 2, '2024-01-15'),(1, 4, '2024-02-10'),
(2, 1, '2024-02-01'),(2, 6, '2024-02-20'),
(3, 4, '2024-01-20'),(3, 8, '2024-03-01'),
(4, 2, '2024-02-14'),(4, 3, '2024-03-10'),
(5, 6, '2024-01-30');

-- ============================================================
-- WATCH LOGS (user watch history)
-- ============================================================
INSERT INTO WatchLog (userID, contentID, timestamp, percentage) VALUES
(1, 1, '2024-01-20 20:00:00', 100),(1, 2, '2024-01-25 21:00:00', 100),
(1, 3, '2024-02-01 19:30:00',  75),(1, 5, '2024-02-10 22:00:00', 100),
(1, 6, '2024-02-14 18:00:00', 100),(1, 7, '2024-03-01 20:00:00',  87),
(2, 1, '2024-01-22 20:00:00', 100),(2, 4, '2024-02-05 21:00:00', 100),
(2, 6, '2024-02-15 19:00:00',  60),(2, 8, '2024-03-10 20:00:00', 100),
(3, 2, '2024-02-01 21:00:00', 100),(3, 3, '2024-02-20 20:00:00', 100),
(3, 6, '2024-03-01 19:00:00', 100),(3,10, '2024-03-15 21:00:00',  50),
(4, 4, '2024-02-20 20:00:00', 100),(4, 5, '2024-02-28 22:00:00', 100),
(4, 8, '2024-03-12 21:00:00',  80),(4, 9, '2024-04-01 20:00:00', 100),
(5, 1, '2024-01-25 20:00:00', 100),(5, 6, '2024-02-18 19:00:00', 100),
(5, 7, '2024-03-05 21:00:00', 100),(5,10, '2024-03-20 20:00:00', 100),
(6, 2, '2024-02-10 21:00:00', 100),(6, 3, '2024-02-15 20:00:00',  65),
(6, 5, '2024-02-25 22:00:00', 100),(6, 8, '2024-03-15 21:00:00', 100),
(7, 6, '2024-02-20 19:00:00', 100),(7, 9, '2024-03-01 21:00:00', 100),
(7,10, '2024-03-10 20:00:00', 100),
(8, 1, '2024-02-25 20:00:00', 100),(8, 4, '2024-03-05 21:00:00', 100),
(8, 6, '2024-03-10 19:00:00',  95),
(9, 5, '2024-02-28 22:00:00', 100),(9,10, '2024-03-20 21:00:00', 100);

-- ============================================================
-- RATINGS
-- ============================================================
INSERT INTO RatingLog (userID, contentID, rating, timestamp) VALUES
(1, 1, 9, '2024-01-21 10:00:00'),(1, 2, 8, '2024-01-26 09:00:00'),
(1, 5, 8, '2024-02-11 10:00:00'),(1, 6, 9, '2024-02-15 11:00:00'),
(2, 1, 8, '2024-01-23 09:00:00'),(2, 4, 8, '2024-02-06 10:00:00'),
(2, 8, 9, '2024-03-11 09:00:00'),
(3, 2, 7, '2024-02-02 10:00:00'),(3, 3, 7, '2024-02-21 09:00:00'),
(3, 6, 9, '2024-03-02 10:00:00'),
(4, 4, 8, '2024-02-21 09:00:00'),(4, 5, 9, '2024-03-01 10:00:00'),
(4, 8, 8, '2024-03-13 09:00:00'),
(5, 1, 9, '2024-01-26 10:00:00'),(5, 6, 9, '2024-02-19 09:00:00'),
(5, 7, 8, '2024-03-06 10:00:00'),
(6, 2, 8, '2024-02-11 09:00:00'),(6, 5, 8, '2024-02-26 10:00:00'),
(6, 8, 9, '2024-03-16 09:00:00'),
(7, 6, 9, '2024-02-21 10:00:00'),(7, 9, 8, '2024-03-02 09:00:00'),
(8, 1, 9, '2024-02-26 10:00:00'),(8, 6, 9, '2024-03-11 09:00:00'),
(9, 5, 8, '2024-03-01 10:00:00'),(9,10, 8, '2024-03-21 09:00:00');

-- ============================================================
-- COMMENTS
-- ============================================================
INSERT INTO CommentLog (userID, contentID, timestamp, comment) VALUES
(1, 1, '2024-01-21 11:00:00', 'An absolute masterpiece. The cinematography is breathtaking.'),
(1, 6, '2024-02-15 12:00:00', 'One of the best sci-fi films I have ever seen. Stunning visuals.'),
(2, 1, '2024-01-23 10:00:00', 'Challenging but rewarding cinema. A must-watch.'),
(2, 8, '2024-03-11 11:00:00', 'Epic in every sense of the word. The best western in years.'),
(3, 6, '2024-03-02 11:00:00', 'The world-building is incredible. Cannot wait for more.'),
(4, 5, '2024-03-01 12:00:00', 'Genuinely terrifying. Slept with the lights on.'),
(5, 1, '2024-01-26 11:00:00', 'Emotional and beautiful. A rare gem.'),
(6, 8, '2024-03-16 12:00:00', 'A love letter to the western genre. Stunning performance.'),
(7, 6, '2024-02-21 11:00:00', 'Science fiction at its absolute finest.'),
(8, 1, '2024-02-26 11:00:00', 'Watched it twice already. Every scene is perfectly crafted.');

-- ============================================================
-- OFFICIAL REVIEWS (Critics)
-- Triggers will auto-update criticScore in Content table
-- ============================================================
INSERT INTO OfficialReviews (criticUserID, contentID, points, review) VALUES
(10, 1, 9.2, 'A towering achievement in contemporary filmmaking. The director use of negative space is nothing short of revelatory.'),
(10, 6, 9.5, 'Orbital redefines the scope of science fiction. The screenplay balances spectacle with intimacy in ways rarely seen.'),
(10, 2, 7.8, 'Neon Requiem delivers on its promises, though the third act falters slightly under the weight of its ambitions.'),
(11, 1, 9.0, 'A quietly devastating film. Every frame is composed with the precision of a master painter.'),
(11, 6, 9.3, 'The most ambitious film of the decade. An unmissable cinematic event.'),
(11, 3, 6.8, 'Saltwater Dreams is pleasant but ultimately too familiar in its emotional beats.'),
(12, 6, 9.4, 'Orbital is to this generation what 2001 was to another. A landmark achievement.'),
(12, 1, 9.1, 'The Criterion Hour announces a major new voice in world cinema. Extraordinary.'),
(12, 2, 7.2, 'Style over substance, but what style it is. Neon Requiem is at least unforgettable.');

-- Update critic statistics after reviews
UPDATE Critics SET
    reviewCount = (SELECT COUNT(*) FROM OfficialReviews WHERE criticUserID = 10),
    avgPointsGiven = (SELECT AVG(points) FROM OfficialReviews WHERE criticUserID = 10)
WHERE userID = 10;

UPDATE Critics SET
    reviewCount = (SELECT COUNT(*) FROM OfficialReviews WHERE criticUserID = 11),
    avgPointsGiven = (SELECT AVG(points) FROM OfficialReviews WHERE criticUserID = 11)
WHERE userID = 11;

UPDATE Critics SET
    reviewCount = (SELECT COUNT(*) FROM OfficialReviews WHERE criticUserID = 12),
    avgPointsGiven = (SELECT AVG(points) FROM OfficialReviews WHERE criticUserID = 12)
WHERE userID = 12;

-- ============================================================
-- WATCHLISTS
-- ============================================================
INSERT INTO WatchList (watchListID, title, visibility, numOfContent, userID) VALUES
(1, 'Must-Watch 2024',    'public',  0, 1),
(2, 'My Arthouse Picks',  'public',  0, 1),
(3, 'Private Queue',      'private', 0, 1),
(4, 'Sci-Fi Essentials',  'public',  0, 3),
(5, 'Best of Drama',      'public',  0, 5);

-- Add content to watchlists (triggers update numOfContent)
INSERT INTO WatchListContent (watchListID, contentID) VALUES
(1, 1),(1, 2),(1, 3),(1, 4),
(2, 1),(2, 7),(2, 10),(2, 13),
(3, 5),(3, 9),
(4, 6),(4, 11),(4, 12),
(5, 1),(5, 10),(5, 13);

-- ============================================================
-- WATCH PARTIES
-- ============================================================
INSERT INTO WatchParty (partyID, date, authorizedCinema, capacity, contentID, clubID) VALUES
(1, '2026-05-10 19:30:00', 'Bilkent Cinema Hall A',     54, 6,  1),
(2, '2026-05-22 20:00:00', 'Ankara CinemaPlus IMAX',    120, 8,  4),
(3, '2026-06-01 18:00:00', 'Bilkent Cinema Hall B',      40,12,  3),
(4, '2026-06-15 19:00:00', 'Metropol AVM Cinema',        80, 1,  1),
(5, '2026-07-04 20:30:00', 'ANKAmall Cinemaximum',       60,11,  2);

-- Watch party attendees
INSERT INTO WatchPartyUser (partyID, userID) VALUES
(1, 1),(1, 2),(1, 5),(1, 6),
(2, 4),(2, 6),(2, 8),
(3, 1),(3, 4),(3, 7),
(4, 1),(4, 2),(4, 3),
(5, 8),(5, 9);

-- ============================================================
-- GROUP CHALLENGES
-- ============================================================
INSERT INTO GroupChallenges (challengeID, title, startDate, endDate, numOfMembers, groupProgress, clubID) VALUES
(1, 'Watch 10 Films of 2024',    '2024-01-01', '2024-12-31', 0, '60%',         1),
(2, 'Sci-Fi Marathon',           '2024-06-01', '2024-09-30', 0, '30%',         2),
(3, 'Silent Era Exploration',    '2024-03-01', '2024-09-01', 0, '80%',         1),
(4, 'Foreign Language Deep Dive','2024-04-01', '2024-06-30', 0, '100%',        3);

-- User challenge participation
INSERT INTO UserGroupChallenge (userID, challengeID, joinDate, progress) VALUES
(1, 1, '2024-01-05', 60.00),(1, 3, '2024-03-05', 80.00),
(2, 1, '2024-01-10', 40.00),(2, 2, '2024-06-05', 30.00),
(3, 1, '2024-01-15', 50.00),(3, 3, '2024-03-10', 60.00),
(4, 2, '2024-06-08', 25.00),(4, 4, '2024-04-05', 100.00),
(5, 1, '2024-01-20', 70.00),(6, 1, '2024-02-01', 45.00),
(7, 2, '2024-06-10', 35.00),(8, 4, '2024-04-08', 100.00);

-- ============================================================
-- BADGES
-- ============================================================
INSERT INTO Badge (id, name, explanation, challengeID) VALUES
(1, 'Century Club',    'Watched at least 100 films across any genre throughout the year, proving true cinematic dedication.',  1),
(2, 'Space Explorer',  'Completed every screening in the Sci-Fi Marathon without missing a single designated title.',          2),
(3, 'Silent Pioneer',  'Watched at least 10 feature films from the silent era (pre-1930) as part of the historical challenge.',3),
(4, 'Globe Trotter',   'Watched 6 films in 6 different languages as part of the Foreign Language Deep Dive.',                  4),
(5, 'Critic\'s Eye',   'Submitted 50 rated reviews with commentary during the active challenge period.',                       1),
(6, 'Drama Devotee',   'Watched 20 drama titles logged and rated during the active challenge window.',                         1);

-- Award badges to users who completed challenges
INSERT INTO UserBadge (userID, badgeID, earnedAt) VALUES
(1, 1, '2024-07-15'),(1, 3, '2024-06-01'),(1, 5, '2024-07-20'),
(4, 4, '2024-06-30'),(8, 4, '2024-06-30'),
(5, 1, '2024-08-01'),(5, 6, '2024-07-22');

-- ============================================================
-- PERSONALISED FEEDS (one per user who has watch history)
-- ============================================================
INSERT INTO Feed (feedID, mainCategory, numOfContents, userID) VALUES
(1, 'Personalised', 0, 1),
(2, 'Personalised', 0, 2),
(3, 'Personalised', 0, 3);

-- Add short contents to feeds
INSERT INTO ShortContent_Feed_Stream (contentID, feedID) VALUES
(16, 1),(17, 1),(18, 1),(19, 1),(20, 1),
(16, 2),(17, 2),(20, 2),
(17, 3),(18, 3);

-- Update feed content counts
UPDATE Feed SET numOfContents = (
    SELECT COUNT(*) FROM ShortContent_Feed_Stream WHERE feedID = 1
) WHERE feedID = 1;

UPDATE Feed SET numOfContents = (
    SELECT COUNT(*) FROM ShortContent_Feed_Stream WHERE feedID = 2
) WHERE feedID = 2;

UPDATE Feed SET numOfContents = (
    SELECT COUNT(*) FROM ShortContent_Feed_Stream WHERE feedID = 3
) WHERE feedID = 3;


-- ============================================================
-- ADDITIONAL USERS (IDs 13-21)
-- All passwords are 'password123'
-- ============================================================
INSERT INTO Users (userID, username, email, age, name, lastName, password_hash) VALUES
(13, 'priya_k',   'priya@cinelog.com',   27, 'Priya',   'Kumar',     '$2b$12$jYiMLIJWxbDYLhehMcz/1.TRFm.Q/jH9.KAzK8DHJIJvV7kGgwwAa'),
(14, 'felix_w',   'felix@cinelog.com',   33, 'Felix',   'Wagner',    '$2b$12$jYiMLIJWxbDYLhehMcz/1.TRFm.Q/jH9.KAzK8DHJIJvV7kGgwwAa'),
(15, 'yuki_r',    'yuki@cinelog.com',    25, 'Yuki',    'Ran',       '$2b$12$jYiMLIJWxbDYLhehMcz/1.TRFm.Q/jH9.KAzK8DHJIJvV7kGgwwAa'),
(16, 'nadia_t',   'nadia@cinelog.com',   30, 'Nadia',   'Talib',     '$2b$12$jYiMLIJWxbDYLhehMcz/1.TRFm.Q/jH9.KAzK8DHJIJvV7kGgwwAa'),
(17, 'carlos_v',  'carlos@cinelog.com',  36, 'Carlos',  'Vega',      '$2b$12$jYiMLIJWxbDYLhehMcz/1.TRFm.Q/jH9.KAzK8DHJIJvV7kGgwwAa'),
-- Additional critics
(18, 'eva_n',     'eva@cinelog.com',     44, 'Eva',     'Novak',     '$2b$12$jYiMLIJWxbDYLhehMcz/1.TRFm.Q/jH9.KAzK8DHJIJvV7kGgwwAa'),
(19, 'kenji_o',   'kenji@cinelog.com',   39, 'Kenji',   'Oda',       '$2b$12$jYiMLIJWxbDYLhehMcz/1.TRFm.Q/jH9.KAzK8DHJIJvV7kGgwwAa'),
(20, 'amara_d',   'amara@cinelog.com',   31, 'Amara',   'Diallo',    '$2b$12$jYiMLIJWxbDYLhehMcz/1.TRFm.Q/jH9.KAzK8DHJIJvV7kGgwwAa');

INSERT INTO StandardUsers (userID) VALUES (13),(14),(15),(16),(17);
INSERT INTO Critics (userID, reviewCount, avgPointsGiven) VALUES
(18, 0, 0.00),
(19, 0, 0.00),
(20, 0, 0.00);

-- ============================================================
-- ADDITIONAL CONTENT CREATORS (IDs 16-25)
-- ============================================================
INSERT INTO ApprovedContentCreator (creatorID, age, name, gender, nationality, role, numOfFollowers) VALUES
(16, 42, 'Valentina Cruz',    'Female', 'Argentine', 'Director', 1100),
(17, 37, 'Hiroshi Nakamura',  'Male',   'Japanese',  'Actor',    740),
(18, 51, 'Fatima Al-Hassan',  'Female', 'Moroccan',  'Director', 630),
(19, 44, 'Lucas Petit',       'Male',   'French',    'Actor',    510),
(20, 28, 'Amara Nwosu',       'Female', 'Nigerian',  'Actor',    890),
(21, 58, 'Viktor Sokolov',    'Male',   'Russian',   'Director', 1420),
(22, 35, 'Isabella Torres',   'Female', 'Colombian', 'Actor',    670),
(23, 47, 'Raj Patel',         'Male',   'Indian',    'Director', 980),
(24, 32, 'Chloe Dubois',      'Female', 'French',    'Actor',    420),
(25, 63, 'Eduardo Ferreira',  'Male',   'Brazilian', 'Director', 1750);

-- ============================================================
-- ADDITIONAL CONTENT (IDs 21-55)
-- ============================================================

-- More Movies (21-40)
INSERT INTO Content (contentID, title, date, producer, genre, language, duration, synopsis, globalScore, criticScore) VALUES
(21, 'The Departed Shore',      '2023-08-18', 'Tide Films',        'Drama',     'English', 132, 'A retired sailor revisits the coastal town where his life fell apart thirty years ago.',           8.00, 0.00),
(22, 'Midnight in Algiers',     '2023-05-12', 'Mediterranean Pics','Thriller',  'French',  108, 'A French intelligence officer uncovers a conspiracy stretching from Paris to North Africa.',       8.30, 8.60),
(23, 'The Quantum Paradox',     '2024-03-07', 'Nova Studios',      'Sci-Fi',    'English', 145, 'A physicist discovers that every decision she makes splits reality into parallel universes.',       8.70, 9.00),
(24, 'Crimson Petals',          '2022-11-25', 'Iberia Films',      'Romance',   'Spanish', 101, 'A flamenco dancer and a painter fall in love during the Festival of Lights in Seville.',           7.40, 7.20),
(25, 'Shadow Protocol',         '2024-05-30', 'Black Ops Prods',   'Action',    'English', 128, 'A covert operative goes rogue when she discovers her own agency has been compromised.',            7.90, 0.00),
(26, 'The Last Archipelago',    '2023-09-22', 'Ocean Films',       'Adventure', 'English', 148, 'An expedition team discovers an uncharted island chain with an ancient civilisation still intact.', 8.40, 8.10),
(27, 'Echoes of Tomorrow',      '2023-07-14', 'Sakura Studios',    'Sci-Fi',    'Japanese',119, 'A time-traveller from 2095 arrives in present-day Tokyo to prevent a catastrophic war.',            8.90, 9.20),
(28, 'The Witness Tree',        '2022-06-01', 'Roots Pictures',    'Drama',     'English', 155, 'A century-old oak tree becomes the silent witness to three generations of a Southern family.',      7.80, 8.00),
(29, 'Storm Front',             '2024-01-19', 'Tempest Prods',     'Thriller',  'English', 102, 'A storm chaser stumbles upon a dark secret buried beneath a Midwestern small town.',               7.60, 0.00),
(30, 'Eternal Recursion',       '2023-12-08', 'Loop Films',        'Horror',    'English', 114, 'A programmer realises she is trapped inside an endlessly repeating simulation.',                   8.20, 8.50),
(31, 'The Velvet Underground',  '2022-03-19', 'Prague Films',      'Historical','Czech',   139, 'A forbidden love story set against the backdrop of the 1968 Prague Spring.',                       8.60, 9.10),
(32, 'Desert Rain',             '2023-06-30', 'Sahara Pictures',   'Drama',     'Arabic',  126, 'A nomadic family navigates drought and conflict across the shifting sands of the Maghreb.',         8.10, 8.40),
(33, 'Northern Passage',        '2024-02-28', 'Arctic Films',      'Adventure', 'Norwegian',143,'A solo kayaker attempts to cross the Northwest Passage and confronts the raw power of the Arctic.', 8.50, 0.00),
(34, 'The Atlas Codex',         '2023-04-14', 'Labyrinth Films',   'Mystery',   'English', 116, 'An antiquarian bookseller uncovers a medieval manuscript that rewrites the history of Europe.',    8.00, 8.20),
(35, 'Zero Gravity',            '2024-04-03', 'Cosmos 2 Pics',     'Sci-Fi',    'English', 160, 'The first all-civilian crew to orbit Mars must survive when their ship is struck by a micrometeorite.',8.60,0.00),
(36, 'The Golden Ratio',        '2022-09-09', 'Fibonacci Films',   'Mystery',   'Italian', 122, 'A forensic mathematician hunts a serial killer who leaves victims arranged in perfect spirals.',    8.30, 8.70),
(37, 'Bloodlines',              '2023-11-03', 'Crimson Prods',     'Thriller',  'English', 130, 'Identical twins discover they were separated at birth — and one has become a hitman.',              8.10, 0.00),
(38, 'The Cartographer Dream',  '2022-08-21', 'Frontier Maps',     'Adventure', 'English', 136, 'A 19th-century cartographer sets out to map the unmapped interior of the Congo Basin.',            7.90, 8.30),
(39, 'Last Light',              '2024-06-12', 'Dusk Studios',      'Drama',     'English', 109, 'A lighthouse keeper on a remote Scottish island receives a mysterious distress signal.',            7.70, 0.00),
(40, 'The Colour of Sound',     '2023-02-17', 'Synesthesia Films', 'Drama',     'English', 123, 'A deaf composer learns to experience music through colour after a life-changing surgery.',          8.80, 9.30),

-- Additional Series (41-45)
(41, 'Dark Matter Chronicles',  '2024-01-15', 'Quantum Media',     'Sci-Fi',    'English',  50, 'An anthology series exploring the terrifying possibilities of dark matter manipulation.',          8.70, 0.00),
(42, 'The Archipelago Files',   '2023-08-01', 'Island Studios',    'Thriller',  'English',  44, 'A detective series set across a chain of remote islands where every resident hides a secret.',    8.40, 0.00),
(43, 'Parallel Lives',          '2022-10-10', 'Mirror Prods',      'Drama',     'English',  52, 'Six strangers discover they are living parallel versions of the same life in different cities.',   9.00, 0.00),
(44, 'Quantum Shift',           '2024-03-20', 'Nexus TV',          'Sci-Fi',    'English',  41, 'A quantum physicist accidentally merges timelines and must restore the original without erasing it.',8.50,0.00),
(45, 'The Lost Meridian',       '2023-06-15', 'Compass Prods',     'Adventure', 'English',  48, 'An exploration team following a Victorian-era treasure map uncovers more than they bargained for.',8.20,0.00),

-- Additional Short Contents (46-55)
(46, 'Quantum Paradox VFX Reel',     '2024-03-15', 'Nova Studios',      'Sci-Fi',    'English',  14, 'Behind-the-scenes VFX breakdown for The Quantum Paradox.',       0.00, 0.00),
(47, 'Echoes of Tomorrow Teaser',    '2023-06-01', 'Sakura Studios',    'Sci-Fi',    'Japanese',  4, 'Official teaser trailer for Echoes of Tomorrow.',                0.00, 0.00),
(48, 'The Colour of Sound Clip',     '2023-01-20', 'Synesthesia Films', 'Drama',     'English',   6, 'Extended opening scene from The Colour of Sound.',               0.00, 0.00),
(49, 'Storm Front Behind Scenes',    '2024-01-25', 'Tempest Prods',     'Thriller',  'English',  10, 'Cast interviews and stunt choreography for Storm Front.',        0.00, 0.00),
(50, 'Dark Matter Chronicles Ep1',   '2024-01-16', 'Quantum Media',     'Sci-Fi',    'English',   5, 'First-episode recap of Dark Matter Chronicles.',                 0.00, 0.00),
(51, 'Midnight in Algiers Trailer',  '2023-04-10', 'Mediterranean Pics','Thriller',  'French',    3, 'Official international trailer for Midnight in Algiers.',        0.00, 0.00),
(52, 'The Velvet Underground Clip',  '2022-02-28', 'Prague Films',      'Historical','Czech',      7, 'Exclusive clip: the ballroom scene from The Velvet Underground.', 0.00, 0.00),
(53, 'Desert Rain Making Of',        '2023-07-08', 'Sahara Pictures',   'Drama',     'Arabic',    11, 'Production diary from the Sahara shoot of Desert Rain.',         0.00, 0.00),
(54, 'Zero Gravity Concept Art',     '2024-03-28', 'Cosmos 2 Pics',     'Sci-Fi',    'English',    9, 'Production design and concept art for Zero Gravity.',            0.00, 0.00),
(55, 'Last Light Short Film',        '2024-05-01', 'Dusk Studios',      'Drama',     'English',   18, 'A standalone short film set in the same universe as Last Light.', 0.00, 0.00);

-- Subtype classification
INSERT INTO Movies (contentID) VALUES
(21),(22),(23),(24),(25),(26),(27),(28),(29),(30),
(31),(32),(33),(34),(35),(36),(37),(38),(39),(40);

INSERT INTO Series (contentID) VALUES (41),(42),(43),(44),(45);

INSERT INTO ShortContents (contentID) VALUES
(46),(47),(48),(49),(50),(51),(52),(53),(54),(55);

-- Episodes for new series
INSERT INTO Episode (contentID, seasonNo, episodeNo, title, episodeRating) VALUES
-- Dark Matter Chronicles
(41, 1, 1, 'The Dark Side of Mass',   8.8),
(41, 1, 2, 'Singularity',             8.6),
(41, 1, 3, 'The Void Between',        8.9),
(41, 1, 4, 'Collapse',               9.0),
(41, 1, 5, 'Event Horizon',           9.2),
(41, 2, 1, 'Resurrection',            8.7),
(41, 2, 2, 'Cascade Effect',          8.5),
-- The Archipelago Files
(42, 1, 1, 'First Island',            8.3),
(42, 1, 2, 'The Lighthouse Keeper',   8.5),
(42, 1, 3, 'Undertow',               8.4),
(42, 1, 4, 'The Hidden Cove',         8.6),
(42, 2, 1, 'New Tides',              8.7),
(42, 2, 2, 'The Storm Season',        8.8),
-- Parallel Lives
(43, 1, 1, 'Six Beginnings',          9.1),
(43, 1, 2, 'Mirrors',                 8.9),
(43, 1, 3, 'Convergence',             9.2),
(43, 1, 4, 'The Crossing Point',      9.0),
(43, 1, 5, 'Divergence',              8.8),
(43, 2, 1, 'New Parallels',           9.3),
-- Quantum Shift
(44, 1, 1, 'The First Merge',         8.4),
(44, 1, 2, 'Ripple Effect',           8.6),
(44, 1, 3, 'The Paradox Engine',      8.8),
(44, 1, 4, 'Unravelling',             8.5),
-- The Lost Meridian
(45, 1, 1, 'The Map',                 8.2),
(45, 1, 2, 'Into the Interior',       8.3),
(45, 1, 3, 'Ancient Markers',         8.5),
(45, 1, 4, 'The Hidden City',         8.7),
(45, 1, 5, 'The Final Meridian',      8.9);

-- TakePart: creators in new content
INSERT INTO TakePart (creatorID, contentID) VALUES
(16, 21),(7,  21),   -- The Departed Shore
(18, 22),(19, 22),   -- Midnight in Algiers
(1,  23),(17, 23),(21,23), -- The Quantum Paradox
(22, 24),(5,  24),   -- Crimson Petals
(6,  25),(10, 25),   -- Shadow Protocol
(13, 26),(14, 26),   -- The Last Archipelago
(17, 27),(21, 27),   -- Echoes of Tomorrow
(7,  28),(9,  28),   -- The Witness Tree
(22, 29),(12, 29),   -- Storm Front
(11, 30),(23, 30),   -- Eternal Recursion
(21, 31),(19, 31),   -- The Velvet Underground
(18, 32),(20, 32),   -- Desert Rain
(16, 33),(13, 33),   -- Northern Passage
(2,  34),(24, 34),   -- The Atlas Codex
(1,  35),(17, 35),   -- Zero Gravity
(4,  36),(25, 36),   -- The Golden Ratio
(15, 37),(22, 37),   -- Bloodlines
(25, 38),(14, 38),   -- The Cartographer Dream
(23, 39),(7,  39),   -- Last Light
(17, 40),(24, 40),   -- The Colour of Sound
(21, 41),(1,  41),   -- Dark Matter Chronicles
(16, 42),(20, 42),   -- The Archipelago Files
(23, 43),(22, 43),   -- Parallel Lives
(17, 44),(21, 44),   -- Quantum Shift
(25, 45),(14, 45);   -- The Lost Meridian

-- ============================================================
-- ADDITIONAL CLUBS
-- ============================================================
INSERT INTO Club (clubID, title, numOfMembers) VALUES
(5, 'Arthouse Collective', 0),
(6, 'World Cinema Club',   0),
(7, 'Thriller Society',    0);

INSERT INTO UserClub (userID, clubID, joinDate) VALUES
(6, 5, '2024-04-01'),(7, 5, '2024-04-05'),(10, 5, '2024-04-10'),
(11, 5, '2024-04-12'),(13, 5, '2024-04-15'),
(3, 6, '2024-03-15'),(8, 6, '2024-03-20'),(14, 6, '2024-03-25'),
(15, 6, '2024-04-01'),(18, 6, '2024-04-08'),
(2, 7, '2024-02-15'),(4, 7, '2024-02-20'),(9, 7, '2024-02-25'),
(16, 7, '2024-03-01'),(17, 7, '2024-03-05');

-- ============================================================
-- ADDITIONAL WATCH LOGS
-- ============================================================
INSERT INTO WatchLog (userID, contentID, timestamp, percentage) VALUES
-- User 13 (priya_k)
(13, 23, '2024-03-10 20:00:00', 100),(13, 27, '2024-03-15 19:30:00', 100),
(13, 40, '2024-04-01 21:00:00', 100),(13, 31, '2024-04-10 20:00:00', 100),
(13, 22, '2024-04-20 19:00:00',  85),
-- User 14 (felix_w)
(14, 26, '2024-03-12 20:30:00', 100),(14, 33, '2024-04-02 19:00:00', 100),
(14, 36, '2024-04-15 21:00:00', 100),(14, 38, '2024-05-01 20:00:00',  72),
-- User 15 (yuki_r)
(15, 27, '2024-03-20 20:00:00', 100),(15, 23, '2024-04-05 19:30:00', 100),
(15, 41, '2024-04-12 21:00:00',  90),(15, 44, '2024-04-25 20:00:00', 100),
-- User 16 (nadia_t)
(16, 22, '2024-04-01 20:00:00', 100),(16, 29, '2024-04-08 21:00:00', 100),
(16, 37, '2024-04-15 20:00:00', 100),(16, 30, '2024-05-01 22:00:00',  95),
-- User 17 (carlos_v)
(17, 24, '2024-03-15 20:00:00', 100),(17, 32, '2024-04-01 19:30:00', 100),
(17, 43, '2024-04-10 21:00:00', 100),
-- Existing users watching new content
(1, 23, '2024-04-01 20:00:00', 100),(1, 27, '2024-04-15 19:00:00', 100),
(1, 40, '2024-05-01 21:00:00', 100),
(2, 22, '2024-04-05 20:00:00', 100),(2, 30, '2024-04-20 21:00:00', 100),
(3, 27, '2024-04-08 19:30:00', 100),(3, 31, '2024-04-25 20:00:00', 100),
(4, 23, '2024-04-10 20:00:00', 100),(4, 36, '2024-05-02 21:00:00', 100),
(5, 40, '2024-04-12 19:00:00', 100),(5, 43, '2024-05-05 20:00:00', 100),
(6, 22, '2024-04-15 20:00:00', 100),(6, 31, '2024-05-01 21:00:00',  80),
(7, 23, '2024-04-18 20:00:00', 100),(7, 40, '2024-05-08 19:00:00', 100),
(8, 27, '2024-04-20 21:00:00', 100),(8, 26, '2024-05-10 20:00:00', 100),
(9, 30, '2024-04-22 22:00:00', 100),(9, 22, '2024-05-12 20:00:00', 100);

-- ============================================================
-- ADDITIONAL RATINGS
-- ============================================================
INSERT INTO RatingLog (userID, contentID, rating, timestamp) VALUES
(13, 23, 9, '2024-03-11 09:00:00'),(13, 27, 9, '2024-03-16 10:00:00'),
(13, 40, 9, '2024-04-02 09:00:00'),(13, 31, 9, '2024-04-11 10:00:00'),
(14, 26, 8, '2024-03-13 09:00:00'),(14, 33, 8, '2024-04-03 10:00:00'),
(14, 36, 9, '2024-04-16 09:00:00'),
(15, 27, 9, '2024-03-21 10:00:00'),(15, 23, 9, '2024-04-06 09:00:00'),
(16, 22, 8, '2024-04-02 10:00:00'),(16, 29, 8, '2024-04-09 09:00:00'),
(16, 37, 8, '2024-04-16 10:00:00'),(16, 30, 9, '2024-05-02 09:00:00'),
(17, 24, 7, '2024-03-16 10:00:00'),(17, 32, 8, '2024-04-02 09:00:00'),
(1,  23, 9, '2024-04-02 10:00:00'),(1,  27, 9, '2024-04-16 09:00:00'),
(1,  40, 9, '2024-05-02 10:00:00'),
(2,  22, 8, '2024-04-06 10:00:00'),(2,  30, 9, '2024-04-21 09:00:00'),
(3,  27, 9, '2024-04-09 10:00:00'),(3,  31, 9, '2024-04-26 09:00:00'),
(4,  23, 8, '2024-04-11 10:00:00'),(4,  36, 9, '2024-05-03 09:00:00'),
(5,  40, 9, '2024-04-13 10:00:00'),(5,  43, 9, '2024-05-06 09:00:00'),
(6,  22, 8, '2024-04-16 10:00:00'),
(7,  23, 9, '2024-04-19 09:00:00'),(7,  40, 9, '2024-05-09 10:00:00'),
(8,  27, 9, '2024-04-21 09:00:00'),(8,  26, 8, '2024-05-11 10:00:00'),
(9,  30, 9, '2024-04-23 09:00:00'),(9,  22, 8, '2024-05-13 10:00:00');

-- ============================================================
-- ADDITIONAL COMMENTS
-- ============================================================
INSERT INTO CommentLog (userID, contentID, timestamp, comment) VALUES
(13, 23, '2024-03-11 10:00:00', 'Mind-bending concept executed flawlessly. The multiverse theory feels terrifyingly real.'),
(13, 27, '2024-03-16 11:00:00', 'A Japanese sci-fi masterpiece. The time-travel logic is airtight and emotionally devastating.'),
(13, 40, '2024-04-02 10:30:00', 'One of the most beautiful films I have ever seen. The synesthesia sequences are extraordinary.'),
(14, 26, '2024-03-13 10:00:00', 'Pure adventure cinema at its finest. The island discovery sequence had me on the edge of my seat.'),
(14, 36, '2024-04-16 10:30:00', 'The Golden Ratio is a love letter to Italian cinema. Visually stunning and intellectually gripping.'),
(15, 27, '2024-03-21 11:00:00', 'Nakamura is phenomenal. One of the best performance I have seen all year.'),
(15, 23, '2024-04-06 10:00:00', 'The Quantum Paradox does for multiverse theory what Inception did for dreams. Essential viewing.'),
(16, 22, '2024-04-02 11:00:00', 'Midnight in Algiers is tense from the very first frame. A genuine thriller classic in the making.'),
(16, 30, '2024-05-02 10:00:00', 'Eternal Recursion got under my skin in the best possible way. Cannot stop thinking about the ending.'),
(17, 32, '2024-04-02 10:30:00', 'Desert Rain is quiet and devastating. A film that trusts its audience completely.'),
(1,  27, '2024-04-16 11:00:00', 'Echoes of Tomorrow proves that Japanese sci-fi cinema is in a league of its own.'),
(2,  30, '2024-04-21 10:00:00', 'The most unsettling horror film since The Hollow Garden. Eternal Recursion is a nightmare you never want to leave.'),
(3,  31, '2024-04-26 10:30:00', 'The Velvet Underground is a hidden gem. Beautifully restrained and deeply moving.'),
(4,  23, '2024-04-11 11:00:00', 'Finally a sci-fi film that takes its science seriously without losing its humanity.'),
(5,  40, '2024-04-13 10:00:00', 'The Colour of Sound made me cry three times. The most moving film of the year by far.'),
(6,  22, '2024-04-16 10:30:00', 'Gripping from start to finish. The Algeria sequences feel completely authentic.'),
(7,  40, '2024-05-09 11:00:00', 'Rarely does a film make you see the world differently. The Colour of Sound changed mine.'),
(8,  26, '2024-05-11 10:00:00', 'The Last Archipelago is exactly the kind of blockbuster adventure we needed. Old-school thrills.'),
(9,  22, '2024-05-13 10:30:00', 'Midnight in Algiers deserves far more attention. A masterclass in sustained tension.');

-- ============================================================
-- ADDITIONAL OFFICIAL REVIEWS (Critics 18-20)
-- ============================================================
INSERT INTO OfficialReviews (criticUserID, contentID, points, review) VALUES
-- Eva Novak (18)
(18, 23, 9.1, 'The Quantum Paradox is the rare sci-fi film that uses its high concept not as spectacle but as emotional scaffolding. A stunning achievement.'),
(18, 40, 9.4, 'The Colour of Sound is devastating, transcendent cinema. Director Ferreira has created something genuinely irreplaceable.'),
(18, 27, 9.0, 'Echoes of Tomorrow confirms that Nakamura is one of the great screen presences of his generation. A film of immense precision and feeling.'),
(18, 31, 9.2, 'The Velvet Underground is the most important historical drama in years. Sokolov handles the material with extraordinary delicacy.'),
(18, 22, 8.5, 'Midnight in Algiers delivers everything a great thriller should: mounting dread, moral ambiguity, and a final act that earns its revelations.'),
-- Kenji Oda (19)
(19, 27, 9.3, 'As a film critic specialising in Japanese cinema, I can say without hesitation that Echoes of Tomorrow is a landmark work. Nakamura is extraordinary.'),
(19, 23, 8.8, 'Inventive, emotionally resonant and technically impeccable. The Quantum Paradox sets a new bar for intelligent blockbuster filmmaking.'),
(19, 40, 9.5, 'I wept. The Colour of Sound is the most purely cinematic experience I have had in twenty years of reviewing films.'),
(19, 36, 8.7, 'The Golden Ratio is Patel at his most assured. The mystery plot is almost secondary to the atmosphere he conjures from every frame.'),
(19, 32, 8.4, 'Desert Rain asks profound questions about belonging, loss, and resilience with an economy of means that shames larger productions.'),
-- Amara Diallo (20)
(20, 40, 9.2, 'A film so emotionally precise it leaves marks. The Colour of Sound is the rare work that justifies every superlative thrown at it.'),
(20, 31, 8.9, 'History as felt experience rather than lesson. The Velvet Underground is profoundly human cinema.'),
(20, 22, 8.7, 'Midnight in Algiers represents a new high-water mark for the Franco-African thriller. Taut, intelligent, and absolutely riveting.'),
(20, 32, 8.6, 'Desert Rain has the patience and wisdom of a film made by someone who has genuinely lived every moment it depicts. Extraordinary.'),
(20, 26, 8.1, 'The Last Archipelago is breathtaking entertainment that never forgets to be a film about people. A rare blockbuster with genuine heart.');

-- Update critic stats for new critics
UPDATE Critics SET
    reviewCount = (SELECT COUNT(*) FROM OfficialReviews WHERE criticUserID = 18),
    avgPointsGiven = (SELECT AVG(points) FROM OfficialReviews WHERE criticUserID = 18)
WHERE userID = 18;

UPDATE Critics SET
    reviewCount = (SELECT COUNT(*) FROM OfficialReviews WHERE criticUserID = 19),
    avgPointsGiven = (SELECT AVG(points) FROM OfficialReviews WHERE criticUserID = 19)
WHERE userID = 19;

UPDATE Critics SET
    reviewCount = (SELECT COUNT(*) FROM OfficialReviews WHERE criticUserID = 20),
    avgPointsGiven = (SELECT AVG(points) FROM OfficialReviews WHERE criticUserID = 20)
WHERE userID = 20;

-- ============================================================
-- ADDITIONAL WATCHLISTS
-- ============================================================
INSERT INTO WatchList (watchListID, title, visibility, numOfContent, userID) VALUES
(6, 'Japanese Gems',        'public',  0, 15),
(7, 'Thriller Collection',  'public',  0, 16),
(8, 'Drama Essentials',     'public',  0, 13),
(9, 'Sci-Fi Odyssey',       'public',  0, 14);

INSERT INTO WatchListContent (watchListID, contentID) VALUES
(6, 27),(6, 17),(6, 47),
(7, 22),(7, 29),(7, 37),(7, 42),
(8, 28),(8, 32),(8, 40),(8, 43),
(9, 23),(9, 35),(9, 41),(9, 44);

-- ============================================================
-- ADDITIONAL FEEDS
-- ============================================================
INSERT INTO Feed (feedID, mainCategory, numOfContents, userID) VALUES
(4, 'Personalised', 0, 13),
(5, 'Personalised', 0, 14),
(6, 'Personalised', 0, 15);

INSERT INTO ShortContent_Feed_Stream (contentID, feedID) VALUES
(46, 4),(47, 4),(48, 4),(50, 4),
(49, 5),(51, 5),(52, 5),(54, 5),
(47, 6),(50, 6),(53, 6),(55, 6);

UPDATE Feed SET numOfContents = (SELECT COUNT(*) FROM ShortContent_Feed_Stream WHERE feedID = 4) WHERE feedID = 4;
UPDATE Feed SET numOfContents = (SELECT COUNT(*) FROM ShortContent_Feed_Stream WHERE feedID = 5) WHERE feedID = 5;
UPDATE Feed SET numOfContents = (SELECT COUNT(*) FROM ShortContent_Feed_Stream WHERE feedID = 6) WHERE feedID = 6;

-- ============================================================
-- ADDITIONAL FOLLOW RELATIONSHIPS
-- ============================================================
INSERT INTO Follower (followerID, followedID) VALUES
(13, 1),(13, 5),(13, 15),
(14, 3),(14, 8),(14, 13),
(15, 13),(15, 7),(15, 14),
(16, 2),(16, 9),
(17, 1),(17, 5),(17, 13),
(1, 13),(2, 14),(3, 15),
(5, 16),(6, 17);

INSERT INTO Follow (userID, creatorID, followedAt) VALUES
(13, 17, '2024-03-15'),(13, 21, '2024-04-01'),(13, 25, '2024-04-10'),
(14, 16, '2024-03-15'),(14, 25, '2024-04-05'),
(15, 17, '2024-03-20'),(15, 21, '2024-04-08'),
(16, 18, '2024-04-01'),(16, 22, '2024-04-15'),
(17, 22, '2024-03-15'),(17, 25, '2024-04-01');

-- ============================================================
-- ADDITIONAL GROUP CHALLENGES
-- ============================================================
INSERT INTO GroupChallenges (challengeID, title, startDate, endDate, numOfMembers, groupProgress, clubID) VALUES
(5, 'World Cinema Month',       '2024-05-01', '2024-05-31', 0, '45%', 6),
(6, 'Sci-Fi Binge 2024',        '2024-07-01', '2024-08-31', 0, '20%', 7),
(7, 'Arthouse Masters',         '2024-04-01', '2024-07-31', 0, '55%', 5);

INSERT INTO UserGroupChallenge (userID, challengeID, joinDate, progress) VALUES
(3, 5, '2024-05-01', 45.00),(8, 5, '2024-05-02', 40.00),
(14, 5, '2024-05-03', 50.00),(15, 5, '2024-05-04', 35.00),
(18, 5, '2024-05-05', 60.00),
(2, 6, '2024-07-01', 20.00),(4, 6, '2024-07-03', 25.00),
(9, 6, '2024-07-05', 15.00),(16, 6, '2024-07-06', 30.00),
(6, 7, '2024-04-01', 55.00),(7, 7, '2024-04-02', 50.00),
(10, 7, '2024-04-05', 0.00),(13, 7, '2024-04-08', 45.00);

-- Additional badges for new challenges
INSERT INTO Badge (id, name, explanation, challengeID) VALUES
(7, 'World Traveller',  'Watched films in at least 5 different languages during World Cinema Month.',       5),
(8, 'Galaxy Brain',     'Completed every screening in the Sci-Fi Binge 2024 challenge.',                   6),
(9, 'Arthouse Master',  'Watched 15 arthouse films curated by the Arthouse Collective during the challenge.',7);

SET FOREIGN_KEY_CHECKS = 1;
