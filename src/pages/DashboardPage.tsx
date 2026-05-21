import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { useNavigate } from 'react-router-dom';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Match, Prediction, ChampionPrediction, LeaderboardEntry } from '../lib/supabase';
import { getChampionPoints } from '../lib/championPoints';

function StatCard({
  icon,
  label,
  value,
  color = 'primary.main',
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box sx={{ color, display: 'flex' }}>{icon}</Box>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [championPrediction, setChampionPrediction] = useState<ChampionPrediction | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [upcomingMatch, setUpcomingMatch] = useState<Match | null>(null);

  useEffect(() => {
    async function load() {
      if (!user) return;

      const [matchesRes, predsRes, champRes, leaderboardRes] = await Promise.all([
        supabase
          .from('matches')
          .select('*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)')
          .order('match_date', { ascending: true }),
        supabase.from('predictions').select('*').eq('user_id', user.id),
        supabase.from('champion_predictions').select('*, team:teams(*)').eq('user_id', user.id).maybeSingle(),
        supabase.from('leaderboard').select('*'),
      ]);

      const allMatches = (matchesRes.data || []) as Match[];
      setMatches(allMatches);
      setPredictions(predsRes.data || []);
      setChampionPrediction(champRes.data as ChampionPrediction | null);

      const now = new Date();
      const upcoming = allMatches.find(
        (m) => m.status !== 'finished' && new Date(m.match_date) > now
      );
      setUpcomingMatch(upcoming || null);

      const leaderboard = (leaderboardRes.data || []) as LeaderboardEntry[];
      const myEntry = leaderboard.find((e) => e.user_id === user.id);
      if (myEntry) {
        setTotalPoints(myEntry.total_points);
        const idx = leaderboard.findIndex((e) => e.user_id === user.id);
        setRank(idx + 1);
      }

      setLoading(false);
    }
    load();
  }, [user]);

  const tippedCount = predictions.length;
  const finishedMatches = matches.filter((m) => m.status === 'finished');
  const unfinishedTippable = matches.filter(
    (m) => m.status !== 'finished' && !predictions.find((p) => p.match_id === m.id)
  );
  const championPointsNow = getChampionPoints(matches);

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Nutzer';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          Hallo, {displayName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Willkommen beim WM 2026 Tippspiel
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            icon={<TrendingUpIcon />}
            label="Gesamtpunkte"
            value={totalPoints}
            color="primary.main"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            icon={<EmojiEventsIcon />}
            label="Platz"
            value={rank !== null ? `#${rank}` : '–'}
            color="secondary.main"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            icon={<CheckCircleIcon />}
            label="Getippt"
            value={tippedCount}
            color="success.main"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            icon={<ScheduleIcon />}
            label="Ausstehend"
            value={unfinishedTippable.length}
            color="warning.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Nächstes Spiel */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SportsSoccerIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6">Nächstes Spiel</Typography>
              </Box>
              {upcomingMatch ? (
                <>
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {new Date(upcomingMatch.match_date).toLocaleDateString('de-DE', {
                        weekday: 'long', day: 'numeric', month: 'long',
                      })}
                      {' '}
                      {new Date(upcomingMatch.match_date).toLocaleTimeString('de-DE', {
                        hour: '2-digit', minute: '2-digit',
                      })} Uhr
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, my: 2 }}>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {(upcomingMatch.home_team as any)?.name || '–'}
                      </Typography>
                      <Typography variant="h5" color="text.secondary">vs</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {(upcomingMatch.away_team as any)?.name || '–'}
                      </Typography>
                    </Box>
                    <Chip
                      label={stageLabel(upcomingMatch.stage)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    {upcomingMatch.venue && (
                      <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                        {upcomingMatch.venue}
                      </Typography>
                    )}
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate('/matches')}
                    sx={{ mt: 1 }}
                  >
                    Jetzt tippen
                  </Button>
                </>
              ) : (
                <Typography color="text.secondary">Keine ausstehenden Spiele.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Weltmeister-Tipp */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <EmojiEventsIcon sx={{ color: 'secondary.main' }} />
                <Typography variant="h6">Weltmeister-Tipp</Typography>
              </Box>
              {championPrediction ? (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Dein Tipp
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                    {(championPrediction.team as any)?.name || '–'}
                  </Typography>
                  <Chip
                    label={`+${championPrediction.points_awarded || championPointsNow} Punkte möglich`}
                    color="secondary"
                    size="small"
                  />
                  <Divider sx={{ my: 2 }} />
                  <Button variant="outlined" fullWidth onClick={() => navigate('/champion')}>
                    Tipp ändern
                  </Button>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    Du hast noch keinen Weltmeister getippt!
                  </Typography>
                  <Chip
                    label={`Aktuell ${championPointsNow} Punkte für richtigen Tipp`}
                    color="secondary"
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ mt: 1 }}>
                    <Button variant="contained" color="secondary" fullWidth onClick={() => navigate('/champion')}>
                      Weltmeister tippen
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Punkteverteilung */}
        {finishedMatches.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Meine Tipps – Übersicht</Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Exakt (5 Pkt.)', count: predictions.filter((p) => p.points === 5).length, color: 'success.main' },
                    { label: 'Differenz (4 Pkt.)', count: predictions.filter((p) => p.points === 4).length, color: 'info.main' },
                    { label: 'Ergebnis (3 Pkt.)', count: predictions.filter((p) => p.points === 3).length, color: 'warning.main' },
                    { label: 'Falsch (0 Pkt.)', count: predictions.filter((p) => p.points === 0).length, color: 'error.main' },
                  ].map((item) => (
                    <Box
                      key={item.label}
                      sx={{
                        flex: '1 1 120px',
                        textAlign: 'center',
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.03)',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="h5" sx={{ fontWeight: 700, color: item.color }}>
                        {item.count}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

function stageLabel(stage: string) {
  const map: Record<string, string> = {
    group: 'Gruppenphase',
    round_of_32: 'Runde der 32',
    round_of_16: 'Achtelfinale',
    quarter_final: 'Viertelfinale',
    semi_final: 'Halbfinale',
    third_place: 'Spiel um Platz 3',
    final: 'Finale',
  };
  return map[stage] || stage;
}
