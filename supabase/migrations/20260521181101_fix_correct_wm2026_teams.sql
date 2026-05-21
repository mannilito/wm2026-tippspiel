/*
  # Fix WM 2026 Teams - Correct 48 qualified nations

  Replaces all incorrect team data with the actual 48 qualified nations
  for the 2026 FIFA World Cup, sourced from Wikipedia/FIFA official data.

  ## Changes
  - Deletes all existing teams (cascades to matches via FK)
  - Inserts all 48 correct teams with proper group assignments (A-L)
  - Uses correct ISO country codes for flag display

  ## Groups (12 groups x 4 teams)
  - A: Mexico, South Africa, South Korea, Czech Republic
  - B: Canada, Bosnia and Herzegovina, Qatar, Switzerland
  - C: Brazil, Morocco, Haiti, Scotland
  - D: United States, Paraguay, Australia, Turkey
  - E: Germany, Curaçao, Ivory Coast, Ecuador
  - F: Netherlands, Japan, Sweden, Tunisia
  - G: Belgium, Egypt, Iran, New Zealand
  - H: Spain, Cape Verde, Saudi Arabia, Uruguay
  - I: France, Senegal, Iraq, Norway
  - J: Argentina, Algeria, Austria, Jordan
  - K: Portugal, DR Congo, Uzbekistan, Colombia
  - L: England, Croatia, Ghana, Panama
*/

-- Delete existing matches first (FK dependency), then teams
DELETE FROM matches;
DELETE FROM teams;

-- Insert correct 48 teams
INSERT INTO teams (name, code, group_name) VALUES
  -- Group A
  ('Mexiko',         'MX', 'A'),
  ('Südafrika',      'ZA', 'A'),
  ('Südkorea',       'KR', 'A'),
  ('Tschechien',     'CZ', 'A'),

  -- Group B
  ('Kanada',         'CA', 'B'),
  ('Bosnien-Herzegowina', 'BA', 'B'),
  ('Katar',          'QA', 'B'),
  ('Schweiz',        'CH', 'B'),

  -- Group C
  ('Brasilien',      'BR', 'C'),
  ('Marokko',        'MA', 'C'),
  ('Haiti',          'HT', 'C'),
  ('Schottland',     'GB-SCT', 'C'),

  -- Group D
  ('USA',            'US', 'D'),
  ('Paraguay',       'PY', 'D'),
  ('Australien',     'AU', 'D'),
  ('Türkei',         'TR', 'D'),

  -- Group E
  ('Deutschland',    'DE', 'E'),
  ('Curaçao',        'CW', 'E'),
  ('Elfenbeinküste', 'CI', 'E'),
  ('Ecuador',        'EC', 'E'),

  -- Group F
  ('Niederlande',    'NL', 'F'),
  ('Japan',          'JP', 'F'),
  ('Schweden',       'SE', 'F'),
  ('Tunesien',       'TN', 'F'),

  -- Group G
  ('Belgien',        'BE', 'G'),
  ('Ägypten',        'EG', 'G'),
  ('Iran',           'IR', 'G'),
  ('Neuseeland',     'NZ', 'G'),

  -- Group H
  ('Spanien',        'ES', 'H'),
  ('Kap Verde',      'CV', 'H'),
  ('Saudi-Arabien',  'SA', 'H'),
  ('Uruguay',        'UY', 'H'),

  -- Group I
  ('Frankreich',     'FR', 'I'),
  ('Senegal',        'SN', 'I'),
  ('Irak',           'IQ', 'I'),
  ('Norwegen',       'NO', 'I'),

  -- Group J
  ('Argentinien',    'AR', 'J'),
  ('Algerien',       'DZ', 'J'),
  ('Österreich',     'AT', 'J'),
  ('Jordanien',      'JO', 'J'),

  -- Group K
  ('Portugal',       'PT', 'K'),
  ('DR Kongo',       'CD', 'K'),
  ('Usbekistan',     'UZ', 'K'),
  ('Kolumbien',      'CO', 'K'),

  -- Group L
  ('England',        'GB-ENG', 'L'),
  ('Kroatien',       'HR', 'L'),
  ('Ghana',          'GH', 'L'),
  ('Panama',         'PA', 'L');
