import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  LinearProgress,
  Alert,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { productService } from '../../api/services/productService';
import { sparePartsService } from '../../api/services/sparePartsService';

interface LowStockItem {
  id: string;
  name: string;
  sku: string | null;
  type: 'PRODUCT' | 'SPARE_PART';
  stock: number;
  reorderLevel: number;
}

const LowStockItemsCard: React.FC = () => {
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLowStock = async () => {
      setLoading(true);
      try {
        const [lowProducts, lowSpares] = await Promise.all([
          productService.getLowStockProducts(),
          sparePartsService.getLowStockSpareParts(),
        ]);

        const mappedProducts: LowStockItem[] = lowProducts.map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku || 'N/A',
          type: 'PRODUCT',
          stock: p.stock,
          reorderLevel: p.reorderLevel || 5,
        }));

        const mappedSpares: LowStockItem[] = lowSpares.map((s) => ({
          id: s.id,
          name: s.name,
          sku: s.sku || 'N/A',
          type: 'SPARE_PART',
          stock: s.stock,
          reorderLevel: s.reorderLevel || 10,
        }));

        setLowStockItems([...mappedProducts, ...mappedSpares]);
      } catch (error) {
        console.error('Failed to load low stock items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLowStock();
  }, []);

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Low Stock Alert Details
          </Typography>
          <LinearProgress sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  const isAlertNeeded = lowStockItems.length > 0;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
          {isAlertNeeded ? (
            <WarningAmberIcon color="warning" />
          ) : (
            <CheckCircleOutlineIcon color="success" />
          )}
          <Typography variant="h6" fontWeight={600}>
            Stock Safety Level Details
          </Typography>
        </Box>

        {!isAlertNeeded ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            sx={{ py: 6, flexGrow: 1 }}
          >
            <Alert severity="success" sx={{ width: '100%' }}>
              All inventory levels are currently above their safety thresholds.
            </Alert>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 300, flexGrow: 1 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Item Name</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell align="center">Type</TableCell>
                  <TableCell align="right">Current Stock</TableCell>
                  <TableCell align="right">Safety Limit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lowStockItems.map((item) => (
                  <TableRow key={`${item.type}-${item.id}`} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{item.name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={item.type === 'PRODUCT' ? 'Product' : 'Spare Part'}
                        size="small"
                        color={item.type === 'PRODUCT' ? 'primary' : 'secondary'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: 'error.main' }}>
                      {item.stock}
                    </TableCell>
                    <TableCell align="right">{item.reorderLevel}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default LowStockItemsCard;
