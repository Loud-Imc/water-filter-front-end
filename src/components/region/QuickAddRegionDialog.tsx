import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  Chip,
} from '@mui/material';
import { regionService } from '../../api/services/regionService';
import type { DistrictData, Region } from '../../types';

interface QuickAddRegionDialogProps {
  open: boolean;
  onClose: () => void;
  onRegionCreated: (regionId: string) => void;
}

const QuickAddRegionDialog: React.FC<QuickAddRegionDialogProps> = ({
  open,
  onClose,
  onRegionCreated,
}) => {
  const [loading, setLoading] = useState(false);
  const [districts, setDistricts] = useState<DistrictData[]>([]);
  
  const [formData, setFormData] = useState({
    state: 'Kerala',
    district: '',
    city: '',
    pincode: '',
  });

  const [error, setError] = useState('');

  // Fetch districts when dialog opens
  useEffect(() => {
    if (open) {
      fetchDistricts();
      // Reset form
      setFormData({
        state: 'Kerala',
        district: '',
        city: '',
        pincode: '',
      });
      setError('');
    }
  }, [open]);

  const fetchDistricts = async () => {
    try {
      const data = await regionService.getDistricts('Kerala');
      setDistricts(data);
    } catch (error) {
      console.error('Failed to fetch districts:', error);
      setError('Failed to load districts');
    }
  };

  const generateRegionName = (): string => {
    const parts = [
      formData.state,
      formData.district,
      formData.city,
      formData.pincode,
    ].filter(Boolean);
    return parts.join(' - ') || '';
  };

  const handleSave = async () => {
    try {
      if (!formData.district.trim()) {
        setError('District is required');
        return;
      }

      setLoading(true);
      setError('');

      const regionName = generateRegionName();

      const regionData: Partial<Region> = {
        name: regionName,
        state: formData.state,
        district: formData.district,
        city: formData.city || undefined,
        pincode: formData.pincode || undefined,
      };

      const newRegion = await regionService.createRegion(regionData);
      
      // Notify parent with the new region ID
      onRegionCreated(newRegion.id);
      
      // Close dialog
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create region');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      // Prevent closing the customer dialog behind
      disableEscapeKeyDown={loading}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">Quick Add Region</Typography>
          <Chip label="New" size="small" color="primary" />
        </Box>
      </DialogTitle>
      
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
            error={!!error && !formData.district}
            helperText={!formData.district && error}
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
            placeholder="e.g., Kochi, Pala, Aluva"
            helperText="Enter city or place name"
          />

          {/* Pincode - Manual Text Input */}
          <TextField
            fullWidth
            label="Pincode"
            value={formData.pincode}
            onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
            placeholder="e.g., 682001"
            helperText="Enter 6-digit pincode"
            inputProps={{ maxLength: 6 }}
          />

          {/* Generated Name Display */}
          {generateRegionName() && (
            <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="success.dark" gutterBottom>
                ✓ Region Name Preview:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.dark' }}>
                {generateRegionName()}
              </Typography>
            </Box>
          )}

          {/* Error Message */}
          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!formData.district.trim() || loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Creating...' : 'Create & Select'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuickAddRegionDialog;
