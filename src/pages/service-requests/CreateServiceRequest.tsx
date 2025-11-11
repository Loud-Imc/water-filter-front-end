import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  Typography,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  InputAdornment,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { Grid } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { createRequest } from "../../app/slices/requestSlice";
import PageHeader from "../../components/common/PageHeader";
import SnackbarNotification from "../../components/common/SnackbarNotification";
import { SearchableSelect } from "../../components/common/SearchableSelect";
import QuickAddCustomerDialog from "../../components/customer/QuickAddCustomerDialog";
import QuickAddRegionDialog from "../../components/region/QuickAddRegionDialog";
import { requestService } from "../../api/services/requestService";
import type { TechnicianWithWorkload } from "../../types";
import axiosInstance from "../../api/axios";

// Validation schema with proper enum types
const serviceRequestSchema = yup.object().shape({
  type: yup
    .string()
    .oneOf([
      "SERVICE",
      "INSTALLATION",
      "RE_INSTALLATION",
      "COMPLAINT",
      "ENQUIRY",
    ] as const)
    .required("Request type is required"),
  description: yup.string().required("Description is required"),
  customerId: yup.string().required("Customer is required"),
  regionId: yup.string().required("Region is required"),
  priority: yup
    .string()
    .oneOf(["HIGH", "MEDIUM", "NORMAL", "LOW"] as const)
    .required("Priority is required"),
  assignedToId: yup.string().required("Technician assignment is required"),
  adminNotes: yup.string().optional(),
});

interface FormData {
  type:
    | "SERVICE"
    | "INSTALLATION"
    | "RE_INSTALLATION"
    | "COMPLAINT"
    | "ENQUIRY";
  description: string;
  customerId: string;
  regionId: string;
  priority: "HIGH" | "MEDIUM" | "NORMAL" | "LOW";
  assignedToId: string;
  adminNotes?: string;
}

const CreateServiceRequest: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.requests);

  // Get pre-filled data from navigation state (when coming from customer profile)
  const prefilledData = location.state as {
    customerId?: string;
    customerName?: string;
    regionId?: string;
    regionName?: string;
  } | null;
  // States
  const [customerDialog, setCustomerDialog] = useState(false);
  const [regionDialog, setRegionDialog] = useState(false);
  const [technicians, setTechnicians] = useState<TechnicianWithWorkload[]>([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);
  const [selectedCustomerName, setSelectedCustomerName] = useState(
    prefilledData?.customerName || ""
  );
  const [selectedRegionName, setSelectedRegionName] = useState(
    prefilledData?.regionName || ""
  );
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { errors: formErrors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(serviceRequestSchema),
    defaultValues: {
      type: "SERVICE",
      description: "",
      customerId: prefilledData?.customerId || "",
      regionId: prefilledData?.regionId || "",
      priority: "NORMAL",
      assignedToId: "",
      adminNotes: "",
    },
  });

  const watchRegionId = watch("regionId");

  // Fetch technicians when region changes
  useEffect(() => {
    if (watchRegionId) {
      fetchTechnicians(watchRegionId);
    }
  }, [watchRegionId]);

  // Fetch technicians with workload
  const fetchTechnicians = async (regionId: string) => {
    setLoadingTechnicians(true);
    try {
      const data = await requestService.getTechniciansWithWorkload(regionId);
      setTechnicians(data);
    } catch (error) {
      console.error("Failed to fetch technicians:", error);
      setSnackbar({
        open: true,
        message: "Failed to load technicians",
        severity: "error",
      });
    } finally {
      setLoadingTechnicians(false);
    }
  };

  // Handle customer creation from quick add dialog
  const handleCustomerCreated = (
    customerId: string,
    customerName: string,
    regionId: string
  ) => {
    setValue("customerId", customerId);
    setValue("regionId", regionId);
    setSelectedCustomerName(customerName);

    // Fetch technicians for the selected region
    fetchTechnicians(regionId);
  };

  const handleRegionCreated = async (regionId: string) => {
    setValue("regionId", regionId);

    try {
      const response = await axiosInstance.get(`/regions/${regionId}`);
      setSelectedRegionName(response.data.name);
      fetchTechnicians(regionId);
    } catch (error) {
      console.error("Failed to fetch region details:", error);
    }
  };

  // Handle customer selection
  const handleCustomerChange = (value: string | null, option: any) => {
    setValue("customerId", value || "");
    if (option) {
      setSelectedCustomerName(option.name);
      if (option.regionId) {
        setValue("regionId", option.regionId);
        setSelectedRegionName(option.region?.name || "");
      }
    } else {
      setSelectedCustomerName("");
    }
  };

  // Handle region selection
  const handleRegionChange = (value: string | null, option: any) => {
    setValue("regionId", value || "");
    if (option) {
      setSelectedRegionName(option.name);
    } else {
      setSelectedRegionName("");
    }
  };

  // Submit handler
  const onSubmit = async (data: FormData) => {
    try {
      await dispatch(createRequest(data)).unwrap();

      setSnackbar({
        open: true,
        message: "Service request created and assigned successfully!",
        severity: "success",
      });

      // Navigate to service requests list after short delay
      setTimeout(() => {
        navigate("/service-requests");
      }, 1500);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to create service request",
        severity: "error",
      });
    }
  };

  // // Priority color helper
  // const getPriorityColor = (priority: string) => {
  //   switch (priority) {
  //     case "HIGH":
  //       return "error";
  //     case "MEDIUM":
  //       return "warning";
  //     case "LOW":
  //       return "default";
  //     default:
  //       return "success";
  //   }
  // };

  return (
    <Box>
      <PageHeader title="Create Service Request" />

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Show alert if coming from customer profile */}
              {prefilledData?.customerId && (
                <Alert severity="info" icon={<PersonIcon />}>
                  Creating service request for customer:{" "}
                  <strong>{prefilledData.customerName}</strong> in region:{" "}
                  <strong>{prefilledData.regionName}</strong>
                </Alert>
              )}

              {/* Request Type and Priority */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        required
                        label="Request Type"
                        error={!!formErrors.type}
                        helperText={formErrors.type?.message}
                      >
                        <MenuItem value="SERVICE">Service</MenuItem>
                        <MenuItem value="INSTALLATION">Installation</MenuItem>
                        <MenuItem value="RE_INSTALLATION">
                          Re-Installation
                        </MenuItem>
                        <MenuItem value="COMPLAINT">Complaint</MenuItem>
                        <MenuItem value="ENQUIRY">Enquiry</MenuItem>
                      </TextField>
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        required
                        label="Priority"
                        error={!!formErrors.priority}
                        helperText={formErrors.priority?.message}
                        InputProps={{
                          startAdornment: (
                            <PriorityHighIcon
                              sx={{ mr: 1, color: "action.active" }}
                            />
                          ),
                        }}
                      >
                        <MenuItem value="HIGH">
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Chip label="High" color="error" size="small" />
                            <Typography variant="body2">
                              Urgent - VIP
                            </Typography>
                          </Box>
                        </MenuItem>
                        <MenuItem value="MEDIUM">
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Chip label="Medium" color="warning" size="small" />
                            <Typography variant="body2">Important</Typography>
                          </Box>
                        </MenuItem>
                        <MenuItem value="NORMAL">
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Chip label="Normal" color="success" size="small" />
                            <Typography variant="body2">
                              Standard priority
                            </Typography>
                          </Box>
                        </MenuItem>
                        <MenuItem value="LOW">
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Chip label="Low" color="default" size="small" />
                            <Typography variant="body2">Can wait</Typography>
                          </Box>
                        </MenuItem>
                      </TextField>
                    )}
                  />
                </Grid>
              </Grid>

              {/* Region Selection */}
              <Box>
                {prefilledData?.regionId ? (
                  <Controller
                    name="regionId"
                    control={control}
                    render={({ 
                      // field 
                    }) => (
                      <TextField
                        fullWidth
                        label="Region *"
                        value={selectedRegionName}
                        disabled
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon
                                sx={{ color: "text.secondary", fontSize: 20 }}
                              />
                            </InputAdornment>
                          ),
                        }}
                        helperText="🔒 Pre-selected from customer profile"
                        sx={{
                          "& .MuiInputBase-input.Mui-disabled": {
                            WebkitTextFillColor: "rgba(0, 0, 0, 0.87)",
                            color: "rgba(0, 0, 0, 0.87)",
                          },
                        }}
                      />
                    )}
                  />
                ) : (
                  <Box
                    sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Controller
                        name="regionId"
                        control={control}
                        render={({ field }) => (
                          <SearchableSelect
                            label="Region *"
                            value={field.value}
                            onChange={(value, option) => {
                              field.onChange(value);
                              handleRegionChange(value, option);
                            }}
                            endpoint="/regions/search"
                            placeholder="Type to search region..."
                            error={!!formErrors.regionId}
                            helperText={
                              formErrors.regionId?.message ||
                              "Type at least 2 characters to search"
                            }
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
                          mt: 1,
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>

              {/* Customer Selection with Quick Add */}
              <Box>
                <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Controller
                      name="customerId"
                      control={control}
                      render={({ field }) => (
                        <>
                          {prefilledData?.customerId ? (
                            // ✅ Show simple TextField when pre-filled
                            <TextField
                              fullWidth
                              label="Select Customer *"
                              value={selectedCustomerName}
                              disabled
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <LockIcon
                                      sx={{
                                        color: "text.secondary",
                                        fontSize: 20,
                                      }}
                                    />
                                  </InputAdornment>
                                ),
                              }}
                              helperText="🔒 Pre-selected from customer profile"
                              sx={{
                                "& .MuiInputBase-input.Mui-disabled": {
                                  WebkitTextFillColor: "rgba(0, 0, 0, 0.87)",
                                  color: "rgba(0, 0, 0, 0.87)",
                                },
                              }}
                            />
                          ) : (
                            // ✅ Show SearchableSelect when creating normally
                            <SearchableSelect
                              label="Select Customer *"
                              value={field.value}
                              onChange={(value, option) => {
                                field.onChange(value);
                                handleCustomerChange(value, option);
                              }}
                              endpoint="/customers/search"
                              filters={{ regionId: watchRegionId }}
                              placeholder="Type name or phone number..."
                              error={!!formErrors.customerId}
                              helperText={
                                formErrors.customerId?.message ||
                                (watchRegionId
                                  ? `Showing customers from selected region`
                                  : "Search by name, phone, or email")
                              }
                              renderOption={(option: any) => (
                                <Box>
                                  <Typography variant="body1" fontWeight={500}>
                                    {option.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    📞 {option.primaryPhone} •{" "}
                                    {option.region?.name || "N/A"}
                                  </Typography>
                                </Box>
                              )}
                            />
                          )}
                        </>
                      )}
                    />
                  </Box>

                  {/* Quick Add Customer Button - Only show when not pre-filled */}
                  {!prefilledData?.customerId && (
                    <Tooltip title="Create new customer">
                      <IconButton
                        color="primary"
                        onClick={() => setCustomerDialog(true)}
                        sx={{
                          border: 1,
                          borderColor: "primary.main",
                          borderRadius: 1,
                          mt: 1,
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>

              {/* Technician Assignment */}
              <Box>
                <Controller
                  name="assignedToId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      required
                      label="Assign to Technician"
                      error={!!formErrors.assignedToId}
                      helperText={
                        formErrors.assignedToId?.message ||
                        "Select technician to assign this request"
                      }
                      disabled={!watchRegionId || loadingTechnicians}
                      InputProps={{
                        startAdornment: (
                          <AssignmentIndIcon
                            sx={{ mr: 1, color: "action.active" }}
                          />
                        ),
                      }}
                    >
                      {loadingTechnicians ? (
                        <MenuItem disabled>
                          <LinearProgress sx={{ width: "100%" }} />
                        </MenuItem>
                      ) : technicians.length === 0 ? (
                        <MenuItem disabled>
                          No technicians available in this region
                        </MenuItem>
                      ) : (
                        technicians.map((tech) => (
                          <MenuItem key={tech.id} value={tech.id}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                width: "100%",
                                alignItems: "center",
                              }}
                            >
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {tech.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {tech.region?.name || "N/A"}
                                </Typography>
                              </Box>
                              <Chip
                                label={`${tech.pendingTasks} pending`}
                                size="small"
                                color={
                                  tech.pendingTasks === 0
                                    ? "success"
                                    : tech.pendingTasks <= 2
                                    ? "warning"
                                    : "error"
                                }
                              />
                            </Box>
                          </MenuItem>
                        ))
                      )}
                    </TextField>
                  )}
                />
              </Box>

              {/* Description */}
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    required
                    multiline
                    rows={4}
                    label="Description"
                    placeholder="Describe the service request in detail..."
                    error={!!formErrors.description}
                    helperText={formErrors.description?.message}
                  />
                )}
              />

              {/* Admin Notes (Optional) */}
              {/* <Controller
                name="adminNotes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={2}
                    label="Admin Notes (Optional)"
                    placeholder="Internal notes for reference..."
                  />
                )}
              /> */}

              {/* Error Display */}
              {error && (
                <Alert
                  severity="error"
                  onClose={() => dispatch({ type: "requests/clearError" })}
                >
                  {error}
                </Alert>
              )}

              {/* Action Buttons */}
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/service-requests")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? "Creating..." : "Create & Assign Request"}
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Quick Add Customer Dialog */}
      <QuickAddCustomerDialog
        open={customerDialog}
        onClose={() => setCustomerDialog(false)}
        onCustomerCreated={handleCustomerCreated}
        preSelectedRegionId={watchRegionId}
      />

      <QuickAddRegionDialog
        open={regionDialog}
        onClose={() => setRegionDialog(false)}
        onRegionCreated={handleRegionCreated}
      />

      {/* Snackbar Notification */}
      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
};

export default CreateServiceRequest;
