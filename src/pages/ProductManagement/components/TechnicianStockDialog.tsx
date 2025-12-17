import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  TextField,
  Alert,
  Autocomplete,
  IconButton,
} from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import { sparePartsService } from '../../../api/services/sparePartsService';
import { productService } from '../../../api/services/productService';
import type { TechnicianStock, User } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

interface TechnicianStockDialogProps {
  open: boolean;
  onClose: () => void;

  // Support both products and spare parts
  itemType: 'product' | 'sparePart';
  itemId: string;
  itemName: string;

  warehouseStock: number;
  technicians: User[];
  onTransferComplete: () => void;
}

const TechnicianStockDialog: React.FC<TechnicianStockDialogProps> = ({
  open,
  onClose,
  itemType,
  itemId,
  itemName,
  warehouseStock,
  technicians,
  onTransferComplete,
}) => {
  const [technicianStocks, setTechnicianStocks] = useState<TechnicianStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [transferMode, setTransferMode] = useState(false);
  const [returnMode, setReturnMode] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [selectedStockForReturn, setSelectedStockForReturn] = useState<TechnicianStock | null>(null);
  const [transferQuantity, setTransferQuantity] = useState(0);
  const [returnQuantity, setReturnQuantity] = useState(0);
  const [error, setError] = useState('');

  // Local state for warehouse stock that updates immediately
  const [currentWarehouseStock, setCurrentWarehouseStock] = useState(warehouseStock);



  useEffect(() => {
    if (open) {
      fetchTechnicianStock();
      // Reset warehouse stock to prop value when dialog opens
      setCurrentWarehouseStock(warehouseStock);
    }
  }, [open, itemId, itemType]);

  const fetchTechnicianStock = async () => {
    setLoading(true);
    try {
      const data = itemType === 'sparePart'
        ? await sparePartsService.getTechnicianStock(itemId)
        : await productService.getTechnicianStock(itemId);
      setTechnicianStocks(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch technician stock');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedTechnician || transferQuantity <= 0) return;

    setLoading(true);
    setError('');
    try {
      let response;
      if (itemType === 'sparePart') {
        response = await sparePartsService.transferToTechnician(
          itemId,
          selectedTechnician,
          transferQuantity
        );
      } else {
        response = await productService.transferToTechnician(
          itemId,
          selectedTechnician,
          transferQuantity
        );
      }

      // Update local warehouse stock immediately from API response
      if (response?.warehouseStock !== undefined) {
        setCurrentWarehouseStock(response.warehouseStock);
      }

      setTransferMode(false);
      setSelectedTechnician('');
      setTransferQuantity(0);
      await fetchTechnicianStock();
      onTransferComplete();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to transfer stock');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!selectedStockForReturn || returnQuantity <= 0) return;

    setLoading(true);
    setError('');
    try {
      let response;
      if (itemType === 'sparePart') {
        response = await sparePartsService.returnFromTechnician(
          itemId,
          selectedStockForReturn.technician?.id || '',
          returnQuantity
        );
      } else {
        response = await productService.returnFromTechnician(
          itemId,
          selectedStockForReturn.technician?.id || '',
          returnQuantity
        );
      }

      // Update local warehouse stock immediately from API response
      if (response?.warehouseStock !== undefined) {
        setCurrentWarehouseStock(response.warehouseStock);
      }

      setReturnMode(false);
      setSelectedStockForReturn(null);
      setReturnQuantity(0);
      await fetchTechnicianStock();
      onTransferComplete();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to return stock');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnClick = (stock: TechnicianStock) => {
    setSelectedStockForReturn(stock);
    setReturnQuantity(0);
    setReturnMode(true);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Technician Stock: {itemName}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2">
            Warehouse Stock: <strong>{currentWarehouseStock}</strong>
          </Typography>
        </Box>

        {loading && !transferMode && !returnMode ? (
          <LoadingSpinner />
        ) : (
          <>
            {!transferMode && !returnMode ? (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  Technicians with Stock:
                </Typography>
                {technicianStocks.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No technicians currently have this {itemType === 'sparePart' ? 'spare part' : 'product'}.
                  </Typography>
                ) : (
                  <List>
                    {technicianStocks.map((stock) => (
                      <ListItem
                        key={stock.id}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          mb: 1,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <ListItemText
                          primary={stock.technician.name}
                          secondary={
                            <>
                              {stock.technician.email}
                              {stock.technician.region && ` • ${stock.technician.region.name}`}
                            </>
                          }
                          sx={{ flex: 1 }}
                        />
                        <Chip
                          label={`Qty: ${stock.quantity}`}
                          color="primary"
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleReturnClick(stock)}
                          title="Return Stock"
                          color="secondary"
                        >
                          <UndoIcon />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                )}

                <Divider sx={{ my: 2 }} />

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setTransferMode(true)}
                  disabled={warehouseStock === 0}
                >
                  Transfer Stock to Technician
                </Button>
              </>
            ) : transferMode ? (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  Transfer Stock
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <Autocomplete
                    fullWidth
                    options={technicians}
                    getOptionLabel={(option) => option.name}
                    value={
                      technicians.find((tech) => tech.id === selectedTechnician) || null
                    }
                    onChange={(_, newValue) => {
                      setSelectedTechnician(newValue?.id || '');
                    }}
                    renderOption={(props, option) => {
                      const { key, ...otherProps } = props as any;
                      return (
                        <li key={option.id} {...otherProps}>
                          <Box sx={{ width: '100%' }}>
                            <Typography variant="body2" fontWeight={500}>
                              {option.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.email}
                              {option.region && ` • ${option.region.name}`}
                            </Typography>
                          </Box>
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Technician *"
                        placeholder="Type to search..."
                        helperText="Search by name"
                      />
                    )}
                    noOptionsText="No technicians available"
                  />

                  <TextField
                    fullWidth
                    label="Quantity to Transfer *"
                    type="number"
                    value={transferQuantity}
                    onChange={(e) => setTransferQuantity(Number(e.target.value))}
                    inputProps={{ min: 1, max: currentWarehouseStock }}
                    helperText={`Available warehouse stock: ${currentWarehouseStock}`}
                  />

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      onClick={handleTransfer}
                      disabled={
                        !selectedTechnician ||
                        transferQuantity <= 0 ||
                        transferQuantity > currentWarehouseStock ||
                        loading
                      }
                    >
                      {loading ? 'Transferring...' : 'Transfer'}
                    </Button>
                    <Button
                      onClick={() => {
                        setTransferMode(false);
                        setSelectedTechnician('');
                        setTransferQuantity(0);
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              </>
            ) : (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  Return Stock from {selectedStockForReturn?.technician.name}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <Box sx={{ p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
                    <Typography variant="body2">
                      Current with Technician: <strong>{selectedStockForReturn?.quantity}</strong>
                    </Typography>
                  </Box>

                  <TextField
                    fullWidth
                    label="Quantity to Return *"
                    type="number"
                    value={returnQuantity}
                    onChange={(e) => setReturnQuantity(Number(e.target.value))}
                    inputProps={{ min: 1, max: selectedStockForReturn?.quantity || 0 }}
                    helperText={`Technician has ${selectedStockForReturn?.quantity || 0} units`}
                  />

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleReturn}
                      disabled={
                        returnQuantity <= 0 ||
                        returnQuantity > (selectedStockForReturn?.quantity || 0) ||
                        loading
                      }
                    >
                      {loading ? 'Returning...' : 'Return Stock'}
                    </Button>
                    <Button
                      onClick={() => {
                        setReturnMode(false);
                        setSelectedStockForReturn(null);
                        setReturnQuantity(0);
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              </>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TechnicianStockDialog;
