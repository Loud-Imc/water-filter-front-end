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
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AddIcon from "@mui/icons-material/Add"; // ✅ Import AddIcon
import DirectionsIcon from "@mui/icons-material/Directions";
import { axiosInstance } from "../../api/axios";
import ServiceHistoryTimeline from "../../components/customer/ServiceHistoryTimeline";
import CustomerStats from "../../components/customer/CustomerStats";
import LoadingSpinner from "../../components/common/LoadingSpinner";

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

  useEffect(() => {
    fetchCustomerHistory();
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

              <Divider sx={{ my: 2 }} />

              {/* ✅ Quick Action Button */}
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
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
              </Button>
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
    </Box>
  );
};

export default CustomerProfile;
