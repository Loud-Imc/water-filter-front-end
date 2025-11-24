import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Chip,
  Alert,
} from "@mui/material";
import { Grid } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { quickAddTehcnicianSchema } from "../../utils/validators";
import { userService } from "../../api/services/userService";
import { regionService } from "../../api/services/regionService";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import type { Region, Role } from "../../types";

interface FormData {
  name: string;
  email: string;
  password: string;
  roleId: string;
  regionId: string;
  phone: string;
  isExternal?: boolean;
}

interface QuickAddTechnicianDialogProps {
  open: boolean;
  onClose: () => void;
  onTechnicianCreated: (technicianId: string) => void;
  preSelectedRegionId?: string; // Pre-fill region from service request
}

const QuickAddTechnicianDialog: React.FC<QuickAddTechnicianDialogProps> = ({
  open,
  onClose,
  onTechnicianCreated,
  preSelectedRegionId,
}) => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [roles, setRoles] = useState<Role[]>([]); // 🆕 Fetch roles
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(quickAddTehcnicianSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      roleId: "",
      regionId: preSelectedRegionId || "",
      phone: "",
      isExternal: false,
    },
  });

  const isExternalValue = watch("isExternal");

  // 🆕 Fetch regions and roles when dialog opens
  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      const [regionsData, rolesData] = await Promise.all([
        regionService.getAllRegions(),
        userService.getAssignableRoles(),
      ]);
      
      setRegions(regionsData);
      setRoles(rolesData);

      // 🆕 Auto-select "Technician" role
      const technicianRole = rolesData.find(
        (role) => role.name === "Technician"
      );
      if (technicianRole) {
        setValue("roleId", technicianRole.id);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError("Failed to load roles and regions");
    }
  };

  // Update regionId when preSelectedRegionId changes
  useEffect(() => {
    if (preSelectedRegionId) {
      setValue("regionId", preSelectedRegionId);
    }
  }, [preSelectedRegionId, setValue]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");

    try {
      const response = await userService.createUser({
        ...data,
        isExternal: data.isExternal || false,
      });

      onTechnicianCreated(response.id);
      reset();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create technician");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Quick Add Technician</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form id="quick-add-technician-form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              {/* Name */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Full Name *"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      autoFocus
                    />
                  )}
                />
              </Grid>

              {/* Email */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email *"
                      type="email"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Grid>

              {/* Phone */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Phone *"
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                    />
                  )}
                />
              </Grid>

              {/* Password */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Password *"
                      type="text"
                      error={!!errors.password}
                      helperText={errors.password?.message}
                    />
                  )}
                />
              </Grid>

              {/* Region */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="regionId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Region *"
                      error={!!errors.regionId}
                      helperText={errors.regionId?.message}
                    >
                      {regions.map((region) => (
                        <MenuItem key={region.id} value={region.id}>
                          {region.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              {/* 🆕 Role Selector (editable, but defaults to Technician) */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="roleId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Role *"
                      error={!!errors.roleId}
                      helperText={errors.roleId?.message || "Technician is selected by default"}
                    >
                      {roles.map((role) => (
                        <MenuItem key={role.id} value={role.id}>
                          {role.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              {/* Technician Type */}
              <Grid size={12}>
                <Box
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    p: 2,
                    bgcolor: "grey.50",
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    Technician Type
                  </Typography>

                  <Controller
                    name="isExternal"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={field.value || false}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        }
                        label={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <BusinessIcon fontSize="small" color="warning" />
                            <span>External/Contract Technician</span>
                          </Box>
                        }
                      />
                    )}
                  />

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ mt: 1, ml: 4 }}
                  >
                    {isExternalValue
                      ? "🔶 This technician is hired externally (contract/freelance)"
                      : "🏠 This is an in-house technician (permanent staff member)"}
                  </Typography>

                  <Box sx={{ mt: 2, ml: 4 }}>
                    <Chip
                      icon={isExternalValue ? <BusinessIcon /> : <PersonIcon />}
                      label={
                        isExternalValue ? "External Technician" : "In-House Technician"
                      }
                      color={isExternalValue ? "warning" : "primary"}
                      size="small"
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="quick-add-technician-form"
          variant="contained"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Technician"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuickAddTechnicianDialog;
