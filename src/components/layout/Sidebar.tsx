import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Divider,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BuildIcon from '@mui/icons-material/Build';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useAppSelector } from '../../app/hooks';

const DRAWER_WIDTH = 260;

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const theme = useTheme();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <DashboardIcon />,
      roles: ['Super Admin', 'Service Admin', 'Sales Admin', 'Service Manager', 'Sales Manager', 'Service Team Lead', 'Sales Team Lead', 'Technician', 'Salesman'],
    },
    {
      label: 'Service Requests',
      path: '/service-requests',
      icon: <AssignmentIcon />,
      roles: ['Super Admin', 'Service Admin', 'Sales Admin', 'Service Manager', 'Sales Manager', 'Service Team Lead', 'Sales Team Lead'],
    },
    {
      label: 'New Service',
      path: '/service-requests/create',
      icon: <AddCircleIcon />,
      roles: ['Super Admin', 'Service Admin', 'Sales Admin', 'Service Manager', 'Sales Manager', 'Service Team Lead', 'Sales Team Lead', 'Technician', 'Salesman'],
    },
    {
      label: 'User Management',
      path: '/users',
      icon: <PeopleIcon />,
      roles: ['Super Admin', 'Service Admin', 'Sales Admin', 'Service Manager', 'Sales Manager', 'Service Team Lead', 'Sales Team Lead'],
    },
    {
      label: 'Role Management',
      path: '/roles',
      icon: <GroupIcon />,
      roles: ['Super Admin', 'Service Admin', 'Sales Admin'],
    },
    {
      label: 'Region Management',
      path: '/regions',
      icon: <LocationOnIcon />,
      roles: ['Super Admin', 'Service Admin', 'Sales Admin'],
    },
    {
      label: 'Customer Management',
      path: '/customers',
      icon: <PersonIcon />,
      roles: ['Super Admin', 'Service Admin', 'Sales Admin', 'Service Manager', 'Sales Manager'],
    },
    {
      label: 'My Tasks',
      path: '/technician/my-tasks',
      icon: <WorkIcon />,
      roles: ['Technician'],
    },
    {
      label: 'Task History',
      path: '/technician/task-history',
      icon: <HistoryIcon />,
      roles: ['Technician'],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    user ? item.roles.includes(user.role.name) : false
  );

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BuildIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={600} color="primary">
              Water Filter
            </Typography>
          </Box>
          {/* ✅ Close button only shown in mobile drawer */}
          {isMobile && (
            <IconButton onClick={handleDrawerToggle} edge="end">
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'inherit' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );

  return (
    <>
      {/* ✅ Hamburger button - ONLY show when drawer is CLOSED */}
      {isMobile && !mobileOpen && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            position: 'fixed',
            top: 60,
            left: 16,
            zIndex: (theme) => theme.zIndex.drawer + 2,
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
