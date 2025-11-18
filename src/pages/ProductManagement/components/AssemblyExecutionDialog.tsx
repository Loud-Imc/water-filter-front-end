import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
//   FormControlLabel,
  Checkbox,
  TextField,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { bomTemplatesService } from '../../../api/services/bomTemplatesService';
import type { BOMTemplate } from '../../../types';
// import LoadingSpinner from '../../../components/common/LoadingSpinner';

interface AssemblyExecutionDialogProps {
  open: boolean;
  onClose: () => void;
  template: BOMTemplate;
  onAssemblyComplete: () => void;
}

const AssemblyExecutionDialog: React.FC<AssemblyExecutionDialogProps> = ({
  open,
  onClose,
  template,
  onAssemblyComplete,
}) => {
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && template) {
      // Pre-select all required (non-optional) parts
      const requiredParts = template.items
        ?.filter(item => !item.isOptional)
        .map(item => item.sparePartId) || [];
      setSelectedParts(requiredParts);
      setNotes('');
      setError('');
    }
  }, [open, template]);

  const handleTogglePart = (sparePartId: string, isOptional: boolean) => {
    if (!isOptional) return; // Cannot uncheck required parts

    setSelectedParts(prev =>
      prev.includes(sparePartId)
        ? prev.filter(id => id !== sparePartId)
        : [...prev, sparePartId]
    );
  };

  const handleExecute = async () => {
    if (selectedParts.length === 0) {
      setError('Please select at least one spare part');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await bomTemplatesService.executeAssembly(template.id, {
        selectedSparePartIds: selectedParts,
        notes,
      });
      onAssemblyComplete();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to execute assembly');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalCost = (): number => {
    return template.items
      ?.filter(item => selectedParts.includes(item.sparePartId))
      .reduce((sum, item) => sum + Number(item?.sparePart?.price) * item?.quantity, 0) || 0;
  };

  const checkStockAvailability = () => {
    const insufficientStock = template.items?.filter(item => {
      if (!selectedParts.includes(item.sparePartId)) return false;
      return item?.sparePart?.stock < item.quantity;
    });
    return insufficientStock || [];
  };

  const insufficientStock = checkStockAvailability();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Execute Assembly: {template.name}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {insufficientStock.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600}>
              Insufficient Stock for:
            </Typography>
            {insufficientStock.map(item => (
              <Typography key={item.id} variant="caption" display="block">
                • {item.sparePart.name}: Required {item.quantity}, Available {item.sparePart.stock}
              </Typography>
            ))}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Product: <strong>{template.product.name}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select spare parts to use in this assembly. Required parts are pre-selected.
          </Typography>
        </Box>

        {/* Spare Parts Selection Table */}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">Use</TableCell>
              <TableCell>Spare Part</TableCell>
              <TableCell align="center">Required Qty</TableCell>
              <TableCell align="center">Available</TableCell>
              <TableCell align="right">Unit Price</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {template.items?.map((item) => {
              const isSelected = selectedParts.includes(item.sparePartId);
              const hasStock = item?.sparePart?.stock >= item.quantity;
              
              return (
                <TableRow key={item.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleTogglePart(item.sparePartId, item.isOptional)}
                      disabled={!item.isOptional || !hasStock}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      {item?.sparePart?.name}
                      {item.isOptional && (
                        <Chip
                          label="Optional"
                          size="small"
                          variant="outlined"
                          sx={{ ml: 1 }}
                        />
                      )}
                      {!hasStock && (
                        <Chip
                          label="Low Stock"
                          size="small"
                          color="error"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">{item.quantity}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={item?.sparePart?.stock}
                      size="small"
                      color={hasStock ? 'success' : 'error'}
                    />
                  </TableCell>
                  <TableCell align="right">₹{Number(item?.sparePart?.price).toFixed(2)}</TableCell>
                  <TableCell align="right">
                    {isSelected ? `₹${(Number(item?.sparePart?.price) * item.quantity).toFixed(2)}` : '-'}
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow>
              <TableCell colSpan={5} align="right">
                <strong>Total Cost:</strong>
              </TableCell>
              <TableCell align="right">
                <strong>₹{calculateTotalCost().toFixed(2)}</strong>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <TextField
          fullWidth
          label="Assembly Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          multiline
          rows={2}
          sx={{ mt: 3 }}
          placeholder="Any notes about this assembly..."
        />

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Upon execution, selected spare parts will be deducted from stock and 1 unit of{' '}
            <strong>{template.product.name}</strong> will be added to inventory.
          </Typography>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleExecute}
          variant="contained"
          disabled={selectedParts.length === 0 || insufficientStock.length > 0 || loading}
        >
          {loading ? 'Executing...' : 'Execute Assembly'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssemblyExecutionDialog;
