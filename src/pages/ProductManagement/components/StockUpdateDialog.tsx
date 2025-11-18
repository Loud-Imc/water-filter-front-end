import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Typography,
  Box,
} from '@mui/material';

interface StockUpdateDialogProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (quantityChange: number, reason: string) => Promise<void>;
  itemName: string;
  currentStock: number;
  itemType: 'product' | 'spare part';
}

const StockUpdateDialog: React.FC<StockUpdateDialogProps> = ({
  open,
  onClose,
  onUpdate,
  itemName,
  currentStock,
  itemType,
}) => {
  const [quantityChange, setQuantityChange] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setQuantityChange(0);
      setReason('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (quantityChange === 0 || !reason) return;

    setLoading(true);
    try {
      await onUpdate(quantityChange, reason);
      onClose();
    } catch (error) {
      console.error('Error updating stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const newStock = currentStock + quantityChange;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Update Stock</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <Typography variant="body2">
            {itemType === 'product' ? 'Product' : 'Spare Part'}: <strong>{itemName}</strong>
          </Typography>
          <Typography variant="body2">
            Current Stock: <strong>{currentStock}</strong>
          </Typography>

          <TextField
            select
            fullWidth
            label="Reason *"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            <MenuItem value="Added Stock">Added Stock</MenuItem>
            <MenuItem value="Stock Return">Stock Return</MenuItem>
            <MenuItem value="Used in Service">Used in Service</MenuItem>
            <MenuItem value="Used in Assembly">Used in Assembly</MenuItem>
            <MenuItem value="Damage">Damage/Lost</MenuItem>
            <MenuItem value="Adjustment">Stock Adjustment</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="Quantity Change *"
            type="number"
            value={quantityChange}
            onChange={(e) => setQuantityChange(Number(e.target.value))}
            helperText="Positive to add, negative to remove"
          />

          {quantityChange !== 0 && (
            <Box
              sx={{
                p: 2,
                bgcolor: newStock < 0 ? 'error.light' : 'success.light',
                borderRadius: 1,
              }}
            >
              <Typography variant="body2">
                New Stock: <strong>{newStock}</strong>
              </Typography>
              {newStock < 0 && (
                <Typography variant="caption" color="error.dark">
                  Warning: Insufficient stock!
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!reason || quantityChange === 0 || newStock < 0 || loading}
        >
          {loading ? 'Updating...' : 'Update Stock'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StockUpdateDialog;
