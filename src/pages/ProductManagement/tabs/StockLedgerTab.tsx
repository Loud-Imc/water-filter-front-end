import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  MenuItem,
  IconButton,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import HistoryIcon from '@mui/icons-material/History';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { invoiceService } from '../../../api/services/invoiceService';
import { productService } from '../../../api/services/productService';
import { sparePartsService } from '../../../api/services/sparePartsService';
import type { StockLedgerEntry, Product, SparePart } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import SnackbarNotification from '../../../components/common/SnackbarNotification';

interface UIStockLedgerEntry extends StockLedgerEntry {
  runningBalance?: number;
}

const StockLedgerTab: React.FC = () => {
  const [ledger, setLedger] = useState<UIStockLedgerEntry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [search, setSearch] = useState('');
  const [itemType, setItemType] = useState<'PRODUCT' | 'SPARE_PART' | ''>('');
  const [itemId, setItemId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as any,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchLedger();
  }, [itemType, itemId, startDate, endDate]);

  const fetchInitialData = async () => {
    try {
      const [productsData, sparesData] = await Promise.all([
        productService.getAllProducts(),
        sparePartsService.getAll(),
      ]);
      setProducts(productsData);
      setSpareParts(sparesData);
    } catch (error) {
      console.error('Failed to fetch filter items:', error);
    }
  };

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (itemType) params.itemType = itemType;
      if (itemId) params.itemId = itemId;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (search) params.search = search;

      const data = await invoiceService.getStockLedger(params);

      // If we have selected a specific item, compute the running closing balance
      let processedData: UIStockLedgerEntry[] = [...data];
      if (itemId && itemType) {
        let currentStock = 0;
        if (itemType === 'PRODUCT') {
          currentStock = products.find((p) => p.id === itemId)?.stock || 0;
        } else {
          currentStock = spareParts.find((s) => s.id === itemId)?.stock || 0;
        }

        let tempBal = currentStock;
        // The array returned from backend is sorted descending (newest first).
        // To compute running balance after each change, we go backwards:
        // Balance after entry i = tempBal.
        // Balance before entry i = tempBal - quantityChange.
        for (let i = 0; i < processedData.length; i++) {
          processedData[i].runningBalance = tempBal;
          tempBal -= processedData[i].quantityChange;
        }
      }

      setLedger(processedData);
    } catch (error) {
      console.error('Failed to load stock ledger:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load stock ledger logs',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchLedger();
    }
  };

  const handleItemTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setItemType(e.target.value as any);
    setItemId(''); // Reset item select
  };

  const filteredItemsForSelect = () => {
    if (itemType === 'PRODUCT') {
      return products;
    }
    if (itemType === 'SPARE_PART') {
      return spareParts;
    }
    return [];
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={600} display="flex" alignItems="center" gap={1}>
          <HistoryIcon /> Warehouse Stock Ledger
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Track stock movements (inwards, outward dispatches, assembly operations, etc.) chronologically.
        </Typography>
      </Box>

      {/* Filters Card */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              placeholder="Search item, sku or reason... [Enter]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: search && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSearch('');
                        setTimeout(() => fetchLedger(), 0);
                      }}
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              fullWidth
              label="Item Type"
              value={itemType}
              onChange={handleItemTypeChange}
            >
              <MenuItem value="">All Stock</MenuItem>
              <MenuItem value="PRODUCT">Products Only</MenuItem>
              <MenuItem value="SPARE_PART">Spares Only</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              label="Select Specific Item"
              value={itemId}
              disabled={!itemType}
              onChange={(e) => setItemId(e.target.value)}
              helperText={!itemType ? 'Select item type first' : ''}
            >
              <MenuItem value="">Choose Item</MenuItem>
              {filteredItemsForSelect().map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name} {item.sku ? `(SKU: ${item.sku})` : ''}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              type="date"
              label="End Date"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Grid>
        </Grid>
      </Card>

      {/* Stock Ledger Ledger View */}
      {loading ? (
        <LoadingSpinner />
      ) : ledger.length === 0 ? (
        <EmptyState
          title="No stock logs found"
          description="Try clearing search queries or adjusting date range filters."
        />
      ) : (
        <Card>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'background.default' }}>
                  <TableCell sx={{ py: 1.5 }}>Date & Time</TableCell>
                  <TableCell>Item Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell align="center">Adjustment</TableCell>
                  {itemId && itemType && <TableCell align="center">Closing Balance</TableCell>}
                  <TableCell>Activity Description / Ref</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ledger.map((entry) => {
                  const isPositive = entry.quantityChange > 0;
                  return (
                    <TableRow key={entry.id} hover>
                      <TableCell sx={{ py: 1.5 }}>
                        {new Date(entry.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {entry.itemName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={entry.itemType}
                          size="small"
                          variant="outlined"
                          color={entry.itemType === 'PRODUCT' ? 'primary' : 'secondary'}
                        />
                      </TableCell>
                      <TableCell>{entry.sku || '-'}</TableCell>
                      <TableCell align="center">
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          gap={0.5}
                          sx={{
                            color: isPositive ? 'success.main' : 'error.main',
                            fontWeight: 700,
                          }}
                        >
                          {isPositive ? (
                            <ArrowUpwardIcon fontSize="inherit" />
                          ) : (
                            <ArrowDownwardIcon fontSize="inherit" />
                          )}
                          {isPositive ? '+' : ''}
                          {entry.quantityChange}
                        </Box>
                      </TableCell>
                      {itemId && itemType && (
                        <TableCell align="center">
                          <Typography fontWeight={700} color="text.primary">
                            {entry.runningBalance}
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell>{entry.reason}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Notification Snackbar */}
      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
};

export default StockLedgerTab;
