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
  MenuItem,
  Alert,
} from '@mui/material';
import { sparePartsService } from '../../../api/services/sparePartsService';
import type { TechnicianStock, User } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

interface TechnicianStockDialogProps {
  open: boolean;
  onClose: () => void;
  sparePartId: string;
  sparePartName: string;
  warehouseStock: number;
  technicians: User[]; // Available technicians for transfer
  onTransferComplete: () => void;
}

const TechnicianStockDialog: React.FC<TechnicianStockDialogProps> = ({
  open,
  onClose,
  sparePartId,
  sparePartName,
  warehouseStock,
  technicians,
  onTransferComplete,
}) => {
  const [technicianStocks, setTechnicianStocks] = useState<TechnicianStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [transferMode, setTransferMode] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [transferQuantity, setTransferQuantity] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      fetchTechnicianStock();
    }
  }, [open, sparePartId]);

  const fetchTechnicianStock = async () => {
    setLoading(true);
    try {
      const data = await sparePartsService.getTechnicianStock(sparePartId);
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
      await sparePartsService.transferToTechnician(
        sparePartId,
        selectedTechnician,
        transferQuantity
      );
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Technician Stock: {sparePartName}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2">
            Warehouse Stock: <strong>{warehouseStock}</strong>
          </Typography>
        </Box>

        {loading && !transferMode ? (
          <LoadingSpinner />
        ) : (
          <>
            {!transferMode ? (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  Technicians with Stock:
                </Typography>
                {technicianStocks.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No technicians currently have this spare part.
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
                        />
                        <Chip
                          label={`Stock: ${stock.quantity}`}
                          color="primary"
                          size="small"
                        />
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
            ) : (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  Transfer Stock
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <TextField
                    select
                    fullWidth
                    label="Select Technician *"
                    value={selectedTechnician}
                    onChange={(e) => setSelectedTechnician(e.target.value)}
                  >
                    {technicians.map((tech) => (
                      <MenuItem key={tech.id} value={tech.id}>
                        {tech.name} - {tech.email}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    fullWidth
                    label="Quantity to Transfer *"
                    type="number"
                    value={transferQuantity}
                    onChange={(e) => setTransferQuantity(Number(e.target.value))}
                    inputProps={{ min: 1, max: warehouseStock }}
                    helperText={`Available warehouse stock: ${warehouseStock}`}
                  />

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      onClick={handleTransfer}
                      disabled={
                        !selectedTechnician ||
                        transferQuantity <= 0 ||
                        transferQuantity > warehouseStock ||
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
