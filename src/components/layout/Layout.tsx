import React from 'react';
import { Box, Toolbar, useTheme, useMediaQuery } from '@mui/material';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const DRAWER_WIDTH = 260;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // ✅ Responsive width: full on mobile, minus drawer on desktop
          width: isMobile ? '100%' : `calc(100% - ${DRAWER_WIDTH}px)`,
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Topbar />
        <Toolbar /> {/* Spacer for fixed AppBar */}
        
        {/* ✅ Responsive padding: less on mobile */}
        <Box sx={{ 
          p: isMobile ? 2 : 3,
          // ✅ Extra top padding on mobile for hamburger button
          pt: isMobile ? 8 : 3,
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
