import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Card, 
  CardContent, 
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import TechnicianStockTransactionsTable from '../../../components/dashboard/TechnicianStockTransactionsTable';
import { technicianStockService } from '../../../api/services/technicianStockService';

const TechnicianStockTab: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTechnicianStocks();
  }, []);

  const fetchTechnicianStocks = async () => {
    try {
      setLoading(true);
      const data = await technicianStockService.getAllTechnicianStocks();
      setTechnicians(data);
    } catch (err) {
      setError('Failed to load technician stock summary');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const filteredTechnicians = technicians.filter(tech => 
    tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.technicianStock.some((s: any) => 
      (s.product?.name || s.sparePart?.name).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>
          Technician Inventory Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor current balances and transaction history across all technicians
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Current Stock Levels" />
          <Tab label="Transaction History" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Box>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by technician name, email or item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <Grid container spacing={3}>
              {filteredTechnicians.length === 0 ? (
                <Grid size={{ xs: 12 }}>
                  <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                    <Typography color="text.secondary">No technicians found matching your search.</Typography>
                  </Paper>
                </Grid>
              ) : (
                filteredTechnicians.map((tech) => {
                  return (
                    <Grid size={{ xs: 12 }} key={tech.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>{tech.name.charAt(0)}</Avatar>
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600}>{tech.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{tech.email}</Typography>
                            </Box>
                          </Box>
                          
                          <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                              <TableHead sx={{ bgcolor: 'grey.50' }}>
                                <TableRow>
                                  <TableCell>Item Name</TableCell>
                                  <TableCell>Type</TableCell>
                                  <TableCell>SKU</TableCell>
                                  <TableCell align="right">Current Balance</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {tech.technicianStock.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={4} align="center">
                                      <Typography variant="body2" color="text.disabled" sx={{ py: 1 }}>
                                        No stock currently held
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  tech.technicianStock.map((stock: any) => (
                                    <TableRow key={stock.id}>
                                      <TableCell>{stock.product?.name || stock.sparePart?.name}</TableCell>
                                      <TableCell>
                                        <Typography variant="caption">
                                          {stock.product ? 'Product' : 'Spare Part'}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>{stock.product?.sku || stock.sparePart?.sku || 'N/A'}</TableCell>
                                      <TableCell align="right">
                                        <Typography fontWeight={700}>{stock.quantity}</Typography>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })
              )}
            </Grid>
          )}
        </Box>
      )}

      {tabValue === 1 && (
        <TechnicianStockTransactionsTable />
      )}
    </Box>
  );
};

export default TechnicianStockTab;
