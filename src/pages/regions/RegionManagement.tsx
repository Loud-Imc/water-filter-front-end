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
  InputAdornment,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Collapse,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
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
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [formData, setFormData] = useState({
    state: 'Kerala',
    district: '',
    taluk: '',
    city: '',
    pincode: '',
  });

  const [districts, setDistricts] = useState<DistrictData[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

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

  const generateRegionName = (): string => {
    const parts = [
      formData.state,
      formData.district,
      formData.taluk,
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
        taluk: region.taluk || '',
        city: region.city || '',
        pincode: region.pincode || '',
      });
    } else {
      setSelectedRegion(null);
      setFormData({
        state: 'Kerala',
        district: '',
        taluk: '',
        city: '',
        pincode: '',
      });
    }
    setDialog(true);
  };

  const handleCloseDialog = () => {
    setDialog(false);
    setSelectedRegion(null);
    setFormData({ state: 'Kerala', district: '', taluk: '', city: '', pincode: '' });
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
        taluk: formData.taluk || undefined,
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

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDistrict('');
    setSortBy('name');
    setSortOrder('asc');
  };

  const uniqueDistricts = Array.from(new Set(regions.map(r => r.district).filter(Boolean)));

  const filteredRegions = regions
    .filter((region) => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesName = region.name.toLowerCase().includes(search);
        const matchesDistrict = region.district?.toLowerCase().includes(search);
        const matchesTaluk = region.taluk?.toLowerCase().includes(search);
        const matchesCity = region.city?.toLowerCase().includes(search);
        const matchesPincode = region.pincode?.toLowerCase().includes(search);
        if (!matchesName && !matchesDistrict && !matchesTaluk && !matchesCity && !matchesPincode) return false;
      }
      if (selectedDistrict && region.district !== selectedDistrict) return false;
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'district':
          comparison = (a.district || '').localeCompare(b.district || '');
          break;
        case 'city':
          comparison = (a.city || '').localeCompare(b.city || '');
          break;
        case 'pincode':
          comparison = (a.pincode || '').localeCompare(b.pincode || '');
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

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

      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder="Search by name, district, taluk, city, or pincode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
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
                <MenuItem value="district">District</MenuItem>
                <MenuItem value="city">City</MenuItem>
                <MenuItem value="pincode">Pincode</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Order</InputLabel>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
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
              variant={showFilters ? 'contained' : 'outlined'}
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
          </Grid>
        </Grid>

        <Collapse in={showFilters}>
          <Paper sx={{ mt: 2, p: 2, bgcolor: 'grey.50' }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>District</InputLabel>
                  <Select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    label="District"
                  >
                    <MenuItem value="">All Districts</MenuItem>
                    {uniqueDistricts.map((district) => (
                      <MenuItem key={district} value={district}>
                        {district}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Showing {filteredRegions.length} of {regions.length} regions
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
      </Card>

      {filteredRegions.length === 0 ? (
        <EmptyState
          title="No regions found"
          description={
            searchTerm || selectedDistrict
              ? "No regions match your filters. Try adjusting your search."
              : "Create your first region to get started"
          }
          actionLabel={searchTerm || selectedDistrict ? "Clear Filters" : "Add Region"}
          onAction={() => (searchTerm || selectedDistrict ? handleClearFilters() : handleOpenDialog())}
        />
      ) : (
        <Card>
          <List>
            {filteredRegions.map((region, index) => (
              <ListItem key={region.id} divider={index < filteredRegions.length - 1}>
                <ListItemText
                  primary={region.name}
                  secondary={
                    [
                      region.district,
                      region.taluk,
                      region.city,
                      region.pincode,
                    ]
                      .filter(Boolean)
                      .join(' • ') || 'N/A'
                  }
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

      <Dialog open={dialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedRegion ? 'Edit Region' : 'Create New Region'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="State"
              value="Kerala"
              disabled
              variant="outlined"
            />

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

            <TextField
              fullWidth
              label="Taluk (Optional)"
              value={formData.taluk}
              onChange={(e) => setFormData(prev => ({ ...prev, taluk: e.target.value }))}
              placeholder="e.g., Kottayam, Meenachil, Vaikom"
              helperText="Enter taluk/tehsil name if applicable"
            />

            <TextField
              fullWidth
              label="City / Place"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              placeholder="Enter city (e.g., Kochi, Pala)"
              helperText="Enter city or place name"
            />

            <TextField
              fullWidth
              label="Pincode"
              value={formData.pincode}
              onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
              placeholder="Enter pincode (e.g., 682001)"
              helperText="Enter 6-digit pincode"
              inputProps={{ maxLength: 6 }}
            />

            {generateRegionName() && (
              <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="info.dark">
                  Region Name Preview:
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
