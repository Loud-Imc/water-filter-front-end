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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import GroupIcon from "@mui/icons-material/Group";
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

  // ✅ Filter state: 'all' | 'inhouse' | 'external'
  const [technicianFilter, setTechnicianFilter] = useState<string>("all");

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

  // ✅ Filter logic based on toggle
  const filteredUsers = users.filter((user) => {
    // Only apply filter if user is a technician
    const isTechnician = user.role?.name === "Technician";

    if (!isTechnician) return true; // Show all non-technicians

    if (technicianFilter === "all") return true;
    if (technicianFilter === "inhouse") return !user.isExternal;
    if (technicianFilter === "external") return user.isExternal;

    return true;
  });

  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // ✅ Count technicians
  const technicianCount = {
    all: users.filter((u) => u.role?.name === "Technician").length,
    inhouse: users.filter((u) => u.role?.name === "Technician" && !u.isExternal)
      .length,
    external: users.filter((u) => u.role?.name === "Technician" && u.isExternal)
      .length,
  };

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
    // ✅ Add Technician Type column
    {
      id: "isExternal",
      label: "Type",
      minWidth: 140,
      format: (value: boolean, row: User) => {
        // Only show for technicians
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
      format: (_: any, row: User) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              console.log("🔵 Edit button clicked for user:", row, _);
              navigate(`/users/edit/${row.id}`);
            }}
          >
            Edit
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              console.log("🔴 Delete button clicked for user:", row.id);
              setSelectedUserId(row.id);
              setDeleteDialog(true);
            }}
          >
            Delete
          </Button>
        </Box>
      ),
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

      {/* ✅ Technician Filter Toggle */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
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
                  setPage(0); // Reset to first page
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
        </CardContent>
      </Card>

      {filteredUsers.length === 0 ? (
        <EmptyState
          title="No users found"
          description={
            technicianFilter === "all"
              ? "Create your first user to get started"
              : "No technicians match the selected filter"
          }
          actionLabel={technicianFilter === "all" ? "Add User" : "Clear Filter"}
          onAction={() =>
            technicianFilter === "all"
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
