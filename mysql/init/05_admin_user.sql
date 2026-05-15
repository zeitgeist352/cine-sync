-- ============================================================
-- ADMIN USER SETUP
-- Creates the platform admin account
-- username: admin
-- password: Admin@2024
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Insert admin into Users table (NOT in StandardUsers or Critics)
-- password hash is for: Admin@2024
INSERT INTO Users (userID, username, email, age, name, lastName, password_hash) VALUES
(21, 'admin', 'admin@cinelog.com', 30, 'Platform', 'Admin',
 '$2b$12$/Nkl5gR5MaQkJnY/ocmk4.bHRqMO3qe40cEkEmN15XA7PfEK0GzTy');

-- Update the Admin table to reference same email (used for role detection)
-- The existing Admin row (id=1) already has email admin@cinelog.com
-- Just ensure it matches
UPDATE Admin SET name = 'Platform Admin', email = 'admin@cinelog.com' WHERE id = 1;

SET FOREIGN_KEY_CHECKS = 1;
