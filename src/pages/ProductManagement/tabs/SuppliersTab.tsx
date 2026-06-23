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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import BusinessIcon from '@mui/icons-material/Business';
import { supplierService } from '../../../api/services/supplierService';
import type { Supplier } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import SnackbarNotification from '../../../components/common/SnackbarNotification';
import { PermissionGate } from '../../../components/PermissionGate';
import { PERMISSIONS } from '../../../constants/permissions';

const SuppliersTab: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    gstin: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as any,
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await supplierService.getAll();
      setSuppliers(data);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load suppliers',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (supplier?: Supplier) => {
    if (supplier) {
      setSelectedSupplier(supplier);
      setFormData({
        name: supplier.name,
        contactName: supplier.contactName || '',
        phone: supplier.phone,
        email: supplier.email || '',
        address: supplier.address || '',
        gstin: supplier.gstin || '',
      });
    } else {
      setSelectedSupplier(null);
      setFormData({
        name: '',
        contactName: '',
        phone: '',
        email: '',
        address: '',
        gstin: '',
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Supplier name is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    
    // Simple email validation
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (selectedSupplier) {
        await supplierService.update(selectedSupplier.id, formData);
        setSnackbar({
          open: true,
          message: 'Supplier updated successfully!',
          severity: 'success',
        });
      } else {
        await supplierService.create(formData);
        setSnackbar({
          open: true,
          message: 'Supplier added successfully!',
          severity: 'success',
        });
      }
      fetchSuppliers();
      setOpenDialog(false);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to save supplier';
      setSnackbar({
        open: true,
        message: msg,
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSupplier) return;

    try {
      await supplierService.delete(selectedSupplier.id);
      setSnackbar({
        open: true,
        message: 'Supplier deleted successfully!',
        severity: 'success',
      });
      fetchSuppliers();
      setDeleteDialog(false);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to delete supplier';
      setSnackbar({
        open: true,
        message: msg,
        severity: 'error',
      });
      setDeleteDialog(false);
    }
  };

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone.includes(searchTerm) ||
      (supplier.contactName &&
        supplier.contactName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          Suppliers ({filteredSuppliers.length})
        </Typography>
        <PermissionGate permission={PERMISSIONS.PRODUCTS_CREATE}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Supplier
          </Button>
        </PermissionGate>
      </Box>

      {/* Filter Bar */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              placeholder="Search by supplier name, contact person, or phone..."
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
        </Grid>
      </Card>

      {/* Supplier List */}
      {filteredSuppliers.length === 0 ? (
        <EmptyState
          title="No suppliers found"
          description={
            searchTerm
              ? 'Try adjusting your search criteria'
              : 'Add your first supplier to get started'
          }
          actionLabel="Add Supplier"
          onAction={() => handleOpenDialog()}
        />
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Supplier Name</TableCell>
                  <TableCell>Contact Person</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>GSTIN</TableCell>
                  <TableCell align="center">Inventory Link</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <BusinessIcon color="action" />
                        <Typography variant="body1" fontWeight={500}>
                          {supplier.name}
                        </Typography>
                      </Box>
                      {supplier.address && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', ml: 4 }}
                        >
                          {supplier.address}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{supplier.contactName || '-'}</TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell>{supplier.email || '-'}</TableCell>
                    <TableCell>
                      {supplier.gstin ? (
                        <Chip label={supplier.gstin} size="small" variant="outlined" />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={1}>
                        {supplier._count && supplier._count.products > 0 && (
                          <Chip
                            label={`${supplier._count.products} Products`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                        {supplier._count && supplier._count.spareParts > 0 && (
                          <Chip
                            label={`${supplier._count.spareParts} Spares`}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        )}
                        {(!supplier._count ||
                          (supplier._count.products === 0 &&
                            supplier._count.spareParts === 0)) && (
                          <Typography variant="caption" color="text.disabled">
                            No active links
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <PermissionGate permission={PERMISSIONS.PRODUCTS_UPDATE}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(supplier)}
                        >
                          <EditIcon />
                        </IconButton>
                      </PermissionGate>
                      <PermissionGate permission={PERMISSIONS.PRODUCTS_DELETE}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setSelectedSupplier(supplier);
                            setDeleteDialog(true);
                          }}
                          sx={{ ml: 1 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </PermissionGate>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Supplier Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedSupplier ? 'Edit Supplier' : 'Add New Supplier'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Supplier / Vendor Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={!!formErrors.name}
              helperText={formErrors.name}
            />

            <TextField
              fullWidth
              label="Contact Person Name"
              value={formData.contactName}
              onChange={(e) =>
                setFormData({ ...formData, contactName: e.target.value })
              }
            />

            <TextField
              fullWidth
              label="Phone Number *"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={!!formErrors.phone}
              helperText={formErrors.phone}
            />

            <TextField
              fullWidth
              label="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={!!formErrors.email}
              helperText={formErrors.email}
            />

            <TextField
              fullWidth
              label="GSTIN (Tax Registration)"
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
              placeholder="e.g. 29GGGGG1314R9Z6"
            />

            <TextField
              fullWidth
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving || !formData.name || !formData.phone}
          >
            {saving ? 'Saving...' : selectedSupplier ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog}
        title="Delete Supplier"
        message={`Are you sure you want to delete the supplier "${selectedSupplier?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        severity="error"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteDialog(false);
          setSelectedSupplier(null);
        }}
      />

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

export default SuppliersTab;
