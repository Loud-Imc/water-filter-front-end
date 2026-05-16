import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { customerService } from '../../api/services/customerService';
import { toast } from 'react-hot-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  sourceCustomer: any;
}

const MergeCustomerDialog: React.FC<Props> = ({ open, onClose, sourceCustomer }) => {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [targetCustomer, setTargetCustomer] = useState<any | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    if (query.length < 3) return;
    setLoading(true);
    try {
      const data = await customerService.searchCustomers(query);
      // Filter out the source customer
      setOptions(data.filter((c: any) => c.id !== sourceCustomer.id));
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!targetCustomer) return;
    
    setSubmitting(true);
    setError(null);
    try {
      await customerService.createMergeRequest(
        sourceCustomer.id,
        targetCustomer.id,
        reason
      );
      toast.success('Merge request submitted for administrator approval');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit merge request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Merge Duplicate Customer</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            You are initiating a merge for <strong>{sourceCustomer.name}</strong>. 
            All service history and installations will be moved to the target customer.
            <strong> This action requires administrator approval.</strong>
          </Alert>
          
          <Typography variant="subtitle2" gutterBottom>
            Source Customer (The one that will be merged/deleted)
          </Typography>
          <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1, mb: 2 }}>
            <Typography variant="body2" fontWeight={600}>{sourceCustomer.name}</Typography>
            <Typography variant="caption" color="text.secondary">{sourceCustomer.primaryPhone}</Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            Target Customer (The one that will keep the data)
          </Typography>
          <Autocomplete
            options={options}
            getOptionLabel={(option) => `${option.name} (${option.primaryPhone})`}
            loading={loading}
            onInputChange={(_, value) => handleSearch(value)}
            onChange={(_, value) => setTargetCustomer(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Target Customer"
                variant="outlined"
                placeholder="Type name or phone number..."
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <TextField
            fullWidth
            label="Reason for merging (Optional)"
            multiline
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            sx={{ mt: 2 }}
          />

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="warning"
          disabled={!targetCustomer || submitting}
        >
          {submitting ? 'Submitting...' : 'Request Merge'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MergeCustomerDialog;
