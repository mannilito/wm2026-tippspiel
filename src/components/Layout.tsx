import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TableChartIcon from '@mui/icons-material/TableChart';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';

const DRAWER_WIDTH = 240;

const navItems = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { label: 'Spiele & Tipps', path: '/matches', icon: <SportsSoccerIcon /> },
  { label: 'Tabellen & KO', path: '/standings', icon: <TableChartIcon /> },
  { label: 'Weltmeister', path: '/champion', icon: <EmojiEventsIcon /> },
  { label: 'Rangliste', path: '/leaderboard', icon: <LeaderboardIcon /> },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Nutzer';

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <SportsSoccerIcon sx={{ color: 'primary.main', fontSize: 32 }} />
        <Box>
          <Typography variant="h6" sx={{ lineHeight: 1.2, color: 'text.primary', fontWeight: 700 }}>
            WM 2026
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Tippspiel
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'divider' }} />

      <List sx={{ flex: 1, pt: 1 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ px: 1, mb: 0.5 }}>
              <ListItemButton
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                sx={{
                  borderRadius: 2,
                  bgcolor: active ? 'primary.main' : 'transparent',
                  color: active ? 'primary.contrastText' : 'text.secondary',
                  '&:hover': {
                    bgcolor: active ? 'primary.dark' : 'rgba(255,255,255,0.06)',
                    color: 'text.primary',
                  },
                  transition: 'all 0.15s',
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: active ? 600 : 400 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'divider' }} />

      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14, fontWeight: 700 }}>
          {displayName.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }} noWrap>
            {displayName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
            {user?.email}
          </Typography>
        </Box>
        <Tooltip title="Abmelden">
          <IconButton size="small" onClick={signOut} sx={{ color: 'text.secondary' }}>
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {isMobile ? (
        <>
          <AppBar
            position="fixed"
            elevation={0}
            sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}
          >
            <Toolbar>
              <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
              <SportsSoccerIcon sx={{ color: 'primary.main', mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>
                WM 2026 Tippspiel
              </Typography>
            </Toolbar>
          </AppBar>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, bgcolor: 'background.paper', boxSizing: 'border-box' } }}
          >
            {drawerContent}
          </Drawer>
          <Box component="main" sx={{ flex: 1, pt: 8, px: 2, pb: 4 }}>
            {children}
          </Box>
        </>
      ) : (
        <>
          <Drawer
            variant="permanent"
            sx={{
              width: DRAWER_WIDTH,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                bgcolor: 'background.paper',
                boxSizing: 'border-box',
                border: 'none',
                borderRight: '1px solid',
                borderColor: 'divider',
              },
            }}
          >
            {drawerContent}
          </Drawer>
          <Box component="main" sx={{ flex: 1, p: 4, maxWidth: 1200 }}>
            {children}
          </Box>
        </>
      )}
    </Box>
  );
}
