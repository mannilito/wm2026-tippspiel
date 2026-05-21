import { createTheme } from '@mui/material/styles';
import { green, amber } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00843D', // FIFA-Grün
      light: '#00a84d',
      dark: '#006630',
      contrastText: '#ffffff',
    },
    secondary: {
      main: amber[500],
      light: amber[300],
      dark: amber[700],
      contrastText: '#000000',
    },
    background: {
      default: '#0a1628',
      paper: '#0f1f3d',
    },
    success: {
      main: green[500],
    },
    text: {
      primary: '#f0f4ff',
      secondary: '#94a3c4',
    },
    divider: 'rgba(255,255,255,0.08)',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme;
