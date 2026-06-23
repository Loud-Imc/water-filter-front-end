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
import { invoiceService } from '../../../api/services/invoiceService';
import { supplierService } from '../../../api/services/supplierService';
import { productService } from '../../../api/services/productService';
import { sparePartsService } from '../../../api/services/sparePartsService';
import type { Invoice, Supplier, Product, SparePart, CreateInvoiceDto } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import SnackbarNotification from '../../../components/common/SnackbarNotification';
import { PermissionGate } from '../../../components/PermissionGate';
import { PERMISSIONS } from '../../../constants/permissions';
import { usePermission } from '../../../hooks/usePermission';

const SupplierBillsTab: React.FC = () => {
  const { hasPermission } = usePermission();
  const canEditCostPrice = hasPermission(PERMISSIONS.PRODUCTS_UPDATE);
  const [bills, setBills] = useState<Invoice[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Dialog controls
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Invoice | null>(null);
  const [saving, setSaving] = useState(false);

  // Quick Add Supplier state
  const [openQuickSupplier, setOpenQuickSupplier] = useState(false);
  const [quickSupplierData, setQuickSupplierData] = useState({
    name: '',
    contactName: '',
    phone: '',
    email: '',
    gstin: '',
    address: '',
  });
  const [quickSupplierErrors, setQuickSupplierErrors] = useState<Record<string, string>>({});
  const [creatingQuickSupplier, setCreatingQuickSupplier] = useState(false);

  // New Invoice Form State
  const [formData, setFormData] = useState<CreateInvoiceDto>({
    invoiceNumber: '',
    type: 'PURCHASE',
    date: new Date().toISOString().split('T')[0],
    supplierId: '',
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
      const [allInvoices, suppliersData, productsData, sparesData] = await Promise.all([
        invoiceService.getAll(),
        supplierService.getAll(),
        productService.getAllProducts(),
        sparePartsService.getAll(),
      ]);
      const billsData = allInvoices.filter(
        (inv) => inv.type === 'PURCHASE' || inv.type === 'SUPPLIER_RETURN'
      );
      setBills(billsData);
      setSuppliers(suppliersData);
      setProducts(productsData);
      setSpareParts(sparesData);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load supplier bills data',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBills = async () => {
    try {
      const allInvoices = await invoiceService.getAll();
      const billsData = allInvoices.filter(
        (inv) => inv.type === 'PURCHASE' || inv.type === 'SUPPLIER_RETURN'
      );
      setBills(billsData);
    } catch (error) {
      console.error('Failed to fetch bills:', error);
    }
  };

  const handleOpenAddDialog = () => {
    setFormData({
      invoiceNumber: '',
      type: 'PURCHASE',
      date: new Date().toISOString().split('T')[0],
      supplierId: '',
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
        updatedItems[index].unitPrice = prod.costPrice || 0;
        updatedItems[index].taxRate = prod.taxRate || 18;
      }
    } else {
      updatedItems[index].sparePartId = id;
      const spare = spareParts.find((s) => s.id === id);
      if (spare) {
        updatedItems[index].unitPrice = spare.costPrice || 0;
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
    if (!formData.supplierId) errors.supplierId = 'Supplier is required';
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

  const handleSaveBill = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      // Clean up items (e.g. remove empty IDs)
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
        message: 'Supplier bill recorded successfully, stock updated!',
        severity: 'success',
      });
      fetchBills();
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
      const msg = error.response?.data?.message || 'Failed to save supplier bill';
      setSnackbar({
        open: true,
        message: msg,
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveQuickSupplier = async () => {
    const errors: Record<string, string> = {};
    if (!quickSupplierData.name.trim()) errors.name = 'Supplier name is required';
    if (!quickSupplierData.phone.trim()) errors.phone = 'Phone number is required';
    if (quickSupplierData.email.trim() && !/\S+@\S+\.\S+/.test(quickSupplierData.email)) {
      errors.email = 'Invalid email address';
    }
    if (Object.keys(errors).length > 0) {
      setQuickSupplierErrors(errors);
      return;
    }

    setCreatingQuickSupplier(true);
    try {
      const newSupplier = await supplierService.create(quickSupplierData);
      setSnackbar({
        open: true,
        message: 'Supplier added successfully!',
        severity: 'success',
      });
      setSuppliers((prev) => [...prev, newSupplier]);
      setFormData((prev) => ({ ...prev, supplierId: newSupplier.id }));
      setOpenQuickSupplier(false);
      setQuickSupplierData({ name: '', contactName: '', phone: '', email: '', gstin: '', address: '' });
      setQuickSupplierErrors({});
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to create supplier';
      setSnackbar({
        open: true,
        message: msg,
        severity: 'error',
      });
    } finally {
      setCreatingQuickSupplier(false);
    }
  };

  const handleViewDetails = async (billId: string) => {
    try {
      const data = await invoiceService.getById(billId);
      setSelectedBill(data);
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

  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      bill.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bill.supplier &&
        bill.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSupplier = supplierFilter ? bill.supplierId === supplierFilter : true;
    const matchesStatus = statusFilter ? bill.paymentStatus === statusFilter : true;
    return matchesSearch && matchesSupplier && matchesStatus;
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
          Supplier Inward Bills ({filteredBills.length})
        </Typography>
        <PermissionGate permission={PERMISSIONS.STOCK_UPDATE}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            Record Purchase Bill
          </Button>
        </PermissionGate>
      </Box>

      {/* Filter Card */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by invoice number or supplier..."
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
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              select
              fullWidth
              label="Filter by Supplier"
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
            >
              <MenuItem value="">All Suppliers</MenuItem>
              {suppliers.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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

      {/* Bills List */}
      {filteredBills.length === 0 ? (
        <EmptyState
          title="No purchase bills found"
          description={
            searchTerm || supplierFilter || statusFilter
              ? 'Try adjusting your filters'
              : 'Add your first supplier purchase bill to increase warehouse stock'
          }
          actionLabel="Record Purchase Bill"
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
                  <TableCell>Supplier / Vendor</TableCell>
                  <TableCell align="center">Type</TableCell>
                  <TableCell align="center">Items Count</TableCell>
                  <TableCell align="right">Sub Total</TableCell>
                  <TableCell align="right">Tax (GST)</TableCell>
                  <TableCell align="right">Total Amount</TableCell>
                  <TableCell align="center">Payment Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell>{new Date(bill.date).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <ReceiptIcon color="action" fontSize="small" />
                        <Typography variant="body2" fontWeight={600}>
                          {bill.invoiceNumber}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{bill.supplier?.name || 'Internal'}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={bill.type === 'SUPPLIER_RETURN' ? 'Return' : 'Purchase'}
                        size="small"
                        color={bill.type === 'SUPPLIER_RETURN' ? 'warning' : 'info'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">{bill._count?.items || 0}</TableCell>
                    <TableCell align="right">₹{bill.subTotal.toFixed(2)}</TableCell>
                    <TableCell align="right">₹{bill.taxAmount.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600}>₹{bill.totalAmount.toFixed(2)}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={bill.paymentStatus}
                        color={getStatusColor(bill.paymentStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleViewDetails(bill.id)}>
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

      {/* Record Purchase Bill Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>Record Supplier Purchase Bill</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box display="flex" alignItems="flex-start" gap={1} width="100%">
                <TextField
                  select
                  fullWidth
                  label="Supplier *"
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  error={!!formErrors.supplierId}
                  helperText={formErrors.supplierId}
                  sx={{ flexGrow: 1 }}
                >
                  <MenuItem value="">Select Supplier</MenuItem>
                  {suppliers.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </TextField>
                <IconButton
                  color="primary"
                  onClick={() => setOpenQuickSupplier(true)}
                  sx={{ mt: 1 }}
                  title="Quick Add Supplier"
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                label="Bill Type *"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              >
                <MenuItem value="PURCHASE">Purchase Bill (Stock Inward)</MenuItem>
                <MenuItem value="SUPPLIER_RETURN">Supplier Return (Stock Return)</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Invoice/Bill Number"
                value={formData.invoiceNumber}
                placeholder="e.g. PUR-2026-0034 (Auto-generated if empty)"
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
            Bill Line Items
          </Typography>

          {/* Dynamic Item Rows */}
          <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: 'background.default' }}>
                <TableRow>
                  <TableCell width="12%">Item Type</TableCell>
                  <TableCell width="30%">Select Item *</TableCell>
                  <TableCell width="10%">Qty *</TableCell>
                  <TableCell width="12%">Cost Price *</TableCell>
                  <TableCell width="12%">Selling Price</TableCell>
                  <TableCell width="9%">GST %</TableCell>
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
                          getOptionLabel={(option) => `${option.name} ${option.sku ? `(SKU: ${option.sku})` : ''}`}
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
                          disabled={!canEditCostPrice}
                          InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                          onChange={(e) => handleItemValueChange(idx, 'unitPrice', Number(e.target.value))}
                          error={!!formErrors[`price_${idx}`]}
                          helperText={!canEditCostPrice ? "Admin only" : ""}
                        />
                      </TableCell>

                      <TableCell sx={{ verticalAlign: 'top' }}>
                        <TextField
                          type="number"
                          fullWidth
                          size="small"
                          value={isProduct ? products.find(p => p.id === item.productId)?.price || '' : spareParts.find(s => s.id === item.sparePartId)?.price || ''}
                          disabled
                          InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
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
            onClick={handleSaveBill}
            variant="contained"
            disabled={saving || !formData.supplierId}
          >
            {saving ? 'Recording...' : 'Record Bill'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bill View Detail Dialog */}
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
                {selectedBill?.type === 'SUPPLIER_RETURN' ? 'Supplier Return' : 'Purchase Bill'}: {selectedBill?.invoiceNumber}
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
                  label={selectedBill?.paymentStatus}
                  color={getStatusColor(selectedBill?.paymentStatus || '')}
                  size="small"
                />
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
          {selectedBill && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Supplier / Vendor
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedBill.supplier?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedBill.supplier?.phone} | {selectedBill.supplier?.email}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Invoice Date
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {new Date(selectedBill.date).toLocaleDateString('en-IN')}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Payment Mode
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedBill.paymentMode}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Recorded By
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedBill.createdBy?.name}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Bill Line Items
              </Typography>
              <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'background.default' }}>
                      <TableCell>Item Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>SKU</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">GST %</TableCell>
                      <TableCell align="right">Tax Amount</TableCell>
                      <TableCell align="right">Total Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedBill.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.product?.name || item.sparePart?.name}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.productId ? 'Product' : 'Spare Part'}
                            size="small"
                            variant="outlined"
                            color={item.productId ? 'primary' : 'secondary'}
                          />
                        </TableCell>
                        <TableCell>
                          {item.product?.sku || item.sparePart?.sku || '-'}
                        </TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">₹{item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell align="right">{item.taxRate}%</TableCell>
                        <TableCell align="right">₹{item.taxAmount.toFixed(2)}</TableCell>
                        <TableCell align="right">₹{item.totalPrice.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ maxWidth: '50%' }}>
                  {selectedBill.notes && (
                    <>
                      <Typography variant="caption" color="text.secondary">
                        Notes:
                      </Typography>
                      <Typography variant="body2">{selectedBill.notes}</Typography>
                    </>
                  )}
                </Box>
                <Box sx={{ width: 250 }}>
                  <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography color="text.secondary">Sub Total:</Typography>
                    <Typography>₹{selectedBill.subTotal.toFixed(2)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography color="text.secondary">Tax Amount:</Typography>
                    <Typography>₹{selectedBill.taxAmount.toFixed(2)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography color="text.secondary">Discount:</Typography>
                    <Typography>- ₹{selectedBill.discount.toFixed(2)}</Typography>
                  </Box>
                  <Divider sx={{ my: 0.5 }} />
                  <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body1" fontWeight={700}>
                      Total Amount:
                    </Typography>
                    <Typography variant="body1" fontWeight={700} color="primary">
                      ₹{selectedBill.totalAmount.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography color="text.secondary">Amount Paid:</Typography>
                    <Typography>₹{selectedBill.amountPaid.toFixed(2)}</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        </Box>
        <DialogActions className="no-print">
          <Button onClick={() => setOpenDetailDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Quick Add Supplier Dialog */}
      <Dialog
        open={openQuickSupplier}
        onClose={() => setOpenQuickSupplier(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Quick Add Supplier</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Supplier Name *"
              value={quickSupplierData.name}
              onChange={(e) => setQuickSupplierData({ ...quickSupplierData, name: e.target.value })}
              error={!!quickSupplierErrors.name}
              helperText={quickSupplierErrors.name}
            />
            <TextField
              fullWidth
              size="small"
              label="Contact Person Name"
              value={quickSupplierData.contactName}
              onChange={(e) => setQuickSupplierData({ ...quickSupplierData, contactName: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label="Phone Number *"
              value={quickSupplierData.phone}
              onChange={(e) => setQuickSupplierData({ ...quickSupplierData, phone: e.target.value })}
              error={!!quickSupplierErrors.phone}
              helperText={quickSupplierErrors.phone}
            />
            <TextField
              fullWidth
              size="small"
              label="Email Address"
              value={quickSupplierData.email}
              onChange={(e) => setQuickSupplierData({ ...quickSupplierData, email: e.target.value })}
              error={!!quickSupplierErrors.email}
              helperText={quickSupplierErrors.email}
            />
            <TextField
              fullWidth
              size="small"
              label="GSTIN"
              value={quickSupplierData.gstin}
              placeholder="e.g. 29GGGGG1314R9Z6"
              onChange={(e) => setQuickSupplierData({ ...quickSupplierData, gstin: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label="Address"
              value={quickSupplierData.address}
              multiline
              rows={2}
              onChange={(e) => setQuickSupplierData({ ...quickSupplierData, address: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQuickSupplier(false)} disabled={creatingQuickSupplier}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveQuickSupplier}
            variant="contained"
            disabled={creatingQuickSupplier || !quickSupplierData.name || !quickSupplierData.phone}
          >
            {creatingQuickSupplier ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snack Notification */}
      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
};

export default SupplierBillsTab;
