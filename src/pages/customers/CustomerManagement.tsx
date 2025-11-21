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
  InputAdornment,
  Chip,
  Tooltip,
} from "@mui/material";
import { Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
import PageHeader from "../../components/common/PageHeader";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import SnackbarNotification from "../../components/common/SnackbarNotification";
import EmptyState from "../../components/common/EmptyState";
import PhoneNumberInput from "../../components/customer/PhoneNumberInput";
// import LocationCapture from "../../components/location/LocationCapture";
import QuickAddRegionDialog from "../../components/region/QuickAddRegionDialog"; // ✅ NEW COMPONENT
import { customerService } from "../../api/services/customerService";
import { regionService } from "../../api/services/regionService";
import type { Customer, Region, CreateCustomerDto } from "../../types";
import { SearchableSelect } from "../../components/common/SearchableSelect";

const CustomerManagement: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [regionDialog, setRegionDialog] = useState(false); // ✅ NEW: Quick add region dialog
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState<CreateCustomerDto>({
    name: "",
    address: "",
    primaryPhone: "",
    phoneNumbers: [],
    email: null,
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
      setFilteredCustomers(customersData);
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

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedRegion, customers]);

  const applyFilters = async () => {
    let results = [...customers];

    if (searchQuery.trim()) {
      setSearching(true);
      try {
        const searchResults = await customerService.searchCustomers(
          searchQuery,
          selectedRegion !== "all" ? selectedRegion : undefined
        );
        results = searchResults;
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setSearching(false);
      }
    } else if (selectedRegion !== "all") {
      results = results.filter((c) => c.regionId === selectedRegion);
    }

    setFilteredCustomers(results);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedRegion("all");
    setFilteredCustomers(customers);
  };

  const hasActiveFilters = searchQuery.trim() || selectedRegion !== "all";

  const handleOpenDialog = (customer?: Customer) => {
    if (customer) {
      setSelectedCustomer(customer);
      setFormData({
        name: customer.name,
        address: customer.address,
        primaryPhone: customer.primaryPhone,
        phoneNumbers: customer.phoneNumbers || [],
        email: customer.email || null,
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
        email: null,
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
      email: null,
      regionId: "",
    });
  };

  // ✅ NEW: Handle region creation from customer dialog
  const handleRegionCreated = async (newRegionId: string) => {
    // Refresh regions list
    const regionsData = await regionService.getAllRegions();
    setRegions(regionsData);

    // Auto-select the newly created region
    setFormData({ ...formData, regionId: newRegionId });

    setSnackbar({
      open: true,
      message: "Region created and selected!",
      severity: "success",
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

      {/* Search & Filter Section */}
      <Card sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <TextField
            size="small"
            placeholder="Search by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery("")}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant={showFilters ? "contained" : "outlined"}
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>

          {hasActiveFilters && (
            <Button
              variant="text"
              color="error"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
            >
              Clear
            </Button>
          )}
        </Box>

        {showFilters && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Region"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                >
                  <MenuItem value="all">All Regions</MenuItem>
                  {regions.map((region) => (
                    <MenuItem key={region.id} value={region.id}>
                      {region.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>
        )}

        {hasActiveFilters && (
          <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ alignSelf: "center" }}
            >
              Active filters:
            </Typography>
            {searchQuery && (
              <Chip
                size="small"
                label={`Search: "${searchQuery}"`}
                onDelete={() => setSearchQuery("")}
              />
            )}
            {selectedRegion !== "all" && (
              <Chip
                size="small"
                label={`Region: ${
                  regions.find((r) => r.id === selectedRegion)?.name
                }`}
                onDelete={() => setSelectedRegion("all")}
              />
            )}
          </Box>
        )}

        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {searching ? (
              "Searching..."
            ) : (
              <>
                Showing {filteredCustomers.length} of {customers.length}{" "}
                customers
              </>
            )}
          </Typography>
        </Box>
      </Card>

      {/* Customer List */}
      {filteredCustomers.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? "No customers found" : "No customers yet"}
          description={
            hasActiveFilters
              ? "Try adjusting your search or filters"
              : "Create your first customer to get started"
          }
          actionLabel={!hasActiveFilters ? "Add Customer" : undefined}
          onAction={!hasActiveFilters ? () => handleOpenDialog() : undefined}
        />
      ) : (
        <Card>
          <List>
            {filteredCustomers.map((customer, index) => (
              <ListItem
                key={customer.id}
                divider={index < filteredCustomers.length - 1}
                sx={{
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    flex: 1,
                  }}
                  onClick={() => navigate(`/customers/${customer.id}`)}
                >
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      mr: 2,
                      bgcolor: "primary.main",
                      fontSize: "1.2rem",
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
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              📧 {customer.email}
                            </Typography>
                          </>
                        )}
                      </Box>
                    }
                  />
                </Box>

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
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Card>
      )}

      {/* Create/Edit Customer Dialog */}
      <Dialog open={dialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedCustomer ? "Edit Customer" : "Create New Customer"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
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
                {/* ✅ ENHANCED: Searchable Region selector with quick add button */}
                <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <SearchableSelect
                      label="Region *"
                      value={formData.regionId}
                      onChange={(value) =>
                        setFormData({ ...formData, regionId: value || "" })
                      }
                      endpoint="/regions/search"
                      placeholder="Type to search region..."
                      // error={!!error && !formData.regionId}
                      // helperText={
                      //   error && !formData.regionId
                      //     ? "Region is required"
                      //     : "Type at least 2 characters to search"
                      // }
                      helperText="Type at least 2 characters to search"
                      renderOption={(option: any) => (
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            {option.name}
                          </Typography>
                          {option.district && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {option.district} • {option.city || "N/A"} •{" "}
                              {option.pincode || "N/A"}
                            </Typography>
                          )}
                        </Box>
                      )}
                    />
                  </Box>

                  {/* ✅ Quick Add Region Button */}
                  <Tooltip title="Create new region">
                    <IconButton
                      color="primary"
                      onClick={() => setRegionDialog(true)}
                      sx={{
                        border: 1,
                        borderColor: "primary.main",
                        borderRadius: 1,
                        mt: 1, // Align with the text field
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>

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

            {/* <Box sx={{ mt: 2 }}>
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
            </Box> */}
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

      {/* ✅ NEW: Quick Add Region Dialog */}
      <QuickAddRegionDialog
        open={regionDialog}
        onClose={() => setRegionDialog(false)}
        onRegionCreated={handleRegionCreated}
      />

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
