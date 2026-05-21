import { useEffect, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import TableChartIcon from '@mui/icons-material/TableChart';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LockIcon from '@mui/icons-material/Lock';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Match, Prediction, Team } from '../lib/supabase';
import { computeGroupStandings, allGroupsComplete, type GroupStanding } from '../lib/groupStandings';

// ─── Flag helper ──────────────────────────────────────────────────────────────
function Flag({ code, size = 20 }: { code: string; size?: number }) {
  const url = `https://flagcdn.com/w${size * 2}/${code.toLowerCase().replace('gb-eng', 'gb-eng').replace('gb-sct', 'gb-sct')}.png`;
  return (
    <Box
      component="img"
      src={url}
      alt={code}
      sx={{ width: size, height: size * 0.67, objectFit: 'cover', borderRadius: 0.5, flexShrink: 0 }}
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
  );
}

// ─── Group table card ─────────────────────────────────────────────────────────
function GroupCard({ standing }: { standing: GroupStanding }) {
  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: standing.complete ? 'primary.main' : 'divider',
        height: '100%',
        transition: 'border-color 0.2s',
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Header */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: 1 }}>
            GRUPPE {standing.group}
          </Typography>
          {standing.complete ? (
            <CheckCircleOutlineIcon sx={{ fontSize: 16, color: 'primary.main' }} />
          ) : (
            <Tooltip title="Noch nicht alle Spiele getippt">
              <LockIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
            </Tooltip>
          )}
        </Box>

        {/* Table */}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'text.disabled', fontSize: 11, py: 0.75, fontWeight: 600 }}>#</TableCell>
                <TableCell sx={{ color: 'text.disabled', fontSize: 11, py: 0.75, fontWeight: 600 }}>Team</TableCell>
                <TableCell align="center" sx={{ color: 'text.disabled', fontSize: 11, py: 0.75, fontWeight: 600 }}>Sp</TableCell>
                <TableCell align="center" sx={{ color: 'text.disabled', fontSize: 11, py: 0.75, fontWeight: 600 }}>S</TableCell>
                <TableCell align="center" sx={{ color: 'text.disabled', fontSize: 11, py: 0.75, fontWeight: 600 }}>U</TableCell>
                <TableCell align="center" sx={{ color: 'text.disabled', fontSize: 11, py: 0.75, fontWeight: 600 }}>N</TableCell>
                <TableCell align="center" sx={{ color: 'text.disabled', fontSize: 11, py: 0.75, fontWeight: 600 }}>Tore</TableCell>
                <TableCell align="center" sx={{ color: 'text.disabled', fontSize: 11, py: 0.75, fontWeight: 600 }}>Diff</TableCell>
                <TableCell align="center" sx={{ color: 'text.disabled', fontSize: 11, py: 0.75, fontWeight: 600, pr: 1.5 }}>Pkt</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {standing.teams.map((row, idx) => {
                const advances = idx < 2;
                const thirdPlace = idx === 2;
                return (
                  <TableRow
                    key={row.team.id}
                    sx={{
                      bgcolor: advances
                        ? 'rgba(0,132,61,0.07)'
                        : thirdPlace
                        ? 'rgba(255,179,0,0.05)'
                        : 'transparent',
                      '&:last-child td': { border: 0 },
                    }}
                  >
                    <TableCell sx={{ py: 1, pl: 1.5 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: advances ? 'primary.main' : thirdPlace ? 'warning.main' : 'text.disabled',
                        }}
                      >
                        {idx + 1}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Flag code={row.team.code} size={16} />
                        <Typography variant="caption" sx={{ fontWeight: advances ? 700 : 400, whiteSpace: 'nowrap' }}>
                          {row.team.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1 }}>
                      <Typography variant="caption" color="text.secondary">{row.played}</Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1 }}>
                      <Typography variant="caption" color="text.secondary">{row.won}</Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1 }}>
                      <Typography variant="caption" color="text.secondary">{row.drawn}</Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1 }}>
                      <Typography variant="caption" color="text.secondary">{row.lost}</Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1 }}>
                      <Typography variant="caption" color="text.secondary">{row.goalsFor}:{row.goalsAgainst}</Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{ color: row.goalDiff > 0 ? 'success.main' : row.goalDiff < 0 ? 'error.main' : 'text.secondary' }}
                      >
                        {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1, pr: 1.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: advances ? 'primary.main' : 'text.primary' }}>
                        {row.points}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Advancement legend */}
        <Box sx={{ px: 2, py: 1, display: 'flex', gap: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>Weiterkommen</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>Mögl. als 3.</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Knockout bracket slot ────────────────────────────────────────────────────
interface KOSlot {
  label: string;
  home?: Team;
  away?: Team;
}

function KOMatch({ slot, small = false }: { slot: KOSlot; small?: boolean }) {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        overflow: 'hidden',
        minWidth: small ? 140 : 180,
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ px: 1, py: 0.25, bgcolor: 'rgba(255,255,255,0.04)', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" sx={{ fontSize: 9, color: 'text.disabled', fontWeight: 600, letterSpacing: 0.5 }}>
          {slot.label}
        </Typography>
      </Box>
      {[slot.home, slot.away].map((team, i) => (
        <Box
          key={i}
          sx={{
            px: 1,
            py: 0.75,
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            borderBottom: i === 0 ? '1px solid' : 'none',
            borderColor: 'divider',
          }}
        >
          {team ? (
            <>
              <Flag code={team.code} size={14} />
              <Typography variant="caption" sx={{ fontWeight: 500, fontSize: small ? 10 : 11 }} noWrap>
                {team.name}
              </Typography>
            </>
          ) : (
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 10 }}>
              —
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
}

function KnockoutBracket({ standings }: { standings: GroupStanding[] }) {
  // Build a map: group -> [1st, 2nd]
  const groupMap = new Map<string, Team[]>();
  for (const g of standings) {
    groupMap.set(g.group, g.teams.slice(0, 2).map((t) => t.team));
  }

  function get(group: string, rank: 0 | 1): Team | undefined {
    return groupMap.get(group)?.[rank];
  }

  // Round of 32 pairings (based on FIFA WC 2026 bracket draw)
  const r32: KOSlot[] = [
    { label: '1A vs 2C', home: get('A', 0), away: get('C', 1) },
    { label: '1C vs 2A', home: get('C', 0), away: get('A', 1) },
    { label: '1B vs 2D', home: get('B', 0), away: get('D', 1) },
    { label: '1D vs 2B', home: get('D', 0), away: get('B', 1) },
    { label: '1E vs 2G', home: get('E', 0), away: get('G', 1) },
    { label: '1G vs 2E', home: get('G', 0), away: get('E', 1) },
    { label: '1F vs 2H', home: get('F', 0), away: get('H', 1) },
    { label: '1H vs 2F', home: get('H', 0), away: get('F', 1) },
    { label: '1I vs 2K', home: get('I', 0), away: get('K', 1) },
    { label: '1K vs 2I', home: get('K', 0), away: get('I', 1) },
    { label: '1J vs 2L', home: get('J', 0), away: get('L', 1) },
    { label: '1L vs 2J', home: get('L', 0), away: get('J', 1) },
    { label: '1A vs 3BCDE', home: get('A', 0), away: undefined },
    { label: '1B vs 3CDEF', home: get('B', 0), away: undefined },
    { label: '1C vs 3DEFG', home: get('C', 0), away: undefined },
    { label: '1D vs 3EFGH', home: get('D', 0), away: undefined },
  ];

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Basierend auf deinen Gruppentipps werden hier die Achtzehntelfinale-Paarungen angezeigt. Die genaue Klammer hängt vom offiziellen FIFA-Auslosungsschema ab.
      </Alert>

      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'text.secondary', letterSpacing: 1, textTransform: 'uppercase', fontSize: 11 }}>
        Runde der 32
      </Typography>

      <Grid container spacing={1.5}>
        {r32.map((slot, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <KOMatch slot={slot} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function StandingsPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  const load = useCallback(async () => {
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

  useEffect(() => { load(); }, [load]);

  const standings = computeGroupStandings(matches, predictions);
  const groupsComplete = allGroupsComplete(standings);
  const completedCount = standings.filter((g) => g.complete).length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Tabellen & KO-Runden</Typography>
          <Typography variant="body2" color="text.secondary">
            Gruppenstand basierend auf deinen Tipps · Runde der 32 nach Abschluss aller Gruppen
          </Typography>
        </Box>
        <Chip
          label={`${completedCount} / ${standings.length} Gruppen vollständig`}
          color={groupsComplete ? 'success' : 'default'}
          variant={groupsComplete ? 'filled' : 'outlined'}
          size="small"
        />
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 3, '& .MuiTabs-indicator': { bgcolor: 'primary.main' } }}
      >
        <Tab
          icon={<TableChartIcon fontSize="small" />}
          iconPosition="start"
          label="Gruppenphase"
          sx={{ fontWeight: 500, minHeight: 48 }}
        />
        <Tab
          icon={groupsComplete ? <AccountTreeIcon fontSize="small" /> : <LockIcon fontSize="small" />}
          iconPosition="start"
          label={groupsComplete ? 'KO-Runden' : 'KO-Runden (gesperrt)'}
          disabled={!groupsComplete}
          sx={{ fontWeight: 500, minHeight: 48 }}
        />
      </Tabs>

      {/* Groups tab */}
      {tab === 0 && (
        <>
          {!groupsComplete && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Tippe alle {matches.filter((m) => m.stage === 'group').length} Gruppenspiele um die KO-Runden freizuschalten.
              Noch {matches.filter((m) => m.stage === 'group').length - predictions.filter((p) => matches.find((m) => m.id === p.match_id && m.stage === 'group')).length} Tipps fehlen.
            </Alert>
          )}
          <Grid container spacing={2}>
            {standings.map((standing) => (
              <Grid key={standing.group} size={{ xs: 12, md: 6, xl: 4 }}>
                <GroupCard standing={standing} />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* KO tab */}
      {tab === 1 && groupsComplete && (
        <KnockoutBracket standings={standings} />
      )}
    </Box>
  );
}
