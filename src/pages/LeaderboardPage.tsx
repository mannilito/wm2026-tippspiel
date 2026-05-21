import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { LeaderboardEntry } from '../lib/supabase';

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    return (
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          bgcolor: MEDAL_COLORS[rank - 1],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: 14,
          color: rank === 1 ? '#4a3800' : rank === 2 ? '#1a1a1a' : '#2a1500',
        }}
      >
        {rank}
      </Box>
    );
  }
  return (
    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, width: 32, textAlign: 'center' }}>
      {rank}
    </Typography>
  );
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('leaderboard').select('*');
      setEntries((data || []) as LeaderboardEntry[]);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const myEntry = entries.find((e) => e.user_id === user?.id);
  const myRank = myEntry ? entries.indexOf(myEntry) + 1 : null;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <LeaderboardIcon sx={{ fontSize: 36, color: 'primary.main' }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Rangliste</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Alle Teilnehmer sortiert nach Gesamtpunkten
      </Typography>

      {/* My rank highlight */}
      {myEntry && (
        <Card
          elevation={0}
          sx={{
            mb: 3,
            border: '1px solid',
            borderColor: 'primary.main',
            bgcolor: 'rgba(0,132,61,0.08)',
          }}
        >
          <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <EmojiEventsIcon sx={{ color: 'secondary.main' }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary">Deine Position</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  Platz {myRank} · {myEntry.total_points} Punkte
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary">
                  {myEntry.exact_predictions}× exakt · {myEntry.diff_predictions}× Differenz · {myEntry.result_predictions}× Ergebnis
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', width: 56 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Spieler</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }} align="right">Gesamt</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', display: { xs: 'none', sm: 'table-cell' } }} align="center">
                  <Tooltip title="Exakt richtig (5 Pkt.)">
                    <span>5 Pkt.</span>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', display: { xs: 'none', sm: 'table-cell' } }} align="center">
                  <Tooltip title="Richtige Differenz (4 Pkt.)">
                    <span>4 Pkt.</span>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', display: { xs: 'none', md: 'table-cell' } }} align="center">
                  <Tooltip title="Richtiges Ergebnis (3 Pkt.)">
                    <span>3 Pkt.</span>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', display: { xs: 'none', md: 'table-cell' } }} align="center">
                  <Tooltip title="Falsch (0 Pkt.)">
                    <span>0 Pkt.</span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry, idx) => {
                const rank = idx + 1;
                const isMe = entry.user_id === user?.id;
                return (
                  <TableRow
                    key={entry.user_id}
                    sx={{
                      bgcolor: isMe ? 'rgba(0,132,61,0.06)' : 'transparent',
                      '&:last-child td': { border: 0 },
                    }}
                  >
                    <TableCell>
                      <RankBadge rank={rank} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: isMe ? 'primary.main' : 'rgba(255,255,255,0.1)',
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        >
                          {(entry.display_name || entry.email || '?').charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: isMe ? 700 : 400 }}>
                            {entry.display_name || entry.email?.split('@')[0]}
                            {isMe && (
                              <Chip label="Du" size="small" color="primary" sx={{ ml: 1, height: 18, fontSize: 10 }} />
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {entry.total_points}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                        {entry.exact_predictions}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Typography variant="body2" sx={{ color: 'info.main', fontWeight: 600 }}>
                        {entry.diff_predictions}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 600 }}>
                        {entry.result_predictions}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
                        {entry.wrong_predictions}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
