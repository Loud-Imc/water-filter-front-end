import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import EmptyState from '../../components/common/EmptyState';
import { roleService } from '../../api/services/roleService';
import { type Role } from '../../types';

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  const fetchRoles = async () => {
    try {
      const data = await roleService.getAllRoles();
      setRoles(data);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleOpenDialog = (role?: Role) => {
    if (role) {
      setSelectedRole(role);
      setRoleName(role.name);
    } else {
      setSelectedRole(null);
      setRoleName('');
    }
    setDialog(true);
  };

  const handleCloseDialog = () => {
    setDialog(false);
    setSelectedRole(null);
    setRoleName('');
  };

  const handleSave = async () => {
    try {
      if (selectedRole) {
        await roleService.updateRole(selectedRole.id, { name: roleName });
        setSnackbar({ open: true, message: 'Role updated successfully!', severity: 'success' });
      } else {
        await roleService.createRole({ name: roleName, permissions: {} });
        setSnackbar({ open: true, message: 'Role created successfully!', severity: 'success' });
      }
      handleCloseDialog();
      fetchRoles();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Operation failed', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    if (selectedRole) {
      try {
        await roleService.deleteRole(selectedRole.id);
        setSnackbar({ open: true, message: 'Role deleted successfully!', severity: 'success' });
        setDeleteDialog(false);
        setSelectedRole(null);
        fetchRoles();
      } catch (error: any) {
        setSnackbar({ open: true, message: error.message || 'Failed to delete role', severity: 'error' });
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <PageHeader
        title="Role Management"
        action={{
          label: 'Add Role',
          icon: <AddIcon />,
          onClick: () => handleOpenDialog(),
        }}
      />

      {roles.length === 0 ? (
        <EmptyState
          title="No roles found"
          description="Create your first role to get started"
          actionLabel="Add Role"
          onAction={() => handleOpenDialog()}
        />
      ) : (
        <Card>
          <List>
            {roles.map((role, index) => (
              <ListItem
                key={role.id}
                divider={index < roles.length - 1}
              >
                <ListItemText
                  primary={role.name}
                  secondary={role.parentRole || 'No parent role'}
                />
                {role.immutable && (
                  <Chip label="System Role" color="primary" size="small" sx={{ mr: 2 }} />
                )}
                <ListItemSecondaryAction>
                  {!role.immutable && (
                    <>
                      <IconButton edge="end" onClick={() => handleOpenDialog(role)} sx={{ mr: 1 }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => {
                          setSelectedRole(role);
                          setDeleteDialog(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedRole ? 'Edit Role' : 'Create Role'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Role Name"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            sx={{ mt: 2 }}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!roleName.trim()}>
            {selectedRole ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialog}
        title="Delete Role"
        message="Are you sure you want to delete this role? This action cannot be undone."
        confirmLabel="Delete"
        severity="error"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteDialog(false);
          setSelectedRole(null);
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

export default RoleManagement;
