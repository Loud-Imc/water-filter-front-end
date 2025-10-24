import React, { useEffect, useState } from 'react';
import { Box, Button, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchAllUsers, deleteUser } from '../../app/slices/userSlice';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import EmptyState from '../../components/common/EmptyState';
import type { User } from '../../types';

const UserList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { users, loading } = useAppSelector((state) => state.users);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async () => {
    if (selectedUserId) {
      try {
        await dispatch(deleteUser(selectedUserId)).unwrap();
        setSnackbar({
          open: true,
          message: 'User deleted successfully!',
          severity: 'success',
        });
        setDeleteDialog(false);
        setSelectedUserId(null);
      } catch (error: any) {
        setSnackbar({
          open: true,
          message: error || 'Failed to delete user',
          severity: 'error',
        });
      }
    }
  };

  const paginatedUsers = users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const columns = [
    { id: 'name', label: 'Name', minWidth: 150 },
    { id: 'email', label: 'Email', minWidth: 200 },
    {
      id: 'role',
      label: 'Role',
      minWidth: 150,
      format: (value: any) => value?.name,
    },
    {
      id: 'region',
      label: 'Region',
      minWidth: 120,
      format: (value: any) => value?.name || 'N/A',
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      format: (value: string) => (
        <Chip
          label={value}
          color={value === 'ACTIVE' ? 'success' : 'error'}
          size="small"
        />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 150,
      format: (_: any, row: User) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" onClick={() => navigate(`/users/edit/${row.id}`)}>
            Edit
          </Button>
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
          label: 'Add User',
          icon: <AddIcon />,
          onClick: () => navigate('/users/create'),
        }}
      />

      {users.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Create your first user to get started"
          actionLabel="Add User"
          onAction={() => navigate('/users/create')}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={paginatedUsers}
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={users.length}
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
