/*
  # Fix WM 2026 Matches - Correct group stage fixtures

  Inserts the actual group stage match schedule for the 2026 FIFA World Cup.
  All 48 group stage matches (3 per group x 12 groups) are included.
  Times are in UTC.

  Sources: Wikipedia 2026 FIFA World Cup article
*/

-- Helper function for inserting matches by team name
CREATE OR REPLACE FUNCTION insert_match(
  p_external_id text,
  p_home text,
  p_away text,
  p_date timestamptz,
  p_stage text,
  p_matchday int,
  p_venue text
) RETURNS void AS $$
BEGIN
  INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, stage, status, matchday, venue)
  SELECT p_external_id, h.id, a.id, p_date, p_stage, 'scheduled', p_matchday, p_venue
  FROM teams h, teams a
  WHERE h.name = p_home AND a.name = p_away
  ON CONFLICT (external_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- =====================
-- GROUP A: Mexico, Südafrika, Südkorea, Tschechien
-- =====================
SELECT insert_match('WM2026-A-1', 'Mexiko','Südafrika',         '2026-06-11 19:00:00+00', 'group', 1, 'Estadio Azteca, Mexiko-Stadt');
SELECT insert_match('WM2026-A-2', 'Südkorea','Tschechien',      '2026-06-12 02:00:00+00', 'group', 1, 'Estadio Akron, Guadalajara');
SELECT insert_match('WM2026-A-3', 'Tschechien','Südafrika',     '2026-06-18 16:00:00+00', 'group', 2, 'Mercedes-Benz Stadium, Atlanta');
SELECT insert_match('WM2026-A-4', 'Mexiko','Südkorea',          '2026-06-19 01:00:00+00', 'group', 2, 'Estadio Akron, Guadalajara');
SELECT insert_match('WM2026-A-5', 'Tschechien','Mexiko',        '2026-06-25 01:00:00+00', 'group', 3, 'Estadio Azteca, Mexiko-Stadt');
SELECT insert_match('WM2026-A-6', 'Südafrika','Südkorea',       '2026-06-25 01:00:00+00', 'group', 3, 'Estadio BBVA, Monterrey');

-- =====================
-- GROUP B: Kanada, Bosnien-Herzegowina, Katar, Schweiz
-- =====================
SELECT insert_match('WM2026-B-1', 'Kanada','Bosnien-Herzegowina', '2026-06-12 19:00:00+00', 'group', 1, 'BMO Field, Toronto');
SELECT insert_match('WM2026-B-2', 'Katar','Schweiz',             '2026-06-13 19:00:00+00', 'group', 1, 'Levi''s Stadium, San Francisco');
SELECT insert_match('WM2026-B-3', 'Bosnien-Herzegowina','Schweiz','2026-06-17 16:00:00+00', 'group', 2, 'MetLife Stadium, New York');
SELECT insert_match('WM2026-B-4', 'Kanada','Katar',              '2026-06-18 02:00:00+00', 'group', 2, 'BC Place, Vancouver');
SELECT insert_match('WM2026-B-5', 'Schweiz','Kanada',            '2026-06-23 22:00:00+00', 'group', 3, 'BC Place, Vancouver');
SELECT insert_match('WM2026-B-6', 'Bosnien-Herzegowina','Katar', '2026-06-23 22:00:00+00', 'group', 3, 'BMO Field, Toronto');

-- =====================
-- GROUP C: Brasilien, Marokko, Haiti, Schottland
-- =====================
SELECT insert_match('WM2026-C-1', 'Brasilien','Marokko',         '2026-06-13 02:00:00+00', 'group', 1, 'SoFi Stadium, Los Angeles');
SELECT insert_match('WM2026-C-2', 'Haiti','Schottland',          '2026-06-13 22:00:00+00', 'group', 1, 'AT&T Stadium, Dallas');
SELECT insert_match('WM2026-C-3', 'Brasilien','Haiti',           '2026-06-17 22:00:00+00', 'group', 2, 'Hard Rock Stadium, Miami');
SELECT insert_match('WM2026-C-4', 'Schottland','Marokko',        '2026-06-18 19:00:00+00', 'group', 2, 'Lincoln Financial Field, Philadelphia');
SELECT insert_match('WM2026-C-5', 'Marokko','Haiti',             '2026-06-24 02:00:00+00', 'group', 3, 'AT&T Stadium, Dallas');
SELECT insert_match('WM2026-C-6', 'Schottland','Brasilien',      '2026-06-24 02:00:00+00', 'group', 3, 'SoFi Stadium, Los Angeles');

-- =====================
-- GROUP D: USA, Paraguay, Australien, Türkei
-- =====================
SELECT insert_match('WM2026-D-1', 'USA','Paraguay',              '2026-06-14 02:00:00+00', 'group', 1, 'MetLife Stadium, New York');
SELECT insert_match('WM2026-D-2', 'Australien','Türkei',         '2026-06-14 22:00:00+00', 'group', 1, 'Arrowhead Stadium, Kansas City');
SELECT insert_match('WM2026-D-3', 'USA','Australien',            '2026-06-19 22:00:00+00', 'group', 2, 'SoFi Stadium, Los Angeles');
SELECT insert_match('WM2026-D-4', 'Türkei','Paraguay',           '2026-06-20 19:00:00+00', 'group', 2, 'Gillette Stadium, Boston');
SELECT insert_match('WM2026-D-5', 'Paraguay','Australien',       '2026-06-25 22:00:00+00', 'group', 3, 'AT&T Stadium, Dallas');
SELECT insert_match('WM2026-D-6', 'Türkei','USA',                '2026-06-25 22:00:00+00', 'group', 3, 'MetLife Stadium, New York');

-- =====================
-- GROUP E: Deutschland, Curaçao, Elfenbeinküste, Ecuador
-- =====================
SELECT insert_match('WM2026-E-1', 'Deutschland','Elfenbeinküste','2026-06-14 19:00:00+00', 'group', 1, 'AT&T Stadium, Dallas');
SELECT insert_match('WM2026-E-2', 'Ecuador','Curaçao',           '2026-06-15 22:00:00+00', 'group', 1, 'Arrowhead Stadium, Kansas City');
SELECT insert_match('WM2026-E-3', 'Deutschland','Ecuador',       '2026-06-19 19:00:00+00', 'group', 2, 'MetLife Stadium, New York');
SELECT insert_match('WM2026-E-4', 'Elfenbeinküste','Curaçao',    '2026-06-20 02:00:00+00', 'group', 2, 'Hard Rock Stadium, Miami');
SELECT insert_match('WM2026-E-5', 'Elfenbeinküste','Ecuador',    '2026-06-26 01:00:00+00', 'group', 3, 'Gillette Stadium, Boston');
SELECT insert_match('WM2026-E-6', 'Curaçao','Deutschland',       '2026-06-26 01:00:00+00', 'group', 3, 'SoFi Stadium, Los Angeles');

-- =====================
-- GROUP F: Niederlande, Japan, Schweden, Tunesien
-- =====================
SELECT insert_match('WM2026-F-1', 'Niederlande','Schweden',      '2026-06-15 02:00:00+00', 'group', 1, 'Lincoln Financial Field, Philadelphia');
SELECT insert_match('WM2026-F-2', 'Japan','Tunesien',            '2026-06-15 19:00:00+00', 'group', 1, 'Levi''s Stadium, San Francisco');
SELECT insert_match('WM2026-F-3', 'Niederlande','Japan',         '2026-06-20 22:00:00+00', 'group', 2, 'MetLife Stadium, New York');
SELECT insert_match('WM2026-F-4', 'Schweden','Tunesien',         '2026-06-21 02:00:00+00', 'group', 2, 'BC Place, Vancouver');
SELECT insert_match('WM2026-F-5', 'Tunesien','Niederlande',      '2026-06-26 22:00:00+00', 'group', 3, 'Hard Rock Stadium, Miami');
SELECT insert_match('WM2026-F-6', 'Schweden','Japan',            '2026-06-26 22:00:00+00', 'group', 3, 'Levi''s Stadium, San Francisco');

-- =====================
-- GROUP G: Belgien, Ägypten, Iran, Neuseeland
-- =====================
SELECT insert_match('WM2026-G-1', 'Belgien','Neuseeland',        '2026-06-16 02:00:00+00', 'group', 1, 'SoFi Stadium, Los Angeles');
SELECT insert_match('WM2026-G-2', 'Ägypten','Iran',              '2026-06-16 19:00:00+00', 'group', 1, 'AT&T Stadium, Dallas');
SELECT insert_match('WM2026-G-3', 'Belgien','Ägypten',           '2026-06-21 19:00:00+00', 'group', 2, 'Levi''s Stadium, San Francisco');
SELECT insert_match('WM2026-G-4', 'Iran','Neuseeland',           '2026-06-21 22:00:00+00', 'group', 2, 'Estadio Akron, Guadalajara');
SELECT insert_match('WM2026-G-5', 'Ägypten','Neuseeland',        '2026-06-27 22:00:00+00', 'group', 3, 'Mercedes-Benz Stadium, Atlanta');
SELECT insert_match('WM2026-G-6', 'Iran','Belgien',              '2026-06-27 22:00:00+00', 'group', 3, 'Arrowhead Stadium, Kansas City');

-- =====================
-- GROUP H: Spanien, Kap Verde, Saudi-Arabien, Uruguay
-- =====================
SELECT insert_match('WM2026-H-1', 'Spanien','Uruguay',           '2026-06-16 22:00:00+00', 'group', 1, 'Hard Rock Stadium, Miami');
SELECT insert_match('WM2026-H-2', 'Saudi-Arabien','Kap Verde',   '2026-06-17 19:00:00+00', 'group', 1, 'Gillette Stadium, Boston');
SELECT insert_match('WM2026-H-3', 'Spanien','Saudi-Arabien',     '2026-06-22 02:00:00+00', 'group', 2, 'AT&T Stadium, Dallas');
SELECT insert_match('WM2026-H-4', 'Uruguay','Kap Verde',         '2026-06-22 19:00:00+00', 'group', 2, 'Lincoln Financial Field, Philadelphia');
SELECT insert_match('WM2026-H-5', 'Kap Verde','Spanien',         '2026-06-28 02:00:00+00', 'group', 3, 'SoFi Stadium, Los Angeles');
SELECT insert_match('WM2026-H-6', 'Saudi-Arabien','Uruguay',     '2026-06-28 02:00:00+00', 'group', 3, 'MetLife Stadium, New York');

-- =====================
-- GROUP I: Frankreich, Senegal, Irak, Norwegen
-- =====================
SELECT insert_match('WM2026-I-1', 'Frankreich','Norwegen',       '2026-06-17 02:00:00+00', 'group', 1, 'MetLife Stadium, New York');
SELECT insert_match('WM2026-I-2', 'Senegal','Irak',              '2026-06-17 22:00:00+00', 'group', 1, 'BMO Field, Toronto');
SELECT insert_match('WM2026-I-3', 'Frankreich','Senegal',        '2026-06-22 22:00:00+00', 'group', 2, 'Levi''s Stadium, San Francisco');
SELECT insert_match('WM2026-I-4', 'Norwegen','Irak',             '2026-06-23 02:00:00+00', 'group', 2, 'Mercedes-Benz Stadium, Atlanta');
SELECT insert_match('WM2026-I-5', 'Irak','Frankreich',           '2026-06-28 22:00:00+00', 'group', 3, 'Hard Rock Stadium, Miami');
SELECT insert_match('WM2026-I-6', 'Norwegen','Senegal',          '2026-06-28 22:00:00+00', 'group', 3, 'Estadio BBVA, Monterrey');

-- =====================
-- GROUP J: Argentinien, Algerien, Österreich, Jordanien
-- =====================
SELECT insert_match('WM2026-J-1', 'Argentinien','Algerien',      '2026-06-18 02:00:00+00', 'group', 1, 'MetLife Stadium, New York');
SELECT insert_match('WM2026-J-2', 'Österreich','Jordanien',      '2026-06-18 22:00:00+00', 'group', 1, 'SoFi Stadium, Los Angeles');
SELECT insert_match('WM2026-J-3', 'Argentinien','Österreich',    '2026-06-23 19:00:00+00', 'group', 2, 'Arrowhead Stadium, Kansas City');
SELECT insert_match('WM2026-J-4', 'Jordanien','Algerien',        '2026-06-23 22:00:00+00', 'group', 2, 'AT&T Stadium, Dallas');
SELECT insert_match('WM2026-J-5', 'Algerien','Österreich',       '2026-06-29 02:00:00+00', 'group', 3, 'Lincoln Financial Field, Philadelphia');
SELECT insert_match('WM2026-J-6', 'Jordanien','Argentinien',     '2026-06-29 02:00:00+00', 'group', 3, 'Hard Rock Stadium, Miami');

-- =====================
-- GROUP K: Portugal, DR Kongo, Usbekistan, Kolumbien
-- =====================
SELECT insert_match('WM2026-K-1', 'Portugal','Usbekistan',       '2026-06-20 02:00:00+00', 'group', 1, 'Gillette Stadium, Boston');
SELECT insert_match('WM2026-K-2', 'Kolumbien','DR Kongo',        '2026-06-20 22:00:00+00', 'group', 1, 'BC Place, Vancouver');
SELECT insert_match('WM2026-K-3', 'Portugal','Kolumbien',        '2026-06-25 02:00:00+00', 'group', 2, 'Estadio BBVA, Monterrey');
SELECT insert_match('WM2026-K-4', 'DR Kongo','Usbekistan',       '2026-06-25 19:00:00+00', 'group', 2, 'BMO Field, Toronto');
SELECT insert_match('WM2026-K-5', 'Usbekistan','Kolumbien',      '2026-06-30 02:00:00+00', 'group', 3, 'Mercedes-Benz Stadium, Atlanta');
SELECT insert_match('WM2026-K-6', 'DR Kongo','Portugal',         '2026-06-30 02:00:00+00', 'group', 3, 'MetLife Stadium, New York');

-- =====================
-- GROUP L: England, Kroatien, Ghana, Panama
-- =====================
SELECT insert_match('WM2026-L-1', 'England','Panama',            '2026-06-21 02:00:00+00', 'group', 1, 'Hard Rock Stadium, Miami');
SELECT insert_match('WM2026-L-2', 'Kroatien','Ghana',            '2026-06-21 22:00:00+00', 'group', 1, 'Levi''s Stadium, San Francisco');
SELECT insert_match('WM2026-L-3', 'England','Kroatien',          '2026-06-26 19:00:00+00', 'group', 2, 'MetLife Stadium, New York');
SELECT insert_match('WM2026-L-4', 'Ghana','Panama',              '2026-06-27 02:00:00+00', 'group', 2, 'Arrowhead Stadium, Kansas City');
SELECT insert_match('WM2026-L-5', 'Panama','Kroatien',           '2026-07-01 02:00:00+00', 'group', 3, 'AT&T Stadium, Dallas');
SELECT insert_match('WM2026-L-6', 'Ghana','England',             '2026-07-01 02:00:00+00', 'group', 3, 'SoFi Stadium, Los Angeles');

-- Clean up helper function
DROP FUNCTION insert_match;
