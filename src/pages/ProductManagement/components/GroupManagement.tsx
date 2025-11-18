import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Typography,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import { sparePartGroupsService } from '../../../api/services/sparePartGroupsService';
import type { SparePartGroup } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

interface GroupManagementProps {
  open: boolean;
  onClose: () => void;
  onGroupChange: () => void;
}

const GroupManagement: React.FC<GroupManagementProps> = ({
  open,
  onClose,
  onGroupChange,
}) => {
  const [groups, setGroups] = useState<SparePartGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<SparePartGroup | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      fetchGroups();
    }
  }, [open]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const data = await sparePartGroupsService.getAll(true);
      setGroups(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (group: SparePartGroup) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      description: group.description || '',
    });
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setSelectedGroup(null);
    setFormData({ name: '', description: '' });
    setError('');
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Group name is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (selectedGroup) {
        await sparePartGroupsService.update(selectedGroup.id, formData);
      } else {
        await sparePartGroupsService.create(formData);
      }
      await fetchGroups();
      handleCancelEdit();
      onGroupChange();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save group');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (group: SparePartGroup) => {
    setLoading(true);
    try {
      await sparePartGroupsService.toggleStatus(group.id);
      await fetchGroups();
      onGroupChange();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedGroup) return;

    setLoading(true);
    try {
      await sparePartGroupsService.delete(selectedGroup.id);
      await fetchGroups();
      setDeleteDialog(false);
      setSelectedGroup(null);
      onGroupChange();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete group');
      setDeleteDialog(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Manage Spare Part Groups</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Add/Edit Form */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              {editMode ? 'Edit Group' : 'Add New Group'}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label="Group Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Filters, Electronics, Fittings"
              />
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={2}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={editMode ? <EditIcon /> : <AddIcon />}
                  onClick={handleSave}
                  disabled={loading || !formData.name.trim()}
                >
                  {editMode ? 'Update' : 'Add'}
                </Button>
                {editMode && (
                  <Button onClick={handleCancelEdit} disabled={loading}>
                    Cancel
                  </Button>
                )}
              </Box>
            </Box>
          </Box>

          {/* Groups List */}
          {loading && !editMode ? (
            <LoadingSpinner />
          ) : (
            <List>
              {groups.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                  No groups yet. Add your first group above.
                </Typography>
              ) : (
                groups.map((group) => (
                  <ListItem
                    key={group.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {group.name}
                          {!group.isActive && (
                            <Chip label="Inactive" size="small" color="default" />
                          )}
                          {group._count && (
                            <Chip
                              label={`${group._count.spareParts} spare parts`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={group.description}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleStatus(group)}
                        title={group.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {group.isActive ? <ToggleOnIcon color="success" /> : <ToggleOffIcon />}
                      </IconButton>
                      <IconButton size="small" onClick={() => handleEdit(group)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setSelectedGroup(group);
                          setDeleteDialog(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog}
        title="Delete Group"
        message={`Are you sure you want to delete "${selectedGroup?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        severity="error"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteDialog(false);
          setSelectedGroup(null);
        }}
      />
    </>
  );
};

export default GroupManagement;
