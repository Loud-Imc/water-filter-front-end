import React, { useState } from "react";
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
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BuildIcon from "@mui/icons-material/Build";
import WorkIcon from "@mui/icons-material/Work";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import HistoryIcon from "@mui/icons-material/History";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { useAppSelector } from "../../app/hooks";
import { usePermission } from "../../hooks/usePermission";
import { PERMISSIONS } from "../../constants/permissions";

const DRAWER_WIDTH = 260;

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
  permissions?: string[];
  divider?: boolean; // ✅ NEW: Add divider after this item
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const { hasAnyPermission } = usePermission();
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  // ✅ REORGANIZED: Menu items by priority and workflow
  const menuItems: MenuItem[] = [
    // ========== CORE OPERATIONS (Most Used) ==========
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: <DashboardIcon />,
      permissions: [PERMISSIONS.DASHBOARD_VIEW],
    },
    {
      label: "Service Requests",
      path: "/service-requests",
      icon: <AssignmentIcon />,
      permissions: [PERMISSIONS.SERVICES_VIEW],
    },
    {
      label: "New Service",
      path: "/service-requests/create",
      icon: <AddCircleIcon />,
      permissions: [PERMISSIONS.SERVICES_CREATE],
      divider: true, // ✅ Separator after service operations
    },

    // ========== CUSTOMER MANAGEMENT ==========
    {
      label: "Customer Management",
      path: "/customers",
      icon: <PersonIcon />,
      permissions: [PERMISSIONS.CUSTOMERS_VIEW],
      divider: true, // ✅ Separator after customers
    },

    // ========== TECHNICIAN OPERATIONS (Role-Specific) ==========
    {
      label: "My Tasks",
      path: "/technician/my-tasks",
      icon: <WorkIcon />,
      permissions: [PERMISSIONS.SERVICES_VIEW],
      roles: ["Technician"],
    },
    {
      label: "Task History",
      path: "/technician/task-history",
      icon: <HistoryIcon />,
      permissions: [PERMISSIONS.SERVICES_VIEW],
      roles: ["Technician"],
      divider: true, // ✅ Separator after technician section
    },

    // ========== INVENTORY & RESOURCES ==========
    {
      label: "Products",
      path: "/products",
      icon: <InventoryIcon />,
      permissions: [PERMISSIONS.PRODUCTS_VIEW],
      divider: true, // ✅ Separator after products
    },

    // ========== SYSTEM ADMINISTRATION (Admin Only) ==========
    {
      label: "User Management",
      path: "/users",
      icon: <PeopleIcon />,
      permissions: [PERMISSIONS.USERS_VIEW],
    },
    {
      label: "Role Management",
      path: "/roles",
      icon: <GroupIcon />,
      roles: ["Super Admin", "Service Admin", "Sales Admin"],
    },
    {
      label: "Region Management",
      path: "/regions",
      icon: <LocationOnIcon />,
      permissions: [PERMISSIONS.REGIONS_VIEW],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    if (!user) return false;

    if (item.roles && !item.roles.includes(user.role.name)) {
      return false;
    }

    if (item.permissions) {
      return hasAnyPermission(item.permissions);
    }

    return true;
  });

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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <BuildIcon sx={{ fontSize: 32, color: "primary.main" }} />
            <Typography variant="h6" fontWeight={600} color="primary">
              Water Filter
            </Typography>
          </Box>
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
            <React.Fragment key={item.path}>
              <ListItem disablePadding>
                <ListItemButton
                  selected={isActive}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: "primary.light",
                      color: "primary.contrastText",
                      "&:hover": {
                        backgroundColor: "primary.main",
                      },
                      "& .MuiListItemIcon-root": {
                        color: "primary.contrastText",
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? "inherit" : "text.secondary",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>

              {/* ✅ Add divider if specified */}
              {item.divider && <Divider sx={{ my: 1 }} />}
            </React.Fragment>
          );
        })}
      </List>

      {filteredMenuItems.length === 0 && (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No menu items available
          </Typography>
        </Box>
      )}
    </>
  );

  return (
    <>
      {isMobile && !mobileOpen && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            position: "fixed",
            top: 60,
            left: 16,
            zIndex: (theme) => theme.zIndex.drawer + 2,
            bgcolor: "primary.main",
            color: "white",
            "&:hover": {
              bgcolor: "primary.dark",
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
