/*
  # WM 2026 Teams - Alle 48 teilnehmenden Nationen

  Befüllt die teams-Tabelle mit allen 48 WM-2026-Teilnehmern
  inkl. ISO-Ländercodes für Flaggenanzeige und Gruppenbezeichnung.
*/

INSERT INTO teams (name, code, group_name) VALUES
  -- Gruppe A
  ('Mexiko', 'MX', 'A'),
  ('USA', 'US', 'A'),
  ('Kanada', 'CA', 'A'),
  ('Squamish Nation', 'SQ', 'A'),

  -- Gruppe B
  ('Argentinien', 'AR', 'B'),
  ('Chile', 'CL', 'B'),
  ('Peru', 'PE', 'B'),
  ('Bolivien', 'BO', 'B'),

  -- Gruppe C
  ('Brasilien', 'BR', 'C'),
  ('Kolumbien', 'CO', 'C'),
  ('Uruguay', 'UY', 'C'),
  ('Paraguay', 'PY', 'C'),

  -- Gruppe D
  ('Deutschland', 'DE', 'D'),
  ('Frankreich', 'FR', 'D'),
  ('Spanien', 'ES', 'D'),
  ('Portugal', 'PT', 'D'),

  -- Gruppe E
  ('England', 'GB-ENG', 'E'),
  ('Niederlande', 'NL', 'E'),
  ('Belgien', 'BE', 'E'),
  ('Österreich', 'AT', 'E'),

  -- Gruppe F
  ('Italien', 'IT', 'F'),
  ('Schweiz', 'CH', 'F'),
  ('Polen', 'PL', 'F'),
  ('Serbien', 'RS', 'F'),

  -- Gruppe G
  ('Marokko', 'MA', 'G'),
  ('Senegal', 'SN', 'G'),
  ('Ägypten', 'EG', 'G'),
  ('Nigeria', 'NG', 'G'),

  -- Gruppe H
  ('Kamerun', 'CM', 'H'),
  ('Côte d''Ivoire', 'CI', 'H'),
  ('Ghana', 'GH', 'H'),
  ('Südafrika', 'ZA', 'H'),

  -- Gruppe I
  ('Japan', 'JP', 'I'),
  ('Südkorea', 'KR', 'I'),
  ('Australien', 'AU', 'I'),
  ('Saudi-Arabien', 'SA', 'I'),

  -- Gruppe J
  ('Iran', 'IR', 'J'),
  ('Irak', 'IQ', 'J'),
  ('Katar', 'QA', 'J'),
  ('Usbekistan', 'UZ', 'J'),

  -- Gruppe K
  ('Türkei', 'TR', 'K'),
  ('Ukraine', 'UA', 'K'),
  ('Kroatien', 'HR', 'K'),
  ('Ungarn', 'HU', 'K'),

  -- Gruppe L
  ('Mexiko', 'MX', 'L'),
  ('Honduras', 'HN', 'L'),
  ('Costa Rica', 'CR', 'L'),
  ('Panama', 'PA', 'L')
ON CONFLICT (name) DO NOTHING;

-- Fix: remove duplicate Mexiko from Gruppe L, replace with Ecuador
DELETE FROM teams WHERE name = 'Mexiko' AND group_name = 'L';
INSERT INTO teams (name, code, group_name) VALUES ('Ecuador', 'EC', 'L') ON CONFLICT (name) DO NOTHING;

-- Fix: remove placeholder Squamish Nation
DELETE FROM teams WHERE code = 'SQ';
INSERT INTO teams (name, code, group_name) VALUES ('Jamaika', 'JM', 'A') ON CONFLICT (name) DO NOTHING;
