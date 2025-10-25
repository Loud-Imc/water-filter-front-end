import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Avatar,
} from "@mui/material";
import { Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";
import PageHeader from "../../components/common/PageHeader";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import SnackbarNotification from "../../components/common/SnackbarNotification";
import EmptyState from "../../components/common/EmptyState";
import PhoneNumberInput from "../../components/customer/PhoneNumberInput";
import { customerService } from "../../api/services/customerService";
import { regionService } from "../../api/services/regionService";
import type { Customer, Region, CreateCustomerDto } from "../../types";
import LocationCapture from "../../components/location/LocationCapture";

const CustomerManagement: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  const [formData, setFormData] = useState<CreateCustomerDto>({
    name: "",
    address: "",
    primaryPhone: "",
    phoneNumbers: [],
    email: "",
    regionId: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as any,
  });

  const fetchData = async () => {
    try {
      const [customersData, regionsData] = await Promise.all([
        customerService.getAllCustomers(),
        regionService.getAllRegions(),
      ]);
      setCustomers(customersData);
      setRegions(regionsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setSnackbar({
        open: true,
        message: "Failed to load data",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDialog = (customer?: Customer) => {
    if (customer) {
      setSelectedCustomer(customer);
      setFormData({
        name: customer.name,
        address: customer.address,
        primaryPhone: customer.primaryPhone,
        phoneNumbers: customer.phoneNumbers || [],
        email: customer.email || "",
        regionId: customer.regionId,
        latitude: customer.latitude,
        longitude: customer.longitude,
      });
    } else {
      setSelectedCustomer(null);
      setFormData({
        name: "",
        address: "",
        primaryPhone: "",
        phoneNumbers: [],
        email: "",
        regionId: "",
      });
    }
    setDialog(true);
  };

  const handleCloseDialog = () => {
    setDialog(false);
    setSelectedCustomer(null);
    setFormData({
      name: "",
      address: "",
      primaryPhone: "",
      phoneNumbers: [],
      email: "",
      regionId: "",
    });
  };

  const handleSave = async () => {
    try {
      if (selectedCustomer) {
        await customerService.updateCustomer(selectedCustomer.id, formData);
        setSnackbar({
          open: true,
          message: "Customer updated successfully!",
          severity: "success",
        });
      } else {
        await customerService.createCustomer(formData);
        setSnackbar({
          open: true,
          message: "Customer created successfully!",
          severity: "success",
        });
      }
      handleCloseDialog();
      fetchData();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Operation failed",
        severity: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (selectedCustomer) {
      try {
        await customerService.deleteCustomer(selectedCustomer.id);
        setSnackbar({
          open: true,
          message: "Customer deleted successfully!",
          severity: "success",
        });
        setDeleteDialog(false);
        setSelectedCustomer(null);
        fetchData();
      } catch (error: any) {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || "Failed to delete customer",
          severity: "error",
        });
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <PageHeader
        title="Customer Management"
        action={{
          label: "Add Customer",
          icon: <AddIcon />,
          onClick: () => handleOpenDialog(),
        }}
      />

      {customers.length === 0 ? (
        <EmptyState
          title="No customers found"
          description="Create your first customer to get started"
          actionLabel="Add Customer"
          onAction={() => handleOpenDialog()}
        />
      ) : (
        <Card>
          <List>
            {customers.map((customer, index) => (
              <ListItem
                key={customer.id}
                divider={index < customers.length - 1}
                sx={{
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                {/* ✅ Clickable Customer Info with Avatar */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    flex: 1,
                  }}
                  onClick={() => navigate(`/customers/${customer.id}`)}
                >
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      mr: 2,
                      bgcolor: 'primary.main',
                      fontSize: '1.2rem',
                    }}
                  >
                    {customer.name.charAt(0).toUpperCase()}
                  </Avatar>
                  
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight={600}>
                        {customer.name}
                      </Typography>
                    }
                    secondary={
                      <Box component="span">
                        <Typography
                          variant="body2"
                          component="span"
                          color="text.secondary"
                        >
                          {customer.region?.name || "N/A"} •{" "}
                          {customer.primaryPhone}
                          {customer.phoneNumbers &&
                            customer.phoneNumbers.length > 0 && (
                              <>, {customer.phoneNumbers.join(", ")}</>
                            )}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          {customer.address}
                        </Typography>
                        {customer.email && (
                          <>
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              📧 {customer.email}
                            </Typography>
                          </>
                        )}
                      </Box>
                    }
                  />
                </Box>

                {/* ✅ Action Buttons */}
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDialog(customer);
                    }}
                    sx={{ mr: 1 }}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  {/* Uncomment if delete is needed
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCustomer(customer);
                      setDeleteDialog(true);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                  */}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedCustomer ? "Edit Customer" : "Create New Customer"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            {/* Name & Region Row */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  required
                  label="Customer Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  autoFocus
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  required
                  label="Region"
                  value={formData.regionId}
                  onChange={(e) =>
                    setFormData({ ...formData, regionId: e.target.value })
                  }
                >
                  {regions.map((region) => (
                    <MenuItem key={region.id} value={region.id}>
                      {region.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            {/* Address */}
            <TextField
              fullWidth
              required
              multiline
              rows={2}
              label="Address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />

            {/* Phone Numbers Component */}
            <PhoneNumberInput
              primaryPhone={formData.primaryPhone}
              additionalPhones={formData.phoneNumbers || []}
              onPrimaryPhoneChange={(phone) =>
                setFormData({ ...formData, primaryPhone: phone })
              }
              onAdditionalPhonesChange={(phones) =>
                setFormData({ ...formData, phoneNumbers: phones })
              }
            />

            {/* Email */}
            <TextField
              fullWidth
              label="Email (Optional)"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="customer@example.com"
            />

            {/* Location Capture Section */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Customer Location (Optional)
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mb: 1 }}
              >
                Capture location or paste coordinates from WhatsApp/Google Maps
              </Typography>

              <LocationCapture
                initialLocation={
                  formData.latitude && formData.longitude
                    ? {
                        latitude: formData.latitude,
                        longitude: formData.longitude,
                      }
                    : undefined
                }
                onLocationCapture={(location) => {
                  setFormData({
                    ...formData,
                    latitude: location.latitude,
                    longitude: location.longitude,
                  });
                }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={
              !formData.name ||
              !formData.address ||
              !formData.primaryPhone ||
              formData.primaryPhone.length !== 10 ||
              !formData.regionId
            }
          >
            {selectedCustomer ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialog}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone."
        confirmLabel="Delete"
        severity="error"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteDialog(false);
          setSelectedCustomer(null);
        }}
      />

      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
};

export default CustomerManagement;
