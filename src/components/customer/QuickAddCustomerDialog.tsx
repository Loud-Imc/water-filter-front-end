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
  Tooltip,
} from '@mui/material';
import { Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { customerService } from '../../api/services/customerService';
// import { regionService } from '../../api/services/regionService';
import { SearchableSelect } from '../common/SearchableSelect';
import PhoneNumberInput from './PhoneNumberInput';
import QuickAddRegionDialog from '../region/QuickAddRegionDialog';
import type { CreateCustomerDto } from '../../types';

interface QuickAddCustomerDialogProps {
  open: boolean;
  onClose: () => void;
  onCustomerCreated: (customerId: string, customerName: string, regionId: string) => void;
  preSelectedRegionId?: string;
}

const QuickAddCustomerDialog: React.FC<QuickAddCustomerDialogProps> = ({
  open,
  onClose,
  onCustomerCreated,
  preSelectedRegionId,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [regionDialog, setRegionDialog] = useState(false);
  
  const [formData, setFormData] = useState<CreateCustomerDto>({
    name: '',
    address: '',
    primaryPhone: '',
    phoneNumbers: [],
    email: null,
    regionId: preSelectedRegionId || '',
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        name: '',
        address: '',
        primaryPhone: '',
        phoneNumbers: [],
        email: '',
        regionId: preSelectedRegionId || '',
      });
      setError('');
    }
  }, [open, preSelectedRegionId]);

  // Handle region creation from nested dialog
  const handleRegionCreated = async (newRegionId: string) => {
    // Auto-select the newly created region
    setFormData({ ...formData, regionId: newRegionId });
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      setError('Customer name is required');
      return;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      return;
    }
    if (!formData.primaryPhone || formData.primaryPhone.length !== 10) {
      setError('Valid 10-digit phone number is required');
      return;
    }
    if (!formData.regionId) {
      setError('Region is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newCustomer = await customerService.createCustomer(formData);
      
      // Notify parent with new customer details
      onCustomerCreated(newCustomer.id, newCustomer.name, newCustomer.regionId);
      
      // Close dialog
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
              <Typography variant="h6">Quick Add Customer</Typography>
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
              {/* Customer Name */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  required
                  label="Customer Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  autoFocus
                  disabled={loading}
                />
              </Grid>

              {/* Region with Quick Add */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <SearchableSelect
                      label="Region *"
                      value={formData.regionId}
                      onChange={(value) => setFormData({ ...formData, regionId: value || '' })}
                      endpoint="/regions/search"
                      placeholder="Type to search region..."
                      disabled={loading}
                      helperText="Type at least 2 characters to search"
                      renderOption={(option: any) => (
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            {option.name}
                          </Typography>
                          {option.district && (
                            <Typography variant="caption" color="text.secondary">
                              {option.district} • {option.city || 'N/A'} • {option.pincode || 'N/A'}
                            </Typography>
                          )}
                        </Box>
                      )}
                    />
                  </Box>
                  
                  {/* Quick Add Region Button */}
                  <Tooltip title="Create new region">
                    <IconButton
                      color="primary"
                      onClick={() => setRegionDialog(true)}
                      disabled={loading}
                      sx={{
                        border: 1,
                        borderColor: 'primary.main',
                        borderRadius: 1,
                        mt: 1,
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
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
            />

            {/* Phone Numbers */}
            <PhoneNumberInput
              primaryPhone={formData.primaryPhone}
              additionalPhones={formData.phoneNumbers || []}
              onPrimaryPhoneChange={(phone) =>
                setFormData({ ...formData, primaryPhone: phone })
              }
              onAdditionalPhonesChange={(phones) =>
                setFormData({ ...formData, phoneNumbers: phones })
              }
              disabled={loading}
            />

            {/* Email (Optional) */}
            <TextField
              fullWidth
              label="Email (Optional)"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="customer@example.com"
              disabled={loading}
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
              !formData.primaryPhone || 
              formData.primaryPhone.length !== 10 || 
              !formData.regionId
            }
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Creating...' : 'Create & Select'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Nested Quick Add Region Dialog */}
      <QuickAddRegionDialog
        open={regionDialog}
        onClose={() => setRegionDialog(false)}
        onRegionCreated={handleRegionCreated}
      />
    </>
  );
};

export default QuickAddCustomerDialog;
