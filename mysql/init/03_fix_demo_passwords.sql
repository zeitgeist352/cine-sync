-- Fix demo/test user passwords
-- All listed users will use: password123

UPDATE Users
SET password_hash = '$2b$12$jYiMLIJWxbDYLhehMcz/1.TRFm.Q/jH9.KAzK8DHJIJvV7kGgwwAa'
WHERE username IN (
                   'aral_m',
                   'husnu_a',
                   'mehmet_d',
                   'onur_y',
                   'yunus_a',
                   'sofia_q',
                   'leon_m',
                   'tariq_o',
                   'hana_b',
                   'arthur_v',
                   'mia_s',
                   'james_ok'
    );