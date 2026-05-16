import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Stack,
  InputAdornment
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { technicianStockService } from '../../api/services/technicianStockService';

const TechnicianStockTransactionsTable: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await technicianStockService.getAllStockTransactions();
        setTransactions(data);
      } catch (err) {
        setError('Failed to load technician stock history');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.technician?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.product?.name || tx.sparePart?.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ mt: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search technician, item or notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          label="Transaction Type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="ALL">All Types</MenuItem>
          <MenuItem value="ISSUE">Stock Issued (Given)</MenuItem>
          <MenuItem value="RETURN">Stock Returned</MenuItem>
          <MenuItem value="CONSUMPTION">Used in Service</MenuItem>
        </TextField>
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead sx={{ bgcolor: 'grey.100' }}>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Technician</TableCell>
              <TableCell>Item</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  No transactions match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((tx) => (
                <TableRow key={tx.id} hover>
                  <TableCell>{formatDate(tx.createdAt)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{tx.technician?.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{tx.technician?.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {tx.product?.name || tx.sparePart?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {tx.product ? 'Product' : 'Spare Part'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={tx.type} 
                      size="small"
                      color={
                        tx.type === 'ISSUE' ? 'success' :
                        tx.type === 'RETURN' ? 'warning' : 'error'
                      }
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography 
                      variant="body2" 
                      fontWeight={700}
                      color={tx.quantity > 0 ? 'success.main' : 'error.main'}
                    >
                      {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                    </Typography>
                  </TableCell>
                  <TableCell>{tx.notes}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TechnicianStockTransactionsTable;
