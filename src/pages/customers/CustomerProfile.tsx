import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Avatar,
  Divider,
  IconButton,
  Stack,
  Alert,
  // Tooltip,
  ListItem,
  List,
  CircularProgress,
} from "@mui/material";
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  // Edit as EditIcon,
  // PlayArrow as PlayArrowIcon,
  // CheckCircle as CheckCircleIcon,
  // Error as ErrorIcon,
  Star as StarIcon,
  Business as BusinessIcon, // ✅ NEW
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DirectionsIcon from "@mui/icons-material/Directions";
import { axiosInstance } from "../../api/axios";
import ServiceHistoryTimeline from "../../components/customer/ServiceHistoryTimeline";
import CustomerStats from "../../components/customer/CustomerStats";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { installationService } from "../../api/services/installationService";
import QuickAddInstallationDialog from "../../components/installation/QuickAddInstallationDialog";
import type { Installation } from "../../types";

interface CustomerHistory {
  customer: any;
  serviceHistory: any[];
  statistics: {
    totalServices: number;
    installations: number;
    reInstallations: number;
    services: number;
    complaints: number;
    enquiries: number;
    lastService: string | null;
    completedServices: number;
  };
}

const CustomerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<CustomerHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [installations, setInstallations] = useState<Installation[]>([]); // ✅ NEW
  const [loadingInstallations, setLoadingInstallations] = useState(false);
  const [installationDialog, setInstallationDialog] = useState(false);
  useEffect(() => {
    fetchCustomerHistory();
    fetchInstallations();
  }, [id]);

  const fetchCustomerHistory = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/customers/${id}/history`);
      setData(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to load customer history"
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Fetch installations
  const fetchInstallations = async () => {
    try {
      setLoadingInstallations(true);
      const data = await installationService.getByCustomer(id!);
      setInstallations(data);
    } catch (err) {
      console.error("Failed to fetch installations:", err);
    } finally {
      setLoadingInstallations(false);
    }
  };

  // ✅ NEW: Navigate to create service with installation pre-filled
  const handleCreateServiceAtInstallation = (installation: Installation) => {
    if (!data?.customer) return; // Safety check

    navigate("/service-requests/create", {
      state: {
        customerId: data.customer.id, // ✅ Fixed
        customerName: data.customer.name, // ✅ Fixed
        regionId: installation.regionId,
        regionName: installation.region?.name || data.customer.region?.name, // ✅ Fixed
        installationId: installation.id,
        installationName: installation.name,
      },
    });
  };

  const handleNavigateToLocation = () => {
    if (data?.customer.latitude && data?.customer.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${data.customer.latitude},${data.customer.longitude}`;
      window.open(url, "_blank");
    }
  };

  // ✅ Navigate to create service with pre-filled data
  const handleCreateService = () => {
    if (!data?.customer) return;

    navigate("/service-requests/create", {
      state: {
        customerId: data.customer.id,
        customerName: data.customer.name,
        regionId: data.customer.regionId,
        regionName: data.customer.region?.name,
      },
    });
  };

  // ✅ ADD: Handle installation created
  const handleInstallationCreated = (
    // installationId: string,
    // installationName: string
  ) => {
    fetchInstallations(); // Refresh installations list
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) return <Alert severity="warning">Customer not found</Alert>;

  const { customer, serviceHistory, statistics } = data;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => navigate("/customers")} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" fontWeight={600}>
            {customer.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Customer since{" "}
            {new Date(customer.createdAt).toLocaleDateString("en-IN", {
              month: "long",
              year: "numeric",
            })}
          </Typography>
        </Box>
        {/* ✅ Create Service Button in Header */}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateService}
          size="large"
        >
          Create New Service
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Customer Info Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: "primary.main",
                    fontSize: "1.5rem",
                    mr: 2,
                  }}
                >
                  {customer.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {customer.name}
                  </Typography>
                  <Chip
                    label={customer.region?.name || "No Region"}
                    size="small"
                    color="primary"
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Contact Information */}
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Contact Information
              </Typography>

              <Stack spacing={1.5} sx={{ mb: 2 }}>
                {/* Primary Phone */}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <PhoneIcon
                    sx={{ mr: 1, color: "primary.main", fontSize: 20 }}
                  />
                  <Typography variant="body2">
                    {customer.primaryPhone}
                  </Typography>
                  <Chip label="Primary" size="small" sx={{ ml: 1 }} />
                </Box>

                {/* Additional Phones */}
                {customer.phoneNumbers && customer.phoneNumbers.length > 0 && (
                  <>
                    {customer.phoneNumbers.map(
                      (phone: string, index: number) => (
                        <Box
                          key={index}
                          sx={{ display: "flex", alignItems: "center" }}
                        >
                          <PhoneIcon
                            sx={{
                              mr: 1,
                              color: "text.secondary",
                              fontSize: 20,
                            }}
                          />
                          <Typography variant="body2">{phone}</Typography>
                        </Box>
                      )
                    )}
                  </>
                )}

                {/* Email */}
                {customer.email && (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <EmailIcon
                      sx={{ mr: 1, color: "primary.main", fontSize: 20 }}
                    />
                    <Typography variant="body2">{customer.email}</Typography>
                  </Box>
                )}

                {/* Address */}
                <Box sx={{ display: "flex", alignItems: "start" }}>
                  <LocationOnIcon
                    sx={{ mr: 1, color: "primary.main", fontSize: 20 }}
                  />
                  <Typography variant="body2">{customer.address}</Typography>
                </Box>
              </Stack>

              {/* Location Actions */}
              {customer.latitude && customer.longitude && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<DirectionsIcon />}
                    onClick={handleNavigateToLocation}
                  >
                    Navigate to Location
                  </Button>
                </Box>
              )}

              {/* <Divider sx={{ my: 2 }} /> */}

              {/* ✅ Quick Action Button */}
              {/* <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Quick Actions
              </Typography>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateService}
                size="large"
              >
                Create New Service Request
              </Button> */}
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <BusinessIcon color="primary" />
                  <Typography variant="h6">Installation Locations</Typography>
                  <Chip
                    label={installations.length}
                    size="small"
                    color="primary"
                  />
                </Box>
               
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                 <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setInstallationDialog(true)}
                  size="small"
                >
                  Add Installation
                </Button>
              </Box>

              {loadingInstallations ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : installations.length === 0 ? (
                <Alert severity="info">
                  No installations found. Add installation locations to track
                  services at specific sites.
                </Alert>
              ) : (
                <List sx={{ p: 0 }}>
                  {installations.map((installation, index) => (
                    <React.Fragment key={installation.id}>
                      {index > 0 && <Divider />}
                      <ListItem
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "stretch",
                          py: 2,
                          px: 0,
                          "&:hover": {
                            bgcolor: "action.hover",
                          },
                        }}
                      >
                        {/* Installation Header */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          <LocationIcon color="action" fontSize="small" />
                          <Typography variant="subtitle1" fontWeight={600}>
                            {installation.name}
                          </Typography>
                          {installation.isPrimary && (
                            <Chip
                              icon={<StarIcon />}
                              label="Primary"
                              size="small"
                              color="primary"
                            />
                          )}
                          {installation.installationType && (
                            <Chip
                              label={installation.installationType}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {!installation.isActive && (
                            <Chip
                              label="Inactive"
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                          )}
                        </Box>

                        {/* Installation Details */}
                        <Box sx={{ mb: 1.5 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}
                          >
                            📍 {installation.address}
                          </Typography>

                          {installation.landmark && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 0.5 }}
                            >
                              🏛️ Landmark: {installation.landmark}
                            </Typography>
                          )}

                          {installation.contactPerson && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 0.5 }}
                            >
                              👤 Contact: {installation.contactPerson}
                              {installation.contactPhone &&
                                ` • 📞 ${installation.contactPhone}`}
                            </Typography>
                          )}

                          {installation.notes && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                fontStyle: "italic",
                                display: "block",
                                mt: 0.5,
                              }}
                            >
                              Note: {installation.notes}
                            </Typography>
                          )}
                        </Box>

                        {/* Action Buttons */}
                        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() =>
                              handleCreateServiceAtInstallation(installation)
                            }
                            disabled={!installation.isActive}
                          >
                            Create Service
                          </Button>
                          {/* <Tooltip title="Edit installation">
                            <IconButton size="small" color="primary">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip> */}
                        </Box>
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Statistics Card */}
          <CustomerStats statistics={statistics} sx={{ mt: 2 }} />
        </Grid>

        {/* Service History Timeline */}
        <Grid size={{ xs: 12, md: 8 }}>
          <ServiceHistoryTimeline serviceHistory={serviceHistory} />
        </Grid>
      </Grid>

      {data?.customer && (
        <QuickAddInstallationDialog
          open={installationDialog}
          onClose={() => setInstallationDialog(false)}
          onInstallationCreated={handleInstallationCreated}
          customerId={data.customer.id}
          preSelectedRegionId={data.customer.regionId}
        />
      )}
    </Box>
  );
};

export default CustomerProfile;
