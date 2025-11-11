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
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { installationService } from "../../api/services/installationService";
import { requestService } from "../../api/services/requestService";
import type { TechnicianWithWorkload, Installation } from "../../types";
import axiosInstance from "../../api/axios";
import QuickAddInstallationDialog from "../../components/installation/QuickAddInstallationDialog";

// Validation schema with proper enum types
// ✅ UPDATED: Add optional installationId
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
  installationId: yup.string().optional(), // ✅ NEW: Optional installation
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
  installationId?: string; // ✅ NEW
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
    installationId?: string; // ✅ NEW
    installationName?: string; // ✅ NEW
  } | null;
  // States
  const [customerDialog, setCustomerDialog] = useState(false);
  const [regionDialog, setRegionDialog] = useState(false);
  const [installationDialog, setInstallationDialog] = useState(false);
  const [technicians, setTechnicians] = useState<TechnicianWithWorkload[]>([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);
  const [installations, setInstallations] = useState<Installation[]>([]); // ✅ NEW
  const [loadingInstallations, setLoadingInstallations] = useState(false); // ✅ NEW
  const [selectedCustomerName, setSelectedCustomerName] = useState(
    prefilledData?.customerName || ""
  );
  const [selectedRegionName, setSelectedRegionName] = useState(
    prefilledData?.regionName || ""
  );

  const [selectedInstallationName, setSelectedInstallationName] = useState(
    prefilledData?.installationName || ""
  ); // ✅ NEW
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
      installationId: prefilledData?.installationId || "", // ✅ NEW
      priority: "NORMAL",
      assignedToId: "",
      adminNotes: "",
    },
  });

  const watchRegionId = watch("regionId");
  const watchCustomerId = watch("customerId"); // ✅ NEW

  // Fetch technicians when region changes
  useEffect(() => {
    if (watchRegionId) {
      fetchTechnicians(watchRegionId);
    }
  }, [watchRegionId]);

  useEffect(() => {
    if (watchCustomerId) {
      fetchInstallations(watchCustomerId);
    } else {
      setInstallations([]);
      setValue("installationId", "");
    }
  }, [watchCustomerId]);

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

  const fetchInstallations = async (customerId: string) => {
    setLoadingInstallations(true);
    try {
      const data = await installationService.getByCustomer(customerId);
      setInstallations(data.filter((i) => i.isActive));

      // If only one installation, auto-select it
      if (data.length === 1) {
        setValue("installationId", data[0].id);
        setSelectedInstallationName(data[0].name);
      }
    } catch (error) {
      console.error("Failed to fetch installations:", error);
      setInstallations([]);
    } finally {
      setLoadingInstallations(false);
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
    fetchInstallations(customerId); // ✅ NEW: Fetch installations for new customer
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
      setInstallations([]); // ✅ NEW: Clear installations
      setValue("installationId", "");
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

  // ✅ NEW: Handle region created
  // const handleRegionCreated = (regionId: string) => {
  //   setValue("regionId", regionId);
  //   fetchTechnicians(regionId);
  // };

  // ✅ NEW: Handle installation created
  const handleInstallationCreated = (
    installationId: string,
    installationName: string
  ) => {
    setValue("installationId", installationId);
    setSelectedInstallationName(installationName);
    // Refresh installations list
    if (watchCustomerId) {
      fetchInstallations(watchCustomerId);
    }
  };

  // ✅ NEW: Handle installation selection
  const handleInstallationChange = (value: string | null) => {
    setValue("installationId", value || "");
    const installation = installations.find((i) => i.id === value);
    if (installation) {
      setSelectedInstallationName(installation.name);
    } else {
      setSelectedInstallationName("");
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
                  <strong>{prefilledData.customerName}</strong>
                  {prefilledData.installationName && (
                    <> at <strong>{prefilledData.installationName}</strong></>
                  )}
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
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Chip label="High" color="error" size="small" />
                            <Typography variant="body2">Urgent - VIP</Typography>
                          </Box>
                        </MenuItem>
                        <MenuItem value="MEDIUM">
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Chip label="Medium" color="warning" size="small" />
                            <Typography variant="body2">Important</Typography>
                          </Box>
                        </MenuItem>
                        <MenuItem value="NORMAL">
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Chip label="Normal" color="success" size="small" />
                            <Typography variant="body2">Standard priority</Typography>
                          </Box>
                        </MenuItem>
                        <MenuItem value="LOW">
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                              <LockIcon sx={{ color: "text.secondary", fontSize: 20 }} />
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
                  <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
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
                                  <Typography variant="caption" color="text.secondary">
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

              {/* Customer Selection */}
              <Box>
                <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                  <Box sx={{ flexGrow: 1 }}>
                    {prefilledData?.customerId ? (
                      <Controller
                        name="customerId"
                        control={control}
                        render={({ /*field */ }) => (
                          <TextField
                            fullWidth
                            label="Select Customer *"
                            value={selectedCustomerName}
                            disabled
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LockIcon sx={{ color: "text.secondary", fontSize: 20 }} />
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
                      <Controller
                        name="customerId"
                        control={control}
                        render={({ field }) => (
                          <SearchableSelect
                            label="Select Customer *"
                            value={field.value}
                            onChange={(value, option) => {
                              field.onChange(value);
                              handleCustomerChange(value, option);
                            }}
                            endpoint="/customers/search"
                            placeholder="Type name or phone number..."
                            error={!!formErrors.customerId}
                            helperText={
                              formErrors.customerId?.message ||
                              (watchRegionId 
                                ? `Showing customers from selected region` 
                                : "Search by name, phone, or email")
                            }
                            filters={{ regionId: watchRegionId }}
                            renderOption={(option: any) => (
                              <Box>
                                <Typography variant="body1" fontWeight={500}>
                                  {option.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  📞 {option.primaryPhone} • {option.region?.name || "N/A"}
                                </Typography>
                              </Box>
                            )}
                          />
                        )}
                      />
                    )}
                  </Box>

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

              {/* ✅ NEW: Installation Selection */}
              {watchCustomerId && (
                <Box>
                  {prefilledData?.installationId ? (
                    // Pre-filled installation
                    <Controller
                      name="installationId"
                      control={control}
                      render={({ /*field */ }) => (
                        <TextField
                          fullWidth
                          label="Installation Location"
                          value={selectedInstallationName}
                          disabled
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationOnIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                              </InputAdornment>
                            ),
                          }}
                          helperText="🔒 Pre-selected installation"
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
                    // Normal installation selection
                    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Controller
                          name="installationId"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              select
                              fullWidth
                              label="Installation Location (Optional)"
                              onChange={(e) => handleInstallationChange(e.target.value)}
                              disabled={loadingInstallations || installations.length === 0}
                              InputProps={{
                                startAdornment: (
                                  <LocationOnIcon sx={{ mr: 1, color: "action.active" }} />
                                ),
                              }}
                              helperText={
                                loadingInstallations
                                  ? "Loading installations..."
                                  : installations.length === 0
                                  ? "No installations for this customer. Add one to specify location."
                                  : "Select installation location for this service"
                              }
                            >
                              <MenuItem value="">
                                <em>No specific installation</em>
                              </MenuItem>
                              {installations.map((installation) => (
                                <MenuItem key={installation.id} value={installation.id}>
                                  <Box sx={{ width: "100%" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                      <Typography variant="body2" fontWeight={500}>
                                        {installation.name}
                                      </Typography>
                                      {installation.isPrimary && (
                                        <Chip label="Primary" size="small" color="primary" />
                                      )}
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                      {installation.address}
                                      {installation.installationType && 
                                        ` • ${installation.installationType}`}
                                    </Typography>
                                  </Box>
                                </MenuItem>
                              ))}
                            </TextField>
                          )}
                        />
                      </Box>

                      <Tooltip title="Add new installation">
                        <IconButton
                          color="primary"
                          onClick={() => setInstallationDialog(true)}
                          disabled={!watchCustomerId || !watchRegionId}
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
              )}

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
                          <AssignmentIndIcon sx={{ mr: 1, color: "action.active" }} />
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
                                <Typography variant="caption" color="text.secondary">
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

      {/* Quick Add Region Dialog */}
      <QuickAddRegionDialog
        open={regionDialog}
        onClose={() => setRegionDialog(false)}
        onRegionCreated={handleRegionCreated}
      />

      {/* ✅ NEW: Quick Add Installation Dialog */}
      <QuickAddInstallationDialog
        open={installationDialog}
        onClose={() => setInstallationDialog(false)}
        onInstallationCreated={handleInstallationCreated}
        customerId={watchCustomerId}
        preSelectedRegionId={watchRegionId}
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
