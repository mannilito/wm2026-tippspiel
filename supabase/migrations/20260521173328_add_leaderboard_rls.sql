/*
  # Leaderboard & Public Predictions Zugriff

  Erlaubt authentifizierten Nutzern, die Gesamtpunktzahlen aller Nutzer
  (für das Leaderboard) zu sehen, ohne private Daten preiszugeben.
  
  Die leaderboard-View aggregiert nur Punkte, keine einzelnen Tipps.
  Die public_predictions-View zeigt alle Tipps für das Ergebnis-Display.
*/

-- Leaderboard-View lesbar für alle authentifizierten Nutzer
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  u.id AS user_id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'display_name', split_part(u.email, '@', 1)) AS display_name,
  COALESCE(SUM(p.points), 0) + COALESCE(cp.points_awarded, 0) AS total_points,
  COUNT(p.id) FILTER (WHERE p.points = 5) AS exact_predictions,
  COUNT(p.id) FILTER (WHERE p.points = 4) AS diff_predictions,
  COUNT(p.id) FILTER (WHERE p.points = 3) AS result_predictions,
  COUNT(p.id) FILTER (WHERE p.points IS NOT NULL AND p.points = 0) AS wrong_predictions
FROM auth.users u
LEFT JOIN predictions p ON p.user_id = u.id
LEFT JOIN champion_predictions cp ON cp.user_id = u.id
GROUP BY u.id, u.email, u.raw_user_meta_data, cp.points_awarded
ORDER BY total_points DESC;

GRANT SELECT ON leaderboard TO authenticated;

-- Public predictions view: zeigt Tipps für bereits beendete Spiele
CREATE OR REPLACE VIEW public_predictions AS
SELECT
  p.user_id,
  p.match_id,
  p.home_score,
  p.away_score,
  p.points
FROM predictions p
JOIN matches m ON m.id = p.match_id
WHERE m.status = 'finished';

GRANT SELECT ON public_predictions TO authenticated;

-- Funktion: Berechne Punkte für einen Tipp
CREATE OR REPLACE FUNCTION calculate_prediction_points(
  pred_home integer,
  pred_away integer,
  actual_home integer,
  actual_away integer
) RETURNS integer AS $$
DECLARE
  pred_result text;
  actual_result text;
  pred_diff integer;
  actual_diff integer;
BEGIN
  IF actual_home IS NULL OR actual_away IS NULL THEN
    RETURN NULL;
  END IF;

  -- Exakt richtig: 5 Punkte
  IF pred_home = actual_home AND pred_away = actual_away THEN
    RETURN 5;
  END IF;

  -- Ergebnis bestimmen (Sieg, Niederlage, Unentschieden)
  IF pred_home > pred_away THEN pred_result := 'home';
  ELSIF pred_home < pred_away THEN pred_result := 'away';
  ELSE pred_result := 'draw';
  END IF;

  IF actual_home > actual_away THEN actual_result := 'home';
  ELSIF actual_home < actual_away THEN actual_result := 'away';
  ELSE actual_result := 'draw';
  END IF;

  -- Falsches Ergebnis: 0 Punkte
  IF pred_result != actual_result THEN
    RETURN 0;
  END IF;

  -- Tordifferenz prüfen
  pred_diff := pred_home - pred_away;
  actual_diff := actual_home - actual_away;

  -- Richtiges Ergebnis + richtige Tordifferenz: 4 Punkte
  IF pred_diff = actual_diff THEN
    RETURN 4;
  END IF;

  -- Nur richtiges Ergebnis: 3 Punkte
  RETURN 3;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger: Punkte automatisch berechnen wenn Spielergebnis eingetragen
CREATE OR REPLACE FUNCTION update_prediction_points()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.home_score IS NOT NULL AND NEW.away_score IS NOT NULL AND NEW.status = 'finished' THEN
    UPDATE predictions
    SET points = calculate_prediction_points(
      predictions.home_score,
      predictions.away_score,
      NEW.home_score,
      NEW.away_score
    )
    WHERE match_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_prediction_points ON matches;
CREATE TRIGGER trigger_update_prediction_points
  AFTER UPDATE OF home_score, away_score, status ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_prediction_points();
