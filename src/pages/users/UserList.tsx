import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  Paper,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import GroupIcon from "@mui/icons-material/Group";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchAllUsers, deleteUser } from "../../app/slices/userSlice";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import SnackbarNotification from "../../components/common/SnackbarNotification";
import EmptyState from "../../components/common/EmptyState";
import type { User } from "../../types";

const UserList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { users, loading } = useAppSelector((state) => state.users);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [technicianFilter, setTechnicianFilter] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as any,
  });

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async () => {
    if (selectedUserId) {
      try {
        await dispatch(deleteUser(selectedUserId)).unwrap();
        setSnackbar({
          open: true,
          message: "User deleted successfully!",
          severity: "success",
        });
        setDeleteDialog(false);
        setSelectedUserId(null);
      } catch (error: any) {
        setSnackbar({
          open: true,
          message: error || "Failed to delete user",
          severity: "error",
        });
      }
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setTechnicianFilter("all");
    setSelectedRole("");
    setSelectedRegion("");
    setSelectedStatus("");
    setSortBy("name");
    setSortOrder("asc");
  };

  const roles = Array.from(
    new Set(users.map((u) => u.role?.name).filter(Boolean))
  );
  const regions = Array.from(
    new Set(users.map((u) => u.region?.name).filter(Boolean))
  );

  const technicianCount = {
    all: users.filter((u) => u.role?.name === "Technician").length,
    inhouse: users.filter((u) => u.role?.name === "Technician" && !u.isExternal)
      .length,
    external: users.filter((u) => u.role?.name === "Technician" && u.isExternal)
      .length,
  };

  const filteredUsers = users
    .filter((user) => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesName = user.name.toLowerCase().includes(search);
        const matchesEmail = user.email.toLowerCase().includes(search);
        const matchesPhone = user.phone?.toLowerCase().includes(search);
        if (!matchesName && !matchesEmail && !matchesPhone) return false;
      }

      const isTechnician = user.role?.name === "Technician";
      if (isTechnician) {
        if (technicianFilter === "inhouse" && user.isExternal) return false;
        if (technicianFilter === "external" && !user.isExternal) return false;
      }

      if (selectedRole && user.role?.name !== selectedRole) return false;
      if (selectedRegion && user.region?.name !== selectedRegion) return false;
      if (selectedStatus && user.status !== selectedStatus) return false;

      return true;
    })
    .sort((a, b) => {
      // 🆕 Always show Super Admin first
      const aIsSuperAdmin = a.role?.name === "Super Admin";
      const bIsSuperAdmin = b.role?.name === "Super Admin";

      if (aIsSuperAdmin && !bIsSuperAdmin) return -1;
      if (!aIsSuperAdmin && bIsSuperAdmin) return 1;

      // Then apply regular sorting
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "email":
          comparison = a.email.localeCompare(b.email);
          break;
        case "role":
          comparison = (a.role?.name || "").localeCompare(b.role?.name || "");
          break;
        case "region":
          comparison = (a.region?.name || "").localeCompare(
            b.region?.name || ""
          );
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const columns = [
    { id: "name", label: "Name", minWidth: 150 },
    { id: "email", label: "Email", minWidth: 200 },
    {
      id: "role",
      label: "Role",
      minWidth: 150,
      format: (value: any) => value?.name,
    },
    {
      id: "region",
      label: "Region",
      minWidth: 120,
      format: (value: any) => value?.name || "N/A",
    },
    {
      id: "status",
      label: "Status",
      minWidth: 100,
      format: (value: string) => (
        <Chip
          label={value}
          color={value === "ACTIVE" ? "success" : "error"}
          size="small"
          sx={{ color: "white", fontWeight: 550 }}
        />
      ),
    },
    {
      id: "isExternal",
      label: "Type",
      minWidth: 140,
      format: (value: boolean, row: User) => {
        if (row.role?.name !== "Technician") return "—";
        return (
          <Chip
            icon={value ? <BusinessIcon /> : <PersonIcon />}
            label={value ? "External" : "In-House"}
            size="small"
            color={value ? "warning" : "primary"}
            variant="outlined"
          />
        );
      },
    },
    {
      id: "actions",
      label: "Actions",
      minWidth: 150,
      format: (_: any, row: User) => {
        const isSuperAdmin = row.role?.name === "Super Admin";

        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() =>
                navigate(`/users/edit/${row.id}`, {
                  state: { isSuperAdmin }, // 🆕 Pass isSuperAdmin via state
                })
              }
            >
              Edit
            </Button>
            {/* 🆕 Only show delete button if NOT Super Admin */}
            {!isSuperAdmin && (
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedUserId(row.id);
                  setDeleteDialog(true);
                }}
              >
                Delete
              </Button>
            )}
          </Box>
        );
      },
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <PageHeader
        title="User Management"
        action={{
          label: "Add User",
          icon: <AddIcon />,
          onClick: () => navigate("/users/create"),
        }}
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
              mb: 2,
            }}
          >
            <Typography variant="subtitle2" fontWeight={600}>
              Filter Technicians:
            </Typography>

            <ToggleButtonGroup
              value={technicianFilter}
              exclusive
              onChange={(_, newValue) => {
                if (newValue !== null) {
                  setTechnicianFilter(newValue);
                  setPage(0);
                }
              }}
              size="small"
            >
              <ToggleButton value="all">
                <GroupIcon sx={{ mr: 1, fontSize: 18 }} />
                All ({technicianCount.all})
              </ToggleButton>
              <ToggleButton value="inhouse">
                <PersonIcon sx={{ mr: 1, fontSize: 18 }} />
                In-House ({technicianCount.inhouse})
              </ToggleButton>
              <ToggleButton value="external">
                <BusinessIcon sx={{ mr: 1, fontSize: 18 }} />
                External ({technicianCount.external})
              </ToggleButton>
            </ToggleButtonGroup>

            {technicianFilter !== "all" && (
              <Chip
                label={`Filtered: ${filteredUsers.length} users`}
                onDelete={() => setTechnicianFilter("all")}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
          </Box>

          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchTerm("")}
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size={{ xs: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="role">Role</MenuItem>
                  <MenuItem value="region">Region</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Order</InputLabel>
                <Select
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value as "asc" | "desc")
                  }
                  label="Order"
                >
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                fullWidth
                variant={showFilters ? "contained" : "outlined"}
                startIcon={<FilterListIcon />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
            </Grid>
          </Grid>

          <Collapse in={showFilters}>
            <Paper sx={{ mt: 2, p: 2, bgcolor: "grey.50" }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={selectedRole}
                      onChange={(e) => {
                        setSelectedRole(e.target.value);
                        setPage(0);
                      }}
                      label="Role"
                    >
                      <MenuItem value="">All Roles</MenuItem>
                      {roles.map((role) => (
                        <MenuItem key={role} value={role}>
                          {role}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Region</InputLabel>
                    <Select
                      value={selectedRegion}
                      onChange={(e) => {
                        setSelectedRegion(e.target.value);
                        setPage(0);
                      }}
                      label="Region"
                    >
                      <MenuItem value="">All Regions</MenuItem>
                      {regions.map((region) => (
                        <MenuItem key={region} value={region}>
                          {region}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={selectedStatus}
                      onChange={(e) => {
                        setSelectedStatus(e.target.value);
                        setPage(0);
                      }}
                      label="Status"
                    >
                      <MenuItem value="">All Status</MenuItem>
                      <MenuItem value="ACTIVE">Active</MenuItem>
                      <MenuItem value="BLOCKED">Blocked</MenuItem>
                      <MenuItem value="SUSPENDED">Suspended</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2" color="text.secondary">
                      Showing {filteredUsers.length} of {users.length} users
                    </Typography>
                    <Button
                      startIcon={<ClearIcon />}
                      onClick={handleClearFilters}
                      size="small"
                    >
                      Clear All Filters
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Collapse>
        </CardContent>
      </Card>

      {filteredUsers.length === 0 ? (
        <EmptyState
          title="No users found"
          description={
            searchTerm || selectedRole || selectedRegion || selectedStatus
              ? "No users match your filters. Try adjusting your search."
              : technicianFilter === "all"
              ? "Create your first user to get started"
              : "No technicians match the selected filter"
          }
          actionLabel={
            searchTerm || selectedRole || selectedRegion || selectedStatus
              ? "Clear Filters"
              : technicianFilter === "all"
              ? "Add User"
              : "Clear Filter"
          }
          onAction={() =>
            searchTerm || selectedRole || selectedRegion || selectedStatus
              ? handleClearFilters()
              : technicianFilter === "all"
              ? navigate("/users/create")
              : setTechnicianFilter("all")
          }
        />
      ) : (
        <DataTable
          columns={columns}
          rows={paginatedUsers}
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={filteredUsers.length}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      )}

      <ConfirmDialog
        open={deleteDialog}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmLabel="Delete"
        severity="error"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteDialog(false);
          setSelectedUserId(null);
        }}
      />

      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
};

export default UserList;
