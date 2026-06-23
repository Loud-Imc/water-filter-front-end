import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Divider,
  Autocomplete,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LinkIcon from '@mui/icons-material/Link';
import { invoiceService } from '../../../api/services/invoiceService';
import { productService } from '../../../api/services/productService';
import { sparePartsService } from '../../../api/services/sparePartsService';
import { SearchableSelect } from '../../../components/common/SearchableSelect';
import type { Invoice, Product, SparePart, CreateInvoiceDto } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import SnackbarNotification from '../../../components/common/SnackbarNotification';
import { PermissionGate } from '../../../components/PermissionGate';
import { PERMISSIONS } from '../../../constants/permissions';

const SalesInvoicesTab: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Dialog controls
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [saving, setSaving] = useState(false);

  // New Invoice Form State
  const [formData, setFormData] = useState<CreateInvoiceDto>({
    invoiceNumber: '',
    type: 'SALES',
    date: new Date().toISOString().split('T')[0],
    customerId: '',
    subTotal: 0,
    discount: 0,
    taxAmount: 0,
    totalAmount: 0,
    amountPaid: 0,
    paymentStatus: 'UNPAID',
    paymentMode: 'CASH',
    notes: '',
    items: [],
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as any,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [invoicesData, productsData, sparesData] = await Promise.all([
        invoiceService.getAll(),
        productService.getAllProducts(),
        sparePartsService.getAll(),
      ]);
      const filteredInvoices = invoicesData.filter(
        (inv) => inv.type === 'SALES' || inv.type === 'SALES_RETURN'
      );
      setInvoices(filteredInvoices);
      setProducts(productsData);
      setSpareParts(sparesData);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load sales invoices data',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const allInvoices = await invoiceService.getAll();
      const filteredInvoices = allInvoices.filter(
        (inv) => inv.type === 'SALES' || inv.type === 'SALES_RETURN'
      );
      setInvoices(filteredInvoices);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    }
  };

  const handleOpenAddDialog = () => {
    setFormData({
      invoiceNumber: '',
      type: 'SALES',
      date: new Date().toISOString().split('T')[0],
      customerId: '',
      subTotal: 0,
      discount: 0,
      taxAmount: 0,
      totalAmount: 0,
      amountPaid: 0,
      paymentStatus: 'UNPAID',
      paymentMode: 'CASH',
      notes: '',
      items: [
        {
          productId: null,
          sparePartId: null,
          quantity: 1,
          unitPrice: 0,
          taxRate: 18,
        },
      ],
    });
    setFormErrors({});
    setOpenAddDialog(true);
  };

  const handleItemTypeChange = (index: number, type: 'PRODUCT' | 'SPARE_PART') => {
    const updatedItems = [...formData.items];
    if (type === 'PRODUCT') {
      updatedItems[index].productId = '';
      updatedItems[index].sparePartId = null;
    } else {
      updatedItems[index].sparePartId = '';
      updatedItems[index].productId = null;
    }
    // reset fields
    updatedItems[index].unitPrice = 0;
    updatedItems[index].taxRate = 18;
    updatedItems[index].quantity = 1;

    setFormData({ ...formData, items: updatedItems });
    recalculateTotals(updatedItems, formData.discount || 0);
  };

  const handleItemSelect = (index: number, id: string) => {
    const updatedItems = [...formData.items];
    if (updatedItems[index].productId !== null) {
      updatedItems[index].productId = id;
      const prod = products.find((p) => p.id === id);
      if (prod) {
        updatedItems[index].unitPrice = prod.price || 0; // Selling price
        updatedItems[index].taxRate = prod.taxRate || 18;
      }
    } else {
      updatedItems[index].sparePartId = id;
      const spare = spareParts.find((s) => s.id === id);
      if (spare) {
        updatedItems[index].unitPrice = spare.price || 0; // Selling price
        updatedItems[index].taxRate = spare.taxRate || 18;
      }
    }
    setFormData({ ...formData, items: updatedItems });
    recalculateTotals(updatedItems, formData.discount || 0);
  };

  const handleItemValueChange = (
    index: number,
    field: 'quantity' | 'unitPrice' | 'taxRate',
    value: number
  ) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    setFormData({ ...formData, items: updatedItems });
    recalculateTotals(updatedItems, formData.discount || 0);
  };

  const handleAddRow = () => {
    const updatedItems = [
      ...formData.items,
      {
        productId: null,
        sparePartId: null,
        quantity: 1,
        unitPrice: 0,
        taxRate: 18,
      },
    ];
    setFormData({ ...formData, items: updatedItems });
  };

  const handleRemoveRow = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
    recalculateTotals(updatedItems, formData.discount || 0);
  };

  const recalculateTotals = (items: any[], discountVal: number) => {
    let sub = 0;
    let tax = 0;
    items.forEach((item) => {
      const itemSub = item.unitPrice * item.quantity;
      const itemTax = itemSub * ((item.taxRate || 18) / 100);
      sub += itemSub;
      tax += itemTax;
    });

    const total = sub - discountVal + tax;

    setFormData((prev) => ({
      ...prev,
      subTotal: sub,
      taxAmount: tax,
      totalAmount: total,
    }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.customerId) errors.customerId = 'Customer is required';
    if (!formData.date) errors.date = 'Invoice date is required';
    
    if (formData.items.length === 0) {
      errors.items = 'At least one line item is required';
    } else {
      formData.items.forEach((item, idx) => {
        if (!item.productId && !item.sparePartId) {
          errors[`item_${idx}`] = 'Please select a product or spare part';
        }
        if (item.quantity <= 0) {
          errors[`quantity_${idx}`] = 'Qty must be > 0';
        }
        if (item.unitPrice < 0) {
          errors[`price_${idx}`] = 'Price must be >= 0';
        }
      });
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveInvoice = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const cleanedItems = formData.items.map((item) => ({
        productId: item.productId || null,
        sparePartId: item.sparePartId || null,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        taxRate: Number(item.taxRate || 18),
      }));

      await invoiceService.create({
        ...formData,
        items: cleanedItems,
      });

      setSnackbar({
        open: true,
        message: 'Sales invoice created successfully, stock updated!',
        severity: 'success',
      });
      fetchInvoices();
      
      // Reload parts/products to reflect new stock values
      const [productsData, sparesData] = await Promise.all([
        productService.getAllProducts(),
        sparePartsService.getAll(),
      ]);
      setProducts(productsData);
      setSpareParts(sparesData);
      setOpenAddDialog(false);
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to save sales invoice';
      setSnackbar({
        open: true,
        message: msg,
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleViewDetails = async (invoiceId: string) => {
    try {
      const data = await invoiceService.getById(invoiceId);
      setSelectedInvoice(data);
      setOpenDetailDialog(true);
    } catch (error) {
      console.error('Failed to fetch invoice details:', error);
    }
  };

  const handlePrint = () => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #printable-area, #printable-area * {
          visibility: visible;
        }
        #printable-area {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          padding: 20px;
        }
        .no-print {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    window.print();
    document.head.removeChild(style);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.customer &&
        inv.customer.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter ? inv.paymentStatus === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'PARTIALLY_PAID':
        return 'warning';
      default:
        return 'error';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          Sales Invoices ({filteredInvoices.length})
        </Typography>
        <PermissionGate permission={PERMISSIONS.STOCK_UPDATE}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            Create Sales Invoice
          </Button>
        </PermissionGate>
      </Box>

      {/* Filter Card */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField
              fullWidth
              placeholder="Search by invoice number or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              select
              fullWidth
              label="Filter by Payment Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="PAID">Paid</MenuItem>
              <MenuItem value="PARTIALLY_PAID">Partially Paid</MenuItem>
              <MenuItem value="UNPAID">Unpaid</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Card>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <EmptyState
          title="No sales invoices found"
          description={
            searchTerm || statusFilter
              ? 'Try adjusting your filters'
              : 'Create your first sales invoice to bill a customer'
          }
          actionLabel="Create Sales Invoice"
          onAction={handleOpenAddDialog}
        />
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Invoice Number</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell align="center">Type</TableCell>
                  <TableCell align="center">Source</TableCell>
                  <TableCell align="center">Items Count</TableCell>
                  <TableCell align="right">Sub Total</TableCell>
                  <TableCell align="right">Tax (GST)</TableCell>
                  <TableCell align="right">Total Amount</TableCell>
                  <TableCell align="center">Payment Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInvoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>{new Date(inv.date).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <ReceiptIcon color="action" fontSize="small" />
                        <Typography variant="body2" fontWeight={600}>
                          {inv.invoiceNumber}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{inv.customer?.name || 'Walk-in Customer'}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={inv.type === 'SALES_RETURN' ? 'Return' : 'Sales'}
                        size="small"
                        color={inv.type === 'SALES_RETURN' ? 'warning' : 'primary'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {inv.serviceRequestId ? (
                        <Chip
                          icon={<LinkIcon fontSize="small" />}
                          label="Service Request"
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      ) : (
                        <Chip label="Direct Sale" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell align="center">{inv._count?.items || 0}</TableCell>
                    <TableCell align="right">₹{inv.subTotal.toFixed(2)}</TableCell>
                    <TableCell align="right">₹{inv.taxAmount.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600}>₹{inv.totalAmount.toFixed(2)}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={inv.paymentStatus}
                        color={getStatusColor(inv.paymentStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleViewDetails(inv.id)}>
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Create Sales Invoice Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>Create Sales Invoice</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <SearchableSelect
                label="Customer *"
                value={formData.customerId || ''}
                onChange={(value) => setFormData({ ...formData, customerId: value || '' })}
                endpoint="/customers/search"
                placeholder="Type customer name or phone..."
                error={!!formErrors.customerId}
                helperText={formErrors.customerId}
                renderOption={(option: any) => (
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      {option.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.primaryPhone} {option.region ? `• ${option.region.name}` : ''}
                    </Typography>
                  </Box>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                label="Invoice Type *"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              >
                <MenuItem value="SALES">Sales Invoice (Stock Outward)</MenuItem>
                <MenuItem value="SALES_RETURN">Sales Return (Stock Return)</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Invoice Number"
                value={formData.invoiceNumber}
                placeholder="e.g. INV-2026-0001 (Auto-generated if empty)"
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type="date"
                label="Invoice Date *"
                InputLabelProps={{ shrink: true }}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                error={!!formErrors.date}
                helperText={formErrors.date}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                label="Payment Mode"
                value={formData.paymentMode}
                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value as any })}
              >
                <MenuItem value="CASH">Cash</MenuItem>
                <MenuItem value="UPI">UPI</MenuItem>
                <MenuItem value="CARD">Card</MenuItem>
                <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                <MenuItem value="CREDIT">Credit / Due</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                label="Payment Status"
                value={formData.paymentStatus}
                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as any })}
              >
                <MenuItem value="UNPAID">Unpaid</MenuItem>
                <MenuItem value="PARTIALLY_PAID">Partially Paid</MenuItem>
                <MenuItem value="PAID">Paid</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" fontWeight={500} sx={{ mb: 2 }}>
            Invoice Line Items
          </Typography>

          {/* Dynamic Item Rows */}
          <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: 'background.default' }}>
                <TableRow>
                  <TableCell width="15%">Item Type</TableCell>
                  <TableCell width="35%">Select Item *</TableCell>
                  <TableCell width="10%">Qty *</TableCell>
                  <TableCell width="15%">Price *</TableCell>
                  <TableCell width="10%">GST %</TableCell>
                  <TableCell width="10%">Total</TableCell>
                  <TableCell width="5%" align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.items.map((item, idx) => {
                  const isProduct = item.productId !== null;
                  return (
                    <TableRow key={idx} sx={{ '& td': { borderBottom: 'none', pt: 1.5, pb: 1.5 } }}>
                      <TableCell sx={{ verticalAlign: 'top' }}>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          value={isProduct ? 'PRODUCT' : 'SPARE_PART'}
                          onChange={(e) => handleItemTypeChange(idx, e.target.value as any)}
                        >
                          <MenuItem value="PRODUCT">Product</MenuItem>
                          <MenuItem value="SPARE_PART">Spare Part</MenuItem>
                        </TextField>
                      </TableCell>

                      <TableCell sx={{ verticalAlign: 'top' }}>
                        <Autocomplete
                          options={isProduct ? products : spareParts}
                          getOptionLabel={(option) => `${option.name} ${option.sku ? `(SKU: ${option.sku})` : ''} - ₹${option.price}`}
                          value={(isProduct ? products.find(p => p.id === item.productId) : spareParts.find(s => s.id === item.sparePartId)) || null}
                          onChange={(_event, newValue) => handleItemSelect(idx, newValue ? newValue.id : '')}
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              placeholder="Search item..."
                              error={!!formErrors[`item_${idx}`]}
                              helperText={formErrors[`item_${idx}`]}
                            />
                          )}
                        />
                      </TableCell>

                      <TableCell sx={{ verticalAlign: 'top' }}>
                        <TextField
                          type="number"
                          fullWidth
                          size="small"
                          value={item.quantity}
                          inputProps={{ min: 1 }}
                          onChange={(e) => handleItemValueChange(idx, 'quantity', Number(e.target.value))}
                          error={!!formErrors[`quantity_${idx}`]}
                        />
                      </TableCell>

                      <TableCell sx={{ verticalAlign: 'top' }}>
                        <TextField
                          type="number"
                          fullWidth
                          size="small"
                          value={item.unitPrice}
                          InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                          onChange={(e) => handleItemValueChange(idx, 'unitPrice', Number(e.target.value))}
                          error={!!formErrors[`price_${idx}`]}
                        />
                      </TableCell>

                      <TableCell sx={{ verticalAlign: 'top' }}>
                        <TextField
                          type="number"
                          fullWidth
                          size="small"
                          value={item.taxRate || 0}
                          InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                          onChange={(e) => handleItemValueChange(idx, 'taxRate', Number(e.target.value))}
                        />
                      </TableCell>

                      <TableCell sx={{ verticalAlign: 'top' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', pt: 0.5 }}>
                          <Typography variant="body1" fontWeight={600}>
                            ₹
                            {(
                              item.unitPrice *
                              item.quantity *
                              (1 + (item.taxRate || 18) / 100)
                            ).toFixed(2)}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell align="center" sx={{ verticalAlign: 'top' }}>
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveRow(idx)}
                          disabled={formData.items.length === 1}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Button startIcon={<AddIcon />} variant="outlined" onClick={handleAddRow}>
            Add Line Item
          </Button>

          <Divider sx={{ my: 3 }} />

          {/* Calculations Summary Section */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Box sx={{ width: 300 }}>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography color="text.secondary">Sub Total:</Typography>
                <Typography fontWeight={500}>₹{formData.subTotal.toFixed(2)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography color="text.secondary">Tax Amount (GST):</Typography>
                <Typography fontWeight={500}>₹{(formData.taxAmount || 0).toFixed(2)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography color="text.secondary">Discount (₹):</Typography>
                <TextField
                  type="number"
                  size="small"
                  sx={{ width: 120 }}
                  value={formData.discount}
                  onChange={(e) => {
                    const discountVal = Number(e.target.value);
                    setFormData({ ...formData, discount: discountVal });
                    recalculateTotals(formData.items, discountVal);
                  }}
                  inputProps={{ min: 0 }}
                />
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Net Payable:
                </Typography>
                <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                  ₹{formData.totalAmount.toFixed(2)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography color="text.secondary">Amount Paid (₹):</Typography>
                <TextField
                  type="number"
                  size="small"
                  sx={{ width: 120 }}
                  value={formData.amountPaid}
                  onChange={(e) => setFormData({ ...formData, amountPaid: Number(e.target.value) })}
                  inputProps={{ min: 0 }}
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Notes / Comments"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveInvoice}
            variant="contained"
            disabled={saving || !formData.customerId}
          >
            {saving ? 'Creating...' : 'Create Invoice'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invoice View Detail Dialog */}
      <Dialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <Box id="printable-area">
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight={700}>
                {selectedInvoice?.type === 'SALES_RETURN' ? 'Sales Return' : 'Sales Invoice'}: {selectedInvoice?.invoiceNumber}
              </Typography>
              <Box display="flex" alignItems="center" gap={1.5} className="no-print">
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={handlePrint}
                >
                  Print
                </Button>
                <Chip
                  label={selectedInvoice?.paymentStatus}
                  color={getStatusColor(selectedInvoice?.paymentStatus || '')}
                  size="small"
                />
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
          {selectedInvoice && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Customer
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedInvoice.customer?.name || 'Walk-in Customer'}
                  </Typography>
                  {selectedInvoice.customer?.primaryPhone && (
                    <Typography variant="body2" color="text.secondary">
                      {selectedInvoice.customer.primaryPhone}
                    </Typography>
                  )}
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Invoice Date
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {new Date(selectedInvoice.date).toLocaleDateString('en-IN')}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Payment Mode
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedInvoice.paymentMode}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Invoice Source
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedInvoice.serviceRequestId ? 'Service Request Link' : 'Direct Sale'}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                Line Items
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item Description</TableCell>
                      <TableCell align="center">Type</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">GST %</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedInvoice.items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.product?.name || item.sparePart?.name}
                          <Typography variant="caption" color="text.secondary" display="block">
                            SKU: {item.product?.sku || item.sparePart?.sku || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {item.productId ? 'Product' : 'Spare Part'}
                        </TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">₹{item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell align="right">{item.taxRate}%</TableCell>
                        <TableCell align="right">₹{item.totalPrice.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Box sx={{ width: 250 }}>
                  <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Sub Total:</Typography>
                    <Typography variant="body2" fontWeight={500}>₹{selectedInvoice.subTotal.toFixed(2)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Tax Amount:</Typography>
                    <Typography variant="body2" fontWeight={500}>₹{selectedInvoice.taxAmount.toFixed(2)}</Typography>
                  </Box>
                  {selectedInvoice.discount > 0 && (
                    <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Discount:</Typography>
                      <Typography variant="body2" color="error.main" fontWeight={500}>-₹{selectedInvoice.discount.toFixed(2)}</Typography>
                    </Box>
                  )}
                  <Divider sx={{ my: 1 }} />
                  <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography fontWeight={600}>Total Amount:</Typography>
                    <Typography fontWeight={700}>₹{selectedInvoice.totalAmount.toFixed(2)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Amount Paid:</Typography>
                    <Typography variant="body2" fontWeight={500}>₹{selectedInvoice.amountPaid.toFixed(2)}</Typography>
                  </Box>
                </Box>
              </Box>

              {selectedInvoice.notes && (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block">Notes:</Typography>
                  <Typography variant="body2">{selectedInvoice.notes}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        </Box>
        <DialogActions className="no-print">
          <Button onClick={() => setOpenDetailDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
};

export default SalesInvoicesTab;
