import { useEffect, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import LinearProgress from '@mui/material/LinearProgress';
import RefreshIcon from '@mui/icons-material/Refresh';
import TableChartIcon from '@mui/icons-material/TableChart';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Match, Prediction } from '../lib/supabase';
import { computeGroupStandings, allGroupsComplete } from '../lib/groupStandings';

const STAGES = [
  { key: 'all', label: 'Alle' },
  { key: 'group', label: 'Gruppe' },
  { key: 'round_of_32', label: 'Runde 32' },
  { key: 'round_of_16', label: 'Achtelfinale' },
  { key: 'quarter_final', label: 'Viertelfinale' },
  { key: 'semi_final', label: 'Halbfinale' },
  { key: 'final', label: 'Finale' },
];

function PointsBadge({ points }: { points: number | null | undefined }) {
  if (points === null || points === undefined) return null;
  const color = points === 5 ? 'success' : points === 4 ? 'info' : points === 3 ? 'warning' : 'error';
  const label = points === 5 ? '5 Pkt.' : points === 4 ? '4 Pkt.' : points === 3 ? '3 Pkt.' : '0 Pkt.';
  return <Chip label={label} color={color} size="small" sx={{ fontWeight: 700 }} />;
}

function MatchCard({
  match,
  prediction,
  onSave,
}: {
  match: Match;
  prediction?: Prediction;
  onSave: (matchId: string, home: number, away: number) => Promise<void>;
}) {
  const [homeVal, setHomeVal] = useState(prediction?.home_score?.toString() ?? '');
  const [awayVal, setAwayVal] = useState(prediction?.away_score?.toString() ?? '');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const isPast = match.status === 'finished' || new Date(match.match_date) <= new Date();
  const canTip = !isPast;

  async function handleSave() {
    const h = parseInt(homeVal);
    const a = parseInt(awayVal);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return;
    setSaving(true);
    await onSave(match.id, h, a);
    setSaving(false);
    setDirty(false);
  }

  const homeTeam = (match as any).home_team;
  const awayTeam = (match as any).away_team;

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: match.status === 'live' ? 'primary.main' : 'divider',
        position: 'relative',
        overflow: 'visible',
        transition: 'border-color 0.2s',
      }}
    >
      {match.status === 'live' && (
        <Box
          sx={{
            position: 'absolute',
            top: -10,
            left: 16,
            bgcolor: 'error.main',
            color: 'white',
            px: 1,
            py: 0.25,
            borderRadius: 1,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          LIVE
        </Box>
      )}
      <CardContent sx={{ p: 2.5 }}>
        {/* Date + Stage */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary">
            {new Date(match.match_date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}
            {' '}
            {new Date(match.match_date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
            {match.matchday && (
              <Chip label={`Spieltag ${match.matchday}`} size="small" variant="outlined" sx={{ fontSize: 11 }} />
            )}
            {prediction && <PointsBadge points={prediction.points} />}
          </Box>
        </Box>

        {/* Teams & Score */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1.5 }}>
          <Typography variant="body1" sx={{ fontWeight: 600, flex: 1, textAlign: 'right' }}>
            {homeTeam?.name || '–'}
          </Typography>

          {match.status === 'finished' ? (
            <Box sx={{ textAlign: 'center', px: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 2 }}>
                {match.home_score} : {match.away_score}
              </Typography>
              <Typography variant="caption" color="text.secondary">Ergebnis</Typography>
            </Box>
          ) : (
            <Box sx={{ px: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>vs</Typography>
            </Box>
          )}

          <Typography variant="body1" sx={{ fontWeight: 600, flex: 1 }}>
            {awayTeam?.name || '–'}
          </Typography>
        </Box>

        {match.venue && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            {match.venue}
          </Typography>
        )}

        <Divider sx={{ my: 1.5 }} />

        {/* Tipp input */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 36 }}>
            Tipp:
          </Typography>
          <TextField
            size="small"
            type="number"
            value={homeVal}
            onChange={(e) => { setHomeVal(e.target.value); setDirty(true); }}
            disabled={!canTip}
            inputProps={{ min: 0, max: 30 }}
            sx={{ width: 56 }}
          />
          <Typography variant="body1" sx={{ fontWeight: 600 }}>:</Typography>
          <TextField
            size="small"
            type="number"
            value={awayVal}
            onChange={(e) => { setAwayVal(e.target.value); setDirty(true); }}
            disabled={!canTip}
            inputProps={{ min: 0, max: 30 }}
            sx={{ width: 56 }}
          />
          {canTip && (
            <Button
              variant={dirty ? 'contained' : 'outlined'}
              size="small"
              onClick={handleSave}
              disabled={saving || homeVal === '' || awayVal === ''}
              sx={{ ml: 'auto' }}
            >
              {saving ? <CircularProgress size={16} color="inherit" /> : prediction ? 'Ändern' : 'Tippen'}
            </Button>
          )}
          {!canTip && prediction && (
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                Dein Tipp: {prediction.home_score} : {prediction.away_score}
              </Typography>
            </Box>
          )}
          {!canTip && !prediction && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
              Nicht getippt
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default function MatchesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [stageFilter, setStageFilter] = useState('all');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  const loadData = useCallback(async () => {
    if (!user) return;
    const [matchesRes, predsRes] = await Promise.all([
      supabase
        .from('matches')
        .select('*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)')
        .order('match_date', { ascending: true }),
      supabase.from('predictions').select('*').eq('user_id', user.id),
    ]);
    setMatches((matchesRes.data || []) as Match[]);
    setPredictions(predsRes.data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleSync() {
    setSyncing(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const res = await fetch(`${supabaseUrl}/functions/v1/sync-matches`, {
        headers: { Authorization: `Bearer ${anonKey}` },
      });
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: `Spielplan aktualisiert (${data.updated || 0} aktualisiert, ${data.inserted || 0} neu)`, severity: 'success' });
        await loadData();
      }
    } catch {
      setSnackbar({ open: true, message: 'Fehler beim Synchronisieren', severity: 'error' });
    }
    setSyncing(false);
  }

  async function handleSavePrediction(matchId: string, home: number, away: number) {
    if (!user) return;
    const existing = predictions.find((p) => p.match_id === matchId);
    if (existing) {
      const { error } = await supabase
        .from('predictions')
        .update({ home_score: home, away_score: away, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      if (error) {
        setSnackbar({ open: true, message: 'Fehler beim Speichern', severity: 'error' });
        return;
      }
      setPredictions((prev) =>
        prev.map((p) => p.id === existing.id ? { ...p, home_score: home, away_score: away } : p)
      );
    } else {
      const { data, error } = await supabase
        .from('predictions')
        .insert({ user_id: user.id, match_id: matchId, home_score: home, away_score: away })
        .select()
        .single();
      if (error) {
        setSnackbar({ open: true, message: 'Fehler beim Speichern', severity: 'error' });
        return;
      }
      setPredictions((prev) => [...prev, data]);
    }
    setSnackbar({ open: true, message: 'Tipp gespeichert!', severity: 'success' });
  }

  const groupMatches = matches.filter((m) => m.stage === 'group');
  const tippedGroupCount = groupMatches.filter(
    (m) => m.status === 'finished' || predictions.find((p) => p.match_id === m.id)
  ).length;
  const groupProgress = groupMatches.length > 0 ? Math.round((tippedGroupCount / groupMatches.length) * 100) : 0;
  const standings = computeGroupStandings(matches, predictions);
  const groupsComplete = allGroupsComplete(standings);

  const filtered = stageFilter === 'all'
    ? matches
    : matches.filter((m) => m.stage === stageFilter);

  // Group by date
  const grouped: Record<string, Match[]> = {};
  for (const m of filtered) {
    const dateKey = new Date(m.match_date).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(m);
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Spiele & Tipps</Typography>
          <Typography variant="body2" color="text.secondary">
            Tippe alle Spiele vor Anpfiff. Exakt: 5 Pkt. · Differenz: 4 Pkt. · Ergebnis: 3 Pkt. · Falsch: 0 Pkt.
          </Typography>
        </Box>
        <Tooltip title="Spielplan aktualisieren">
          <Button
            variant="outlined"
            size="small"
            startIcon={syncing ? <CircularProgress size={14} /> : <RefreshIcon />}
            onClick={handleSync}
            disabled={syncing}
          >
            Sync
          </Button>
        </Tooltip>
      </Box>

      {/* Group progress banner */}
      {groupMatches.length > 0 && (
        <Card
          elevation={0}
          sx={{
            mb: 3,
            border: '1px solid',
            borderColor: groupsComplete ? 'primary.main' : 'divider',
            bgcolor: groupsComplete ? 'rgba(0,132,61,0.08)' : 'background.paper',
          }}
        >
          <CardContent sx={{ py: 1.5, px: 2.5, '&:last-child': { pb: 1.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Gruppenphase Tipps
                  </Typography>
                  <Typography variant="body2" color={groupsComplete ? 'primary.main' : 'text.secondary'} sx={{ fontWeight: 600 }}>
                    {tippedGroupCount} / {groupMatches.length}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={groupProgress}
                  color={groupsComplete ? 'success' : 'primary'}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
              <Button
                variant={groupsComplete ? 'contained' : 'outlined'}
                size="small"
                startIcon={<TableChartIcon fontSize="small" />}
                onClick={() => navigate('/standings')}
                disabled={!groupsComplete && tippedGroupCount === 0}
                sx={{ whiteSpace: 'nowrap' }}
              >
                {groupsComplete ? 'KO-Runden tippen' : 'Gruppenstand ansehen'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      <Tabs
        value={stageFilter}
        onChange={(_, v) => setStageFilter(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3, '& .MuiTabs-indicator': { bgcolor: 'primary.main' } }}
      >
        {STAGES.map((s) => (
          <Tab key={s.key} value={s.key} label={s.label} sx={{ fontWeight: 500, minWidth: 'auto' }} />
        ))}
      </Tabs>

      {Object.keys(grouped).length === 0 ? (
        <Typography color="text.secondary">Keine Spiele in dieser Kategorie.</Typography>
      ) : (
        Object.entries(grouped).map(([date, dayMatches]) => (
          <Box key={date} sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'text.secondary', textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 }}>
              {date}
            </Typography>
            <Grid container spacing={2}>
              {dayMatches.map((match) => (
                <Grid key={match.id} size={{ xs: 12, lg: 6 }}>
                  <MatchCard
                    match={match}
                    prediction={predictions.find((p) => p.match_id === match.id)}
                    onSave={handleSavePrediction}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        ))
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
