/*
  # WM 2026 Spielplan - Gruppenphase Beispielspiele

  Befüllt die matches-Tabelle mit den WM-2026-Spielen der Gruppenphase.
  Die Daten werden normalerweise über die Edge Function automatisch aktualisiert.
  Dieser Seed enthält repräsentative Spiele für alle Gruppen.
*/

-- Gruppenphase Spiele (Gruppe D als Beispiel der wichtigsten Spiele)
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, stage, status, matchday, venue)
SELECT
  'WM2026-GRP-D-1',
  ht.id,
  at.id,
  '2026-06-11 21:00:00+00',
  'group',
  'scheduled',
  1,
  'MetLife Stadium, New York'
FROM teams ht, teams at
WHERE ht.name = 'Deutschland' AND at.name = 'Spanien'
ON CONFLICT (external_id) DO NOTHING;

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, stage, status, matchday, venue)
SELECT
  'WM2026-GRP-D-2',
  ht.id,
  at.id,
  '2026-06-11 18:00:00+00',
  'group',
  'scheduled',
  1,
  'SoFi Stadium, Los Angeles'
FROM teams ht, teams at
WHERE ht.name = 'Frankreich' AND at.name = 'Portugal'
ON CONFLICT (external_id) DO NOTHING;

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, stage, status, matchday, venue)
SELECT
  'WM2026-GRP-D-3',
  ht.id,
  at.id,
  '2026-06-15 21:00:00+00',
  'group',
  'scheduled',
  2,
  'AT&T Stadium, Dallas'
FROM teams ht, teams at
WHERE ht.name = 'Deutschland' AND at.name = 'Portugal'
ON CONFLICT (external_id) DO NOTHING;

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, stage, status, matchday, venue)
SELECT
  'WM2026-GRP-D-4',
  ht.id,
  at.id,
  '2026-06-15 18:00:00+00',
  'group',
  'scheduled',
  2,
  'Levi''s Stadium, San Francisco'
FROM teams ht, teams at
WHERE ht.name = 'Frankreich' AND at.name = 'Spanien'
ON CONFLICT (external_id) DO NOTHING;

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, stage, status, matchday, venue)
SELECT
  'WM2026-GRP-D-5',
  ht.id,
  at.id,
  '2026-06-19 21:00:00+00',
  'group',
  'scheduled',
  3,
  'Hard Rock Stadium, Miami'
FROM teams ht, teams at
WHERE ht.name = 'Spanien' AND at.name = 'Portugal'
ON CONFLICT (external_id) DO NOTHING;

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, stage, status, matchday, venue)
SELECT
  'WM2026-GRP-D-6',
  ht.id,
  at.id,
  '2026-06-19 21:00:00+00',
  'group',
  'scheduled',
  3,
  'Gillette Stadium, Boston'
FROM teams ht, teams at
WHERE ht.name = 'Deutschland' AND at.name = 'Frankreich'
ON CONFLICT (external_id) DO NOTHING;

-- Gruppe E
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, stage, status, matchday, venue)
SELECT
  'WM2026-GRP-E-1',
  ht.id,
  at.id,
  '2026-06-12 21:00:00+00',
  'group',
  'scheduled',
  1,
  'Lincoln Financial Field, Philadelphia'
FROM teams ht, teams at
WHERE ht.name = 'England' AND at.name = 'Niederlande'
ON CONFLICT (external_id) DO NOTHING;

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, stage, status, matchday, venue)
SELECT
  'WM2026-GRP-E-2',
  ht.id,
  at.id,
  '2026-06-12 18:00:00+00',
  'group',
  'scheduled',
  1,
  'Arrowhead Stadium, Kansas City'
FROM teams ht, teams at
WHERE ht.name = 'Belgien' AND at.name = 'Österreich'
ON CONFLICT (external_id) DO NOTHING;

-- Gruppe A (Gastgeber)
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, stage, status, matchday, venue)
SELECT
  'WM2026-GRP-A-1',
  ht.id,
  at.id,
  '2026-06-08 21:00:00+00',
  'group',
  'scheduled',
  1,
  'MetLife Stadium, New York'
FROM teams ht, teams at
WHERE ht.name = 'Kanada' AND at.name = 'USA'
ON CONFLICT (external_id) DO NOTHING;

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, stage, status, matchday, venue)
SELECT
  'WM2026-GRP-A-2',
  ht.id,
  at.id,
  '2026-06-09 00:00:00+00',
  'group',
  'scheduled',
  1,
  'Azteca Stadium, Mexiko-Stadt'
FROM teams ht, teams at
WHERE ht.name = 'Mexiko' AND at.name = 'Jamaika'
ON CONFLICT (external_id) DO NOTHING;

-- Gruppe B
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, stage, status, matchday, venue)
SELECT
  'WM2026-GRP-B-1',
  ht.id,
  at.id,
  '2026-06-10 21:00:00+00',
  'group',
  'scheduled',
  1,
  'MetLife Stadium, New York'
FROM teams ht, teams at
WHERE ht.name = 'Argentinien' AND at.name = 'Chile'
ON CONFLICT (external_id) DO NOTHING;

-- Gruppe C
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, stage, status, matchday, venue)
SELECT
  'WM2026-GRP-C-1',
  ht.id,
  at.id,
  '2026-06-10 18:00:00+00',
  'group',
  'scheduled',
  1,
  'SoFi Stadium, Los Angeles'
FROM teams ht, teams at
WHERE ht.name = 'Brasilien' AND at.name = 'Kolumbien'
ON CONFLICT (external_id) DO NOTHING;

-- Halbfinale (Platzhalter)
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, stage, status, matchday, venue)
SELECT
  'WM2026-SEMI-1',
  ht.id,
  at.id,
  '2026-07-14 21:00:00+00',
  'semi_final',
  'scheduled',
  NULL,
  'MetLife Stadium, New York'
FROM teams ht, teams at
WHERE ht.name = 'Brasilien' AND at.name = 'Deutschland'
ON CONFLICT (external_id) DO NOTHING;

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, stage, status, matchday, venue)
SELECT
  'WM2026-SEMI-2',
  ht.id,
  at.id,
  '2026-07-15 21:00:00+00',
  'semi_final',
  'scheduled',
  NULL,
  'SoFi Stadium, Los Angeles'
FROM teams ht, teams at
WHERE ht.name = 'Argentinien' AND at.name = 'Frankreich'
ON CONFLICT (external_id) DO NOTHING;

-- Finale
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, stage, status, matchday, venue)
SELECT
  'WM2026-FINAL',
  ht.id,
  at.id,
  '2026-07-19 21:00:00+00',
  'final',
  'scheduled',
  NULL,
  'MetLife Stadium, New York'
FROM teams ht, teams at
WHERE ht.name = 'Brasilien' AND at.name = 'Argentinien'
ON CONFLICT (external_id) DO NOTHING;
