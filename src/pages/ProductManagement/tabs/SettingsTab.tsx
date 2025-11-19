import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Alert,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import SaveIcon from '@mui/icons-material/Save';
import { settingsService } from '../../../api/services/settingsService';
import SnackbarNotification from '../../../components/common/SnackbarNotification';
import LoadingSpinner from '../../../components/common/LoadingSpinner';




const SettingsTab: React.FC = () => {
  const [threshold, setThreshold] = useState<number>(5);
  const [originalThreshold, setOriginalThreshold] = useState<number>(5);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as any,
  });

  useEffect(() => {
    fetchThreshold();
  }, []);

  const fetchThreshold = async () => {
    setLoading(true);
    try {
      const currentThreshold = await settingsService.getLowStockThreshold();
      setThreshold(currentThreshold);
      setOriginalThreshold(currentThreshold);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to load settings',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (threshold < 1) {
      setSnackbar({
        open: true,
        message: 'Threshold must be at least 1',
        severity: 'error',
      });
      return;
    }

    setSaving(true);
    try {
      await settingsService.setLowStockThreshold(threshold);
      setOriginalThreshold(threshold);
      setSnackbar({
        open: true,
        message: 'Low stock threshold updated successfully!',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to update settings',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setThreshold(originalThreshold);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <InventoryIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h6" fontWeight={600}>
              Stock Management Settings
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Configure stock alert thresholds for products and spare parts across the
            system
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            Items with stock quantity less than or equal to this threshold will be
            flagged as low stock and displayed in alerts
          </Alert>

          <Box sx={{ maxWidth: 500 }}>
            <TextField
              fullWidth
              label="Low Stock Threshold"
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              inputProps={{ min: 1 }}
              helperText="Products/Spare Parts with stock ≤ this value will be flagged as low stock"
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">units</InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving || threshold === originalThreshold}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>

              <Button
                variant="outlined"
                onClick={handleReset}
                disabled={threshold === originalThreshold}
              >
                Reset
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
};

export default SettingsTab;
