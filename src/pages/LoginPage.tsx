import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (tab === 0) {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
    } else {
      if (!displayName.trim()) {
        setError('Bitte gib einen Anzeigenamen ein.');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, displayName);
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Konto erstellt! Du kannst dich jetzt einloggen.');
        setTab(0);
      }
    }
    setLoading(false);
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,132,61,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -100,
          left: -100,
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,179,0,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <Box sx={{ width: '100%', maxWidth: 440 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <SportsSoccerIcon sx={{ fontSize: 48, color: 'primary.main' }} />
            <EmojiEventsIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
            WM 2026
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
            Tippspiel
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => { setTab(v); setError(''); setSuccess(''); }}
            variant="fullWidth"
            sx={{ mb: 3, '& .MuiTabs-indicator': { bgcolor: 'primary.main' } }}
          >
            <Tab label="Anmelden" sx={{ fontWeight: 600 }} />
            <Tab label="Registrieren" sx={{ fontWeight: 600 }} />
          </Tabs>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tab === 1 && (
              <TextField
                label="Anzeigename"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                autoComplete="name"
                fullWidth
                variant="outlined"
              />
            )}
            <TextField
              label="E-Mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Passwort"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={tab === 0 ? 'current-password' : 'new-password'}
              fullWidth
              variant="outlined"
              inputProps={{ minLength: 6 }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              fullWidth
              sx={{ mt: 1, py: 1.5 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : tab === 0 ? 'Anmelden' : 'Konto erstellen'}
            </Button>
          </Box>
        </Paper>

        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 3, color: 'text.secondary' }}>
          FIFA Weltmeisterschaft 2026 · USA, Kanada & Mexiko
        </Typography>
      </Box>
    </Box>
  );
}
