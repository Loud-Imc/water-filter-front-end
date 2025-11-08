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
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
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
import type { Region, DistrictData } from '../../types';

const RegionManagement: React.FC = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    state: 'Kerala',
    district: '',
    city: '',
    pincode: '',
  });

  // Dropdown data
  const [districts, setDistricts] = useState<DistrictData[]>([]);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  // Fetch regions
  const fetchRegions = async () => {
    try {
      const data = await regionService.getAllRegions();
      setRegions(data);
    } catch (error) {
      console.error('Failed to fetch regions:', error);
      setSnackbar({ open: true, message: 'Failed to load regions', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch Kerala districts
  const fetchDistricts = async () => {
    try {
      const data = await regionService.getDistricts('Kerala');
      setDistricts(data);
    } catch (error) {
      console.error('Failed to fetch districts:', error);
      setSnackbar({ open: true, message: 'Failed to load districts', severity: 'error' });
    }
  };

  useEffect(() => {
    fetchRegions();
    fetchDistricts();
  }, []);

  // Generate region name
  const generateRegionName = (): string => {
    const parts = [
      formData.state,
      formData.district,
      formData.city,
      formData.pincode,
    ].filter(Boolean);
    return parts.join(' - ') || '';
  };

  const handleOpenDialog = (region?: Region) => {
    if (region) {
      setSelectedRegion(region);
      setFormData({
        state: region.state || 'Kerala',
        district: region.district || '',
        city: region.city || '',
        pincode: region.pincode || '',
      });
    } else {
      setSelectedRegion(null);
      setFormData({
        state: 'Kerala',
        district: '',
        city: '',
        pincode: '',
      });
    }
    setDialog(true);
  };

  const handleCloseDialog = () => {
    setDialog(false);
    setSelectedRegion(null);
    setFormData({ state: 'Kerala', district: '', city: '', pincode: '' });
  };

  const handleSave = async () => {
    try {
      if (!formData.district.trim()) {
        setSnackbar({ open: true, message: 'District is required', severity: 'error' });
        return;
      }

      const regionName = generateRegionName();

      const regionData: Partial<Region> = {
        name: regionName,
        state: formData.state,
        district: formData.district,
        city: formData.city || undefined,
        pincode: formData.pincode || undefined,
      };

      if (selectedRegion) {
        await regionService.updateRegion(selectedRegion.id, regionData);
        setSnackbar({ open: true, message: 'Region updated successfully!', severity: 'success' });
      } else {
        await regionService.createRegion(regionData);
        setSnackbar({ open: true, message: 'Region created successfully!', severity: 'success' });
      }
      handleCloseDialog();
      fetchRegions();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Operation failed', severity: 'error' });
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
        setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to delete region', severity: 'error' });
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
              <ListItem key={region.id} divider={index < regions.length - 1}>
                <ListItemText
                  primary={region.name}
                  secondary={`${region.district || 'N/A'} • ${region.city || 'N/A'} • ${region.pincode || 'N/A'}`}
                />
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
        <DialogTitle>{selectedRegion ? 'Edit Region' : 'Create New Region'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {/* State (Fixed to Kerala) */}
            <TextField
              fullWidth
              label="State"
              value="Kerala"
              disabled
              variant="outlined"
            />

            {/* District Dropdown */}
            <TextField
              select
              fullWidth
              label="District *"
              value={formData.district}
              onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
            >
              <MenuItem value="">-- Select District --</MenuItem>
              {districts.map(d => (
                <MenuItem key={d.districtName} value={d.districtName}>
                  {d.districtName}
                </MenuItem>
              ))}
            </TextField>

            {/* City - Manual Text Input */}
            <TextField
              fullWidth
              label="City / Place"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              placeholder="Enter city (e.g., Kochi, Pala)"
              helperText="Telecaller enters manually"
            />

            {/* Pincode - Manual Text Input */}
            <TextField
              fullWidth
              label="Pincode"
              value={formData.pincode}
              onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
              placeholder="Enter pincode (e.g., 682001)"
              helperText="Telecaller enters manually"
            />

            {/* Generated Name Display */}
            {generateRegionName() && (
              <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="info.dark">
                  Region Name:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                  {generateRegionName()}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!formData.district.trim()}
          >
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
