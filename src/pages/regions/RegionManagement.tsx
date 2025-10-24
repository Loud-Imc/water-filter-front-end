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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import EmptyState from '../../components/common/EmptyState';
import { regionService } from '../../api/services/regionService';
import type { Region } from '../../types';

const RegionManagement: React.FC = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [regionName, setRegionName] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  const fetchRegions = async () => {
    try {
      const data = await regionService.getAllRegions();
      setRegions(data);
    } catch (error) {
      console.error('Failed to fetch regions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  const handleOpenDialog = (region?: Region) => {
    if (region) {
      setSelectedRegion(region);
      setRegionName(region.name);
    } else {
      setSelectedRegion(null);
      setRegionName('');
    }
    setDialog(true);
  };

  const handleCloseDialog = () => {
    setDialog(false);
    setSelectedRegion(null);
    setRegionName('');
  };

  const handleSave = async () => {
    try {
      if (selectedRegion) {
        await regionService.updateRegion(selectedRegion.id, { name: regionName });
        setSnackbar({ open: true, message: 'Region updated successfully!', severity: 'success' });
      } else {
        await regionService.createRegion({ name: regionName });
        setSnackbar({ open: true, message: 'Region created successfully!', severity: 'success' });
      }
      handleCloseDialog();
      fetchRegions();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Operation failed', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    if (selectedRegion) {
      try {
        await regionService.deleteRegion(selectedRegion.id);
        setSnackbar({ open: true, message: 'Region deleted successfully!', severity: 'success' });
        setDeleteDialog(false);
        setSelectedRegion(null);
        fetchRegions();
      } catch (error: any) {
        setSnackbar({ open: true, message: error.message || 'Failed to delete region', severity: 'error' });
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <PageHeader
        title="Region Management"
        action={{
          label: 'Add Region',
          icon: <AddIcon />,
          onClick: () => handleOpenDialog(),
        }}
      />

      {regions.length === 0 ? (
        <EmptyState
          title="No regions found"
          description="Create your first region to get started"
          actionLabel="Add Region"
          onAction={() => handleOpenDialog()}
        />
      ) : (
        <Card>
          <List>
            {regions.map((region, index) => (
              <ListItem
                key={region.id}
                divider={index < regions.length - 1}
              >
                <ListItemText primary={region.name} />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => handleOpenDialog(region)} sx={{ mr: 1 }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={() => {
                      setSelectedRegion(region);
                      setDeleteDialog(true);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedRegion ? 'Edit Region' : 'Create Region'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Region Name"
            value={regionName}
            onChange={(e) => setRegionName(e.target.value)}
            sx={{ mt: 2 }}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!regionName.trim()}>
            {selectedRegion ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialog}
        title="Delete Region"
        message="Are you sure you want to delete this region? This action cannot be undone."
        confirmLabel="Delete"
        severity="error"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteDialog(false);
          setSelectedRegion(null);
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

export default RegionManagement;
