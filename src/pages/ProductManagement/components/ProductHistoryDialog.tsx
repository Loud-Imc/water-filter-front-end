import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
} from '@mui/material';
import { invoiceService } from '../../../api/services/invoiceService';
import type { Invoice } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

interface ProductHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  itemId: string | null;
  itemName: string;
  itemType: 'PRODUCT' | 'SPARE_PART';
}

export const ProductHistoryDialog: React.FC<ProductHistoryDialogProps> = ({
  open,
  onClose,
  itemId,
  itemName,
  itemType,
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (open && itemId) {
      fetchHistory();
    }
  }, [open, itemId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = itemType === 'PRODUCT' ? { productId: itemId || undefined } : { sparePartId: itemId || undefined };
      const data = await invoiceService.getAll(params);
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Filter invoices based on type
  const purchases = invoices.filter(
    (inv) => inv.type === 'PURCHASE' || inv.type === 'SUPPLIER_RETURN'
  );
  const sales = invoices.filter(
    (inv) => inv.type === 'SALES' || inv.type === 'SALES_RETURN'
  );

  const renderTable = (data: Invoice[], isPurchase: boolean) => {
    if (data.length === 0) {
      return (
        <Box p={3} textAlign="center">
          <Typography color="text.secondary">No records found.</Typography>
        </Box>
      );
    }

    return (
      <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: 'background.default' }}>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Invoice #</TableCell>
              <TableCell>{isPurchase ? 'Supplier' : 'Customer'}</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell align="right">{isPurchase ? 'Cost Price' : 'Selling Price'}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((invoice) => {
              // Find the specific item in the invoice to get its exact qty and price
              const lineItem = invoice.items?.find(
                (i) => (itemType === 'PRODUCT' ? i.productId === itemId : i.sparePartId === itemId)
              );

              if (!lineItem) return null;

              const isReturn = invoice.type.includes('RETURN');

              return (
                <TableRow key={invoice.id}>
                  <TableCell>
                    {new Date(invoice.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell><Typography fontWeight={500}>{invoice.invoiceNumber}</Typography></TableCell>
                  <TableCell>
                    {isPurchase
                      ? invoice.supplier?.name || 'Internal'
                      : invoice.customer?.name || '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={isReturn ? 'Return' : isPurchase ? 'Purchase' : 'Sale'}
                      color={isReturn ? 'warning' : isPurchase ? 'info' : 'success'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      color={isReturn ? (isPurchase ? 'error' : 'success.main') : (isPurchase ? 'success.main' : 'error')}
                      fontWeight={600}
                    >
                      {isReturn ? '-' : '+'}{lineItem.quantity}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">₹{Number(lineItem.unitPrice).toFixed(2)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Ledger: {itemName}
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label={`Purchases (${purchases.length})`} />
                <Tab label={`Sales (${sales.length})`} />
              </Tabs>
            </Box>
            
            <Box sx={{ pt: 2 }}>
              {tabValue === 0 && renderTable(purchases, true)}
              {tabValue === 1 && renderTable(sales, false)}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
