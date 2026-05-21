/*
  # Add knockout predictions and group standings support

  ## Overview
  Adds infrastructure for:
  1. A `knockout_predictions` table where users tip which team advances
     in each knockout match slot (round_of_32, round_of_16, QF, SF, Final)
  2. A DB function `get_group_standings_from_predictions` to compute virtual
     group tables based on a user's group-stage prediction tips

  ## New Tables
  - `knockout_predictions`: per-user prediction for which team wins each
    knockout match slot (identified by slot_id like 'R32-1', 'R16-1', etc.)

  ## New Functions
  - none (standings computed client-side for simplicity)

  ## Security
  - RLS enabled on knockout_predictions
  - Users can only read/write their own knockout predictions
*/

-- ============================
-- KNOCKOUT PREDICTIONS
-- ============================
CREATE TABLE IF NOT EXISTS knockout_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  home_score integer NOT NULL DEFAULT 0,
  away_score integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, match_id)
);

ALTER TABLE knockout_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutzer können eigene KO-Tipps lesen"
  ON knockout_predictions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Nutzer können eigene KO-Tipps erstellen"
  ON knockout_predictions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Nutzer können eigene KO-Tipps aktualisieren"
  ON knockout_predictions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Nutzer können eigene KO-Tipps löschen"
  ON knockout_predictions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_knockout_predictions_user_id ON knockout_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_knockout_predictions_match_id ON knockout_predictions(match_id);
