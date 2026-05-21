import { createClient } from '@supabase/supabase-js';

export type Stage = 'group' | 'round_of_32' | 'round_of_16' | 'quarter_final' | 'semi_final' | 'third_place' | 'final';
export type MatchStatus = 'scheduled' | 'live' | 'finished';

export interface Team {
  id: string;
  name: string;
  code: string;
  group_name: string | null;
}

export interface Match {
  id: string;
  external_id: string | null;
  home_team_id: string;
  away_team_id: string;
  home_score: number | null;
  away_score: number | null;
  match_date: string;
  stage: Stage;
  status: MatchStatus;
  matchday: number | null;
  venue: string | null;
  home_team?: Team;
  away_team?: Team;
}

export interface Prediction {
  id: string;
  user_id: string;
  match_id: string;
  home_score: number;
  away_score: number;
  points: number | null;
}

export interface ChampionPrediction {
  id: string;
  user_id: string;
  team_id: string;
  tipped_at: string;
  points_awarded: number;
  team?: Team;
}

export interface LeaderboardEntry {
  user_id: string;
  email: string;
  display_name: string;
  total_points: number;
  exact_predictions: number;
  diff_predictions: number;
  result_predictions: number;
  wrong_predictions: number;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
