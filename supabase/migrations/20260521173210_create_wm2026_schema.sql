/*
  # WM 2026 Tippspiel - Datenbankschema

  1. Neue Tabellen
    - `teams` - Alle teilnehmenden Nationen
      - `id` (uuid, primary key)
      - `name` (text, eindeutig) - Name der Nation
      - `code` (text) - ISO-Ländercode für Flaggen
      - `group_name` (text) - Gruppenname (A-L oder null)
    
    - `matches` - Alle WM-Spiele
      - `id` (uuid, primary key)
      - `external_id` (text, eindeutig) - ID von der externen API
      - `home_team_id` / `away_team_id` - Fremdschlüssel zu teams
      - `home_score` / `away_score` - Ergebnis (null = noch nicht gespielt)
      - `match_date` - Anpfiffzeit
      - `stage` - Runde (group, round_of_32, round_of_16, quarter_final, semi_final, third_place, final)
      - `status` - Status (scheduled, live, finished)
      - `matchday` - Spieltag-Nummer

    - `predictions` - Tipps der Nutzer für einzelne Spiele
      - `id` (uuid, primary key)
      - `user_id` - Fremdschlüssel zu auth.users
      - `match_id` - Fremdschlüssel zu matches
      - `home_score` / `away_score` - getipptes Ergebnis
      - `points` - berechnete Punkte (null = noch nicht berechnet)
      - Unique-Constraint: (user_id, match_id)

    - `champion_predictions` - Weltmeister-Tipps
      - `id` (uuid, primary key)
      - `user_id` - Fremdschlüssel zu auth.users (eindeutig)
      - `team_id` - Fremdschlüssel zu teams
      - `tipped_at` - Zeitpunkt des Tipps
      - `points_awarded` - Punkte (0 = noch nicht vergeben)

  2. Sicherheit
    - RLS für alle Tabellen aktiviert
    - teams/matches: öffentlich lesbar für authentifizierte Nutzer
    - predictions/champion_predictions: nur der jeweilige Nutzer kann seine Daten lesen/schreiben
*/

-- ============================
-- TEAMS
-- ============================
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  code text NOT NULL DEFAULT '',
  group_name text
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teams sind für authentifizierte Nutzer lesbar"
  ON teams FOR SELECT
  TO authenticated
  USING (true);

-- ============================
-- MATCHES
-- ============================
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text UNIQUE,
  home_team_id uuid REFERENCES teams(id),
  away_team_id uuid REFERENCES teams(id),
  home_score integer,
  away_score integer,
  match_date timestamptz NOT NULL,
  stage text NOT NULL DEFAULT 'group',
  status text NOT NULL DEFAULT 'scheduled',
  matchday integer,
  venue text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Matches sind für authentifizierte Nutzer lesbar"
  ON matches FOR SELECT
  TO authenticated
  USING (true);

-- ============================
-- PREDICTIONS
-- ============================
CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  home_score integer NOT NULL,
  away_score integer NOT NULL,
  points integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, match_id)
);

ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutzer können eigene Tipps lesen"
  ON predictions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Nutzer können eigene Tipps erstellen"
  ON predictions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Nutzer können eigene Tipps aktualisieren"
  ON predictions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Nutzer können eigene Tipps löschen"
  ON predictions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================
-- CHAMPION PREDICTIONS
-- ============================
CREATE TABLE IF NOT EXISTS champion_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES teams(id),
  tipped_at timestamptz DEFAULT now(),
  points_awarded integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE champion_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutzer können eigenen Weltmeister-Tipp lesen"
  ON champion_predictions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Nutzer können Weltmeister-Tipp erstellen"
  ON champion_predictions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Nutzer können Weltmeister-Tipp aktualisieren"
  ON champion_predictions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Nutzer können eigenen Weltmeister-Tipp löschen"
  ON champion_predictions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================
-- LEADERBOARD VIEW
-- ============================
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  u.id AS user_id,
  u.email,
  u.raw_user_meta_data->>'display_name' AS display_name,
  COALESCE(SUM(p.points), 0) + COALESCE(cp.points_awarded, 0) AS total_points,
  COUNT(p.id) FILTER (WHERE p.points = 5) AS exact_predictions,
  COUNT(p.id) FILTER (WHERE p.points = 4) AS diff_predictions,
  COUNT(p.id) FILTER (WHERE p.points = 3) AS result_predictions,
  COUNT(p.id) FILTER (WHERE p.points = 0) AS wrong_predictions
FROM auth.users u
LEFT JOIN predictions p ON p.user_id = u.id
LEFT JOIN champion_predictions cp ON cp.user_id = u.id
GROUP BY u.id, u.email, u.raw_user_meta_data, cp.points_awarded
ORDER BY total_points DESC;

-- ============================
-- ALL PREDICTIONS VIEW (for leaderboard reading other users' data)
-- ============================
CREATE OR REPLACE VIEW public_predictions AS
SELECT
  p.user_id,
  p.match_id,
  p.home_score,
  p.away_score,
  p.points
FROM predictions p;

-- ============================
-- INDEXES
-- ============================
CREATE INDEX IF NOT EXISTS idx_matches_match_date ON matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_stage ON matches(stage);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_match_id ON predictions(match_id);
