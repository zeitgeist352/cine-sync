-- ============================================================
-- 09_short_contents.sql
-- 1. Fix TakePart for existing ShortContents (16-20, 46-55)
-- 2. Fix globalScore for existing ShortContents
-- 3. Add 60 new ShortContents (56-115) with TakePart entries
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ── Fix globalScore for existing ShortContents (all were 0.00) ────────────────

UPDATE Content SET globalScore = 7.80 WHERE contentID = 16;  -- Drama Behind Criterion
UPDATE Content SET globalScore = 8.30 WHERE contentID = 17;  -- Orbital Extended Reel
UPDATE Content SET globalScore = 7.50 WHERE contentID = 18;  -- Neon Requiem Director Cut
UPDATE Content SET globalScore = 7.20 WHERE contentID = 19;  -- Saltwater Teaser
UPDATE Content SET globalScore = 8.10 WHERE contentID = 20;  -- The Horror Behind Garden
UPDATE Content SET globalScore = 8.50 WHERE contentID = 46;  -- Quantum Paradox VFX Reel
UPDATE Content SET globalScore = 8.70 WHERE contentID = 47;  -- Echoes of Tomorrow Teaser
UPDATE Content SET globalScore = 8.60 WHERE contentID = 48;  -- The Colour of Sound Clip
UPDATE Content SET globalScore = 7.40 WHERE contentID = 49;  -- Storm Front Behind Scenes
UPDATE Content SET globalScore = 8.40 WHERE contentID = 50;  -- Dark Matter Chronicles Ep1
UPDATE Content SET globalScore = 8.00 WHERE contentID = 51;  -- Midnight in Algiers Trailer
UPDATE Content SET globalScore = 8.20 WHERE contentID = 52;  -- The Velvet Underground Clip
UPDATE Content SET globalScore = 7.90 WHERE contentID = 53;  -- Desert Rain Making Of
UPDATE Content SET globalScore = 8.30 WHERE contentID = 54;  -- Zero Gravity Concept Art
UPDATE Content SET globalScore = 7.70 WHERE contentID = 55;  -- Last Light Short Film

-- ── TakePart for existing ShortContents 16-20 ────────────────────────────────
-- Linked to same creators as their parent films

INSERT IGNORE INTO TakePart (creatorID, contentID) VALUES
(1,  16),(2,  16),   -- Drama Behind Criterion  → Criterion Hour creators (Elena, James)
(1,  17),(3,  17),   -- Orbital Extended Reel   → Orbital creators (Elena, Yuki)
(4,  18),(5,  18),   -- Neon Requiem Director    → Neon Requiem creators (Arthur, Sofia)
(6,  19),(7,  19),   -- Saltwater Teaser         → Saltwater Dreams creators (Marcus, Lena)
(11, 20),(7,  20);   -- Horror Behind Garden     → Hollow Garden creators (Nadia, Lena)

-- ── TakePart for existing ShortContents 46-55 ────────────────────────────────

INSERT IGNORE INTO TakePart (creatorID, contentID) VALUES
(1,  46),(8,  46),   -- Quantum Paradox VFX Reel      → Sci-Fi creators (Elena, Chen Wei)
(3,  47),(13, 47),   -- Echoes of Tomorrow Teaser      → Sci-Fi creators (Yuki, Ingrid)
(7,  48),(9,  48),   -- The Colour of Sound Clip       → Drama creators (Lena, Priya)
(2,  49),(10, 49),   -- Storm Front Behind Scenes      → Thriller creators (James, Omar)
(3,  50),(8,  50),   -- Dark Matter Chronicles Ep1     → Sci-Fi creators (Yuki, Chen Wei)
(2,  51),(11, 51),   -- Midnight in Algiers Trailer    → Thriller creators (James, Nadia)
(7,  52),(14, 52),   -- The Velvet Underground Clip    → Drama/Historical (Lena, Samuel)
(9,  53),(14, 53),   -- Desert Rain Making Of          → Drama creators (Priya, Samuel)
(1,  54),(8,  54),   -- Zero Gravity Concept Art       → Sci-Fi creators (Elena, Chen Wei)
(7,  55),(9,  55);   -- Last Light Short Film          → Drama creators (Lena, Priya)

-- ============================================================
-- NEW SHORT CONTENTS (IDs 56-115) — 60 entries
-- ============================================================

INSERT INTO Content (contentID, title, date, producer, genre, language, duration, synopsis, globalScore, criticScore) VALUES

-- ── DRAMA (56-67) ─────────────────────────────────────────────────────────────
(56,  'The Empty Chair',              '2023-05-10', 'Prestige Films',    'Drama',     'English',  14, 'A short film about a family gathering around the absence of someone who will never return.',     8.60, 0.00),
(57,  'One Last Letter',              '2024-01-18', 'Quiet Storm Films', 'Drama',     'English',  11, 'An elderly man dictates one final letter to a son who stopped writing back twenty years ago.',   8.30, 0.00),
(58,  'Unfinished Canvas',            '2023-09-22', 'Arthaus Films',     'Drama',     'English',  17, 'A painter struggling with tremors fights to complete her final work before she loses her hands.', 8.80, 0.00),
(59,  'The Inheritance',              '2022-11-14', 'Tide Films',        'Drama',     'English',   9, 'Three siblings gather to divide an estate and instead uncover a lifetime of kept secrets.',       7.90, 0.00),
(60,  'Borrowed Light',               '2024-03-07', 'Dusk Studios',      'Drama',     'English',  16, 'A hospice nurse spends one night listening to the stories of the patients in her care.',         9.10, 0.00),
(61,  'The Long Way Home',            '2023-07-29', 'Roots Pictures',    'Drama',     'English',  12, 'A soldier returning from overseas takes the longest possible route back to his family.',          8.40, 0.00),
(62,  'Secondhand',                   '2024-02-11', 'Synesthesia Films', 'Drama',     'English',  18, 'A short about a woman who discovers her donated belongings were never passed on.',               8.00, 0.00),
(63,  'Still Life with Father',       '2023-04-30', 'Mirror Prods',      'Drama',     'English',  13, 'A grown daughter visits her estranged father in a care home for what may be the last time.',     8.70, 0.00),
(64,  'The Understudy',               '2024-05-16', 'Arthaus Films',     'Drama',     'English',  10, 'A theatre understudy finally gets her moment — and freezes on a completely empty stage.',        7.60, 0.00),
(65,  'Glass Half',                   '2023-02-08', 'Prestige Films',    'Drama',     'English',  15, 'Two strangers share a table at a closing restaurant and compare very different lives.',           8.20, 0.00),
(66,  'The Cartographer of Grief',    '2024-04-22', 'Quiet Storm Films', 'Drama',     'English',  19, 'A widow maps out every location that held meaning in her 40-year marriage.',                    9.00, 0.00),
(67,  'Night Shift',                  '2023-11-05', 'Dusk Studios',      'Drama',     'English',  11, 'A hospital porter and a junior surgeon share one long night between emergencies.',               8.10, 0.00),

-- ── SCI-FI (68-77) ────────────────────────────────────────────────────────────
(68,  'Signal to Noise',              '2024-01-30', 'Cosmos Pictures',   'Sci-Fi',    'English',  16, 'The last human radio operator tries to make contact with any surviving station in the world.',   8.70, 0.00),
(69,  'Iteration',                    '2023-08-14', 'Nova Studios',      'Sci-Fi',    'English',  12, 'A scientist running a consciousness-upload experiment realises she has already done this before.', 9.20, 0.00),
(70,  'The Observatory',              '2024-03-25', 'Quantum Media',     'Sci-Fi',    'English',  14, 'An astronomer detects a pattern in deep space that matches her own heartbeat.',                  8.50, 0.00),
(71,  'Cold Boot',                    '2023-12-03', 'StreamCorp',        'Sci-Fi',    'English',   8, 'A decommissioned android reboots in an empty factory and tries to understand what year it is.',  8.30, 0.00),
(72,  'The Pale Frequency',           '2024-05-09', 'Cosmos 2 Pics',     'Sci-Fi',    'English',  17, 'A short film in which every human on Earth receives the same dream on the same night.',          8.90, 0.00),
(73,  'Last Orbit',                   '2023-10-18', 'Orbital Media',     'Sci-Fi',    'English',  10, 'An ageing space station records its final orbit before controlled deorbit.',                     8.00, 0.00),
(74,  'The Cartesian Divide',         '2024-02-28', 'Sakura Studios',    'Sci-Fi',    'Japanese',  13, 'A philosopher and an AI debate which of them is truly conscious, with only one judge.',         9.00, 0.00),
(75,  'Residual Self',                '2023-06-22', 'Nova Studios',      'Sci-Fi',    'English',  15, 'A digital copy of a deceased woman keeps sending messages to her family two years later.',       8.60, 0.00),
(76,  'First Contact Protocol',       '2024-04-14', 'Cosmos Pictures',   'Sci-Fi',    'English',  18, 'Scientists argue about what to broadcast back after receiving the first confirmed alien signal.',  9.10, 0.00),
(77,  'Dead Star',                    '2023-03-17', 'Quantum Media',     'Sci-Fi',    'English',  11, 'The light of a dead star reaches Earth — and something comes with it.',                          8.40, 0.00),

-- ── THRILLER (78-86) ──────────────────────────────────────────────────────────
(78,  'The Layover',                  '2024-01-12', 'NightOwl Prods',    'Thriller',  'English',  13, 'A passenger stranded overnight at an airport realises she is being followed.',                   8.20, 0.00),
(79,  'Proof of Life',                '2023-09-05', 'Cipher Studios',    'Thriller',  'English',  10, 'A hostage negotiator receives a call she suspects is from inside her own house.',                8.70, 0.00),
(80,  'Double Exposure',              '2024-03-18', 'Mediterranean Pics','Thriller',  'French',   14, 'A photographer develops an old roll of film and finds herself in images taken before she existed.', 8.40, 0.00),
(81,  'The Witness',                  '2023-07-11', 'Tempest Prods',     'Thriller',  'English',  16, 'A retired detective receives a letter claiming that the wrong man was convicted thirty years ago.',  8.60, 0.00),
(82,  'Safe Word',                    '2024-02-05', 'Crimson Prods',     'Thriller',  'English',   9, 'A couple playing a mystery game realise one of them is not playing.',                            8.10, 0.00),
(83,  'The Handler',                  '2023-11-28', 'Island Studios',    'Thriller',  'English',  18, 'A fixer is tasked with making a problem disappear — except the problem is her client.',          8.80, 0.00),
(84,  'Blind Spot',                   '2024-05-02', 'Black Ops Prods',   'Thriller',  'English',  12, 'A traffic camera analyst spots the same car passing the same point every night at 3AM.',         7.90, 0.00),
(85,  'The Revision',                 '2023-05-20', 'NightOwl Prods',    'Thriller',  'English',  15, 'An editor correcting a manuscript realises the fictional killer is describing real murders.',     8.30, 0.00),
(86,  'Off the Record',               '2024-06-01', 'Cipher Studios',    'Thriller',  'English',  11, 'A journalist destroys her notes after a source is killed — only to receive them back.',           8.00, 0.00),

-- ── ACTION (87-94) ────────────────────────────────────────────────────────────
(87,  'Breach',                       '2024-04-08', 'Apex Studios',      'Action',    'English',  12, 'A security specialist has seven minutes to stop a breach before the building goes into lockdown.', 8.30, 0.00),
(88,  'The Extraction',               '2023-10-24', 'Black Ops Prods',   'Action',    'English',  14, 'A field operative must extract an asset through a city that has already closed down around her.',  8.60, 0.00),
(89,  'Checkpoint',                   '2024-02-17', 'Frontier Prods',    'Action',    'English',  10, 'A border checkpoint agent faces an impossible decision as a caravan arrives after curfew.',       8.00, 0.00),
(90,  'Red Line',                     '2023-08-31', 'Apex Studios',      'Action',    'English',  16, 'A metro driver races to evacuate a train after discovering a bomb with twelve minutes on the clock.', 8.50, 0.00),
(91,  'Point of Entry',               '2024-01-26', 'Black Ops Prods',   'Action',    'English',  18, 'An elite infiltrator walks into the most guarded building in the world with no weapons at all.',  8.80, 0.00),
(92,  'Last Detail',                  '2023-06-15', 'Frontier Prods',    'Action',    'English',  13, 'Two soldiers are given one last mission neither of them believes they will survive.',             8.20, 0.00),
(93,  'Overrun',                      '2024-03-30', 'Apex Studios',      'Action',    'English',  11, 'A single guard defends a perimeter for as long as it takes backup to arrive.',                   7.80, 0.00),
(94,  'Clean Break',                  '2023-12-20', 'Black Ops Prods',   'Action',    'English',  15, 'A getaway driver is given one job: do not look in the bag.',                                    8.40, 0.00),

-- ── HORROR (95-100) ───────────────────────────────────────────────────────────
(95,  'The 3AM Rule',                 '2023-10-31', 'Dark Matter Films', 'Horror',    'English',  16, 'A sleep researcher documents what happens when she stays awake past the point of no return.',    8.70, 0.00),
(96,  'Negative Space',               '2024-01-13', 'Loop Films',        'Horror',    'English',  12, 'A photographer editing her shots realises a figure she cannot account for appears in every one.',  8.40, 0.00),
(97,  'The Tenant',                   '2023-09-08', 'Dark Matter Films', 'Horror',    'English',  14, 'A woman moves into a new flat and finds the previous tenant never officially left.',              8.20, 0.00),
(98,  'Correspondence',               '2024-04-05', 'Loop Films',        'Horror',    'English',  10, 'A grieving man receives handwritten letters from his deceased wife, postmarked after her death.',  8.60, 0.00),
(99,  'The Sound Below',              '2023-06-17', 'Dark Matter Films', 'Horror',    'English',  18, 'A downstairs neighbour complains about noise from an apartment that has been empty for a year.',   9.00, 0.00),
(100, 'Exposure',                     '2024-02-29', 'Loop Films',        'Horror',    'English',  13, 'A darkroom photographer develops film from a camera found at a crime scene.',                     8.30, 0.00),

-- ── ROMANCE (101-105) ─────────────────────────────────────────────────────────
(101, 'The Same Bench',               '2023-07-14', 'Coastal Films',     'Romance',   'English',  15, 'Two strangers sit on the same park bench every day for a year without ever speaking first.',     8.10, 0.00),
(102, 'Long Distance',                '2024-03-01', 'Iberia Films',      'Romance',   'Spanish',  12, 'A couple separated by a twelve-hour time difference fall in love entirely over voice messages.',  8.40, 0.00),
(103, 'The Anniversary',              '2023-11-20', 'Coastal Films',     'Romance',   'English',  17, 'A husband recreates their first date for his wife who no longer remembers it.',                  9.20, 0.00),
(104, 'Reread',                       '2024-01-08', 'Arthaus Films',     'Romance',   'English',  11, 'A woman rereads the margins of every book her ex ever lent her, then mails them all back.',      7.80, 0.00),
(105, 'Meet Me at Closing Time',      '2023-08-25', 'Coastal Films',     'Romance',   'English',  14, 'Two bookshop employees race to confess before one of them starts a new job in another city.',    8.60, 0.00),

-- ── ADVENTURE (106-110) ───────────────────────────────────────────────────────
(106, 'The Last Crossing',            '2024-05-18', 'Ocean Films',       'Adventure', 'English',  18, 'A ferryman makes one final crossing on a river that will be dammed in the morning.',             8.50, 0.00),
(107, 'Summit',                       '2023-09-10', 'Arctic Films',      'Adventure', 'Norwegian', 14, 'A climber reaches the top of a mountain she was told she would never climb again.',             8.70, 0.00),
(108, 'The Trailhead',                '2024-02-22', 'Frontier Maps',     'Adventure', 'English',  11, 'A hiker returning from a solo month in the wilderness readjusts to the sound of other people.',  7.90, 0.00),
(109, 'Open Water',                   '2023-06-03', 'Ocean Films',       'Adventure', 'English',  16, 'A solo sailor becalmed in the Pacific writes a letter she never expects anyone to read.',        8.30, 0.00),
(110, 'The Route',                    '2024-04-30', 'Arctic Films',      'Adventure', 'English',  13, 'Two cyclists attempt to complete the world\'s most remote road before the winter closes it.',    8.10, 0.00),

-- ── MYSTERY (111-115) ─────────────────────────────────────────────────────────
(111, 'The Missing Frequency',        '2023-05-28', 'Labyrinth Films',   'Mystery',   'English',  15, 'A radio archivist discovers a broadcast from a station that went off-air before she was born.',  8.60, 0.00),
(112, 'Object Permanence',            '2024-03-12', 'Fibonacci Films',   'Mystery',   'Italian',  11, 'Valuable items keep appearing in a museum that has no record of acquiring them.',                8.30, 0.00),
(113, 'The Other Copy',               '2023-10-07', 'Labyrinth Films',   'Mystery',   'English',  17, 'A librarian finds a returned book that contains her own handwriting — and she never wrote it.',  8.90, 0.00),
(114, 'Uninvited',                    '2024-01-24', 'Fibonacci Films',   'Mystery',   'English',  13, 'A woman attends a dinner party only to find she was never on the guest list.',                   8.10, 0.00),
(115, 'The Index',                    '2023-08-18', 'Labyrinth Films',   'Mystery',   'English',  16, 'A disgraced archivist rebuilds a destroyed index from memory and finds a name that cannot exist.', 8.70, 0.00);

-- ── ShortContents subtype classification ──────────────────────────────────────

INSERT INTO ShortContents (contentID) VALUES
(56),(57),(58),(59),(60),(61),(62),(63),(64),(65),(66),(67),
(68),(69),(70),(71),(72),(73),(74),(75),(76),(77),
(78),(79),(80),(81),(82),(83),(84),(85),(86),
(87),(88),(89),(90),(91),(92),(93),(94),
(95),(96),(97),(98),(99),(100),
(101),(102),(103),(104),(105),
(106),(107),(108),(109),(110),
(111),(112),(113),(114),(115);

-- ── TakePart for new ShortContents ───────────────────────────────────────────
-- Creator reference (all exist in ApprovedContentCreator):
--  1=Elena Marchetti(Actor) 2=James Holt(Director) 3=Yuki Tanaka(Actor)
--  4=Arthur Villeneuve(Director) 5=Sofia Reyes(Actor) 6=Marcus Webb(Director)
--  7=Lena Hoffmann(Actor) 8=Chen Wei(Director) 9=Priya Sharma(Actor)
--  10=Omar Al-Farsi(Actor) 11=Nadia Kozlov(Director) 12=Diego Fuentes(Actor)
--  13=Ingrid Larsen(Director) 14=Samuel Okafor(Actor) 15=Mei-Lin Zhao(Actor)

INSERT INTO TakePart (creatorID, contentID) VALUES
-- DRAMA shorts (creators 1,2,4,7,9,14)
(1,  56),(4,  56),
(2,  57),(9,  57),
(1,  58),(7,  58),
(4,  59),(14, 59),
(7,  60),(9,  60),
(1,  61),(2,  61),
(4,  62),(7,  62),
(9,  63),(14, 63),
(1,  64),(4,  64),
(2,  65),(9,  65),
(7,  66),(14, 66),
(2,  67),(9,  67),

-- SCI-FI shorts (creators 3,8,13,15)
(3,  68),(8,  68),
(8,  69),(15, 69),
(13, 70),(3,  70),
(8,  71),(15, 71),
(3,  72),(13, 72),
(8,  73),(15, 73),
(3,  74),(13, 74),
(15, 75),(8,  75),
(3,  76),(13, 76),
(8,  77),(15, 77),

-- THRILLER shorts (creators 2,10,11,12)
(2,  78),(10, 78),
(11, 79),(2,  79),
(10, 80),(12, 80),
(11, 81),(2,  81),
(12, 82),(10, 82),
(2,  83),(11, 83),
(10, 84),(12, 84),
(11, 85),(2,  85),
(12, 86),(10, 86),

-- ACTION shorts (creators 6,10,12)
(6,  87),(10, 87),
(12, 88),(6,  88),
(6,  89),(10, 89),
(12, 90),(6,  90),
(6,  91),(12, 91),
(10, 92),(6,  92),
(12, 93),(6,  93),
(10, 94),(12, 94),

-- HORROR shorts (creators 7,11)
(7,  95),(11, 95),
(11, 96),(7,  96),
(7,  97),(11, 97),
(11, 98),(7,  98),
(7,  99),(11, 99),
(11,100),(7, 100),

-- ROMANCE shorts (creators 5,9)
(5, 101),(9, 101),
(9, 102),(5, 102),
(5, 103),(9, 103),
(9, 104),(5, 104),
(5, 105),(9, 105),

-- ADVENTURE shorts (creators 12,13,14)
(13,106),(14,106),
(12,107),(13,107),
(14,108),(13,108),
(12,109),(14,109),
(13,110),(12,110),

-- MYSTERY shorts (creators 2,4,15)
(2, 111),(15,111),
(4, 112),(2, 112),
(15,113),(4, 113),
(2, 114),(15,114),
(4, 115),(2, 115);

SET FOREIGN_KEY_CHECKS = 1;
