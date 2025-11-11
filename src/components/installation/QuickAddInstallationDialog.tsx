import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Chip,
  IconButton,
  Alert,
  MenuItem,
} from '@mui/material';
import { Grid } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { installationService } from '../../api/services/installationService';
import type { CreateInstallationDto } from '../../types';

interface QuickAddInstallationDialogProps {
  open: boolean;
  onClose: () => void;
  onInstallationCreated: (installationId: string, installationName: string) => void;
  customerId: string;
  preSelectedRegionId?: string;
}

const QuickAddInstallationDialog: React.FC<QuickAddInstallationDialogProps> = ({
  open,
  onClose,
  onInstallationCreated,
  customerId,
  preSelectedRegionId,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<CreateInstallationDto>({
    customerId,
    regionId: preSelectedRegionId || '',
    name: '',
    address: '',
    landmark: '',
    contactPerson: '',
    contactPhone: '',
    installationType: 'Commercial',
    notes: '',
    isPrimary: false,
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        customerId,
        regionId: preSelectedRegionId || '',
        name: '',
        address: '',
        landmark: '',
        contactPerson: '',
        contactPhone: '',
        installationType: 'Commercial',
        notes: '',
        isPrimary: false,
      });
      setError('');
    }
  }, [open, customerId, preSelectedRegionId]);

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      setError('Installation name is required');
      return;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      return;
    }
    if (!formData.regionId) {
      setError('Region is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newInstallation = await installationService.createInstallation(formData);
      
      // Notify parent with new installation details
      onInstallationCreated(newInstallation.id, newInstallation.name);
      
      // Close dialog
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create installation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={!loading ? onClose : undefined}
      maxWidth="md" 
      fullWidth
      disableEscapeKeyDown={loading}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">Add New Installation</Typography>
            <Chip label="New" size="small" color="primary" />
          </Box>
          {!loading && (
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Installation Name */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
                label="Installation Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Main Office, Branch 1"
                autoFocus
                disabled={loading}
                helperText="Descriptive name for this location"
              />
            </Grid>

            {/* Installation Type */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                fullWidth
                label="Installation Type"
                value={formData.installationType}
                onChange={(e) => setFormData({ ...formData, installationType: e.target.value })}
                disabled={loading}
              >
                <MenuItem value="Residential">Residential</MenuItem>
                <MenuItem value="Commercial">Commercial</MenuItem>
                <MenuItem value="Industrial">Industrial</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          {/* Address */}
          <TextField
            fullWidth
            required
            multiline
            rows={2}
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            disabled={loading}
            placeholder="Full installation address"
          />

          {/* Landmark */}
          <TextField
            fullWidth
            label="Landmark (Optional)"
            value={formData.landmark}
            onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
            disabled={loading}
            placeholder="e.g., Near City Mall"
          />

          <Grid container spacing={2}>
            {/* Contact Person */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Contact Person (Optional)"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                disabled={loading}
                placeholder="On-site contact name"
              />
            </Grid>

            {/* Contact Phone */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Contact Phone (Optional)"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                disabled={loading}
                placeholder="9876543210"
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
          </Grid>

          {/* Notes */}
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Notes (Optional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            disabled={loading}
            placeholder="Additional information about this installation"
          />
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={
            loading || 
            !formData.name || 
            !formData.address || 
            !formData.regionId
          }
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Creating...' : 'Create & Select'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuickAddInstallationDialog;
