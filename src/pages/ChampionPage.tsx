import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Divider from '@mui/material/Divider';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Team, ChampionPrediction, Match } from '../lib/supabase';
import { getChampionPoints, getChampionTiers } from '../lib/championPoints';

export default function ChampionPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [championPrediction, setChampionPrediction] = useState<ChampionPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Team | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  useEffect(() => {
    async function load() {
      if (!user) return;
      const [teamsRes, matchesRes, champRes] = await Promise.all([
        supabase.from('teams').select('*').order('name'),
        supabase.from('matches').select('*').order('match_date'),
        supabase
          .from('champion_predictions')
          .select('*, team:teams(*)')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);
      setTeams(teamsRes.data || []);
      setMatches((matchesRes.data || []) as Match[]);
      setChampionPrediction(champRes.data as ChampionPrediction | null);
      setLoading(false);
    }
    load();
  }, [user]);

  const currentPoints = getChampionPoints(matches);
  const tiers = getChampionTiers(matches);
  const canTip = currentPoints > 0;

  const filtered = search.trim()
    ? teams.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    : teams;

  async function handleSave() {
    if (!selected || !user || !canTip) return;
    setSaving(true);

    if (championPrediction) {
      const { error } = await supabase
        .from('champion_predictions')
        .update({ team_id: selected.id, tipped_at: new Date().toISOString() })
        .eq('id', championPrediction.id);
      if (error) {
        setSnackbar({ open: true, message: 'Fehler beim Speichern', severity: 'error' });
        setSaving(false);
        return;
      }
      setChampionPrediction({ ...championPrediction, team_id: selected.id, team: selected as any });
    } else {
      const { data, error } = await supabase
        .from('champion_predictions')
        .insert({ user_id: user.id, team_id: selected.id })
        .select('*, team:teams(*)')
        .single();
      if (error) {
        setSnackbar({ open: true, message: 'Fehler beim Speichern', severity: 'error' });
        setSaving(false);
        return;
      }
      setChampionPrediction(data as ChampionPrediction);
    }

    setSnackbar({ open: true, message: `Weltmeister-Tipp gespeichert: ${selected.name}`, severity: 'success' });
    setSelected(null);
    setSaving(false);
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const currentChampTeam = (championPrediction?.team as any) as Team | undefined;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <EmojiEventsIcon sx={{ fontSize: 36, color: 'secondary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Weltmeister-Tipp</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Tippe den Weltmeister und erhalte Bonuspunkte – je früher du tippst, desto mehr Punkte!
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Aktuelle Punkte */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Punkteübersicht</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {tiers.map((tier) => (
                  <Box
                    key={tier.points}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: tier.points === currentPoints && canTip
                        ? 'rgba(0,132,61,0.15)'
                        : 'rgba(255,255,255,0.03)',
                      border: '1px solid',
                      borderColor: tier.points === currentPoints && canTip
                        ? 'primary.main'
                        : 'divider',
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{tier.label}</Typography>
                      <Typography variant="caption" color="text.secondary">bis {tier.deadline}</Typography>
                    </Box>
                    <Chip
                      label={`${tier.points} Pkt.`}
                      color={tier.points === currentPoints && canTip ? 'primary' : 'default'}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                ))}
                {!canTip && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    Das Finale ist vorbei – kein Weltmeister-Tipp mehr möglich.
                  </Alert>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Aktueller Tipp */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Dein Weltmeister-Tipp</Typography>
              {championPrediction && currentChampTeam ? (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <EmojiEventsIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    {currentChampTeam.name}
                  </Typography>
                  <Chip
                    label={`Getippt am ${new Date(championPrediction.tipped_at).toLocaleDateString('de-DE')}`}
                    size="small"
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  <Box>
                    {championPrediction.points_awarded > 0 ? (
                      <Chip
                        label={`${championPrediction.points_awarded} Punkte erhalten!`}
                        color="success"
                        icon={<CheckCircleIcon />}
                      />
                    ) : canTip ? (
                      <Chip
                        label={`Aktuell ${currentPoints} Punkte bei richtigem Tipp`}
                        color="primary"
                        variant="outlined"
                      />
                    ) : null}
                  </Box>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography color="text.secondary">
                    Du hast noch keinen Weltmeister getippt.
                  </Typography>
                </Box>
              )}

              {canTip && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {championPrediction ? 'Tipp ändern:' : 'Nation auswählen:'}
                    {' '}
                    <Chip label={`Aktuell ${currentPoints} Punkte`} size="small" color="secondary" />
                  </Typography>

                  {selected ? (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, flex: 1 }}>
                        Ausgewählt: {selected.name}
                      </Typography>
                      <Button variant="outlined" size="small" onClick={() => setSelected(null)}>
                        Abbrechen
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? <CircularProgress size={16} color="inherit" /> : 'Speichern'}
                      </Button>
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Wähle unten eine Nation aus.
                    </Typography>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Team selection */}
      {canTip && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Alle teilnehmenden Nationen</Typography>
          <TextField
            size="small"
            placeholder="Nation suchen…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 2, width: { xs: '100%', sm: 300 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Grid container spacing={1.5}>
            {filtered.map((team) => {
              const isSelected = selected?.id === team.id;
              const isCurrent = currentChampTeam?.id === team.id;
              return (
                <Grid key={team.id} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                  <Box
                    onClick={() => setSelected(team)}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: isSelected ? 'secondary.main' : isCurrent ? 'primary.main' : 'divider',
                      bgcolor: isSelected
                        ? 'rgba(255,179,0,0.12)'
                        : isCurrent
                        ? 'rgba(0,132,61,0.1)'
                        : 'rgba(255,255,255,0.03)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s',
                      '&:hover': {
                        borderColor: 'secondary.light',
                        bgcolor: 'rgba(255,179,0,0.08)',
                      },
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: isSelected || isCurrent ? 700 : 400 }}>
                      {team.name}
                    </Typography>
                    {team.group_name && (
                      <Typography variant="caption" color="text.secondary">
                        Gruppe {team.group_name}
                      </Typography>
                    )}
                    {isCurrent && (
                      <Box sx={{ mt: 0.5 }}>
                        <CheckCircleIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                      </Box>
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
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
