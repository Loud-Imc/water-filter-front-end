import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Chip,
  Collapse,
} from "@mui/material";
import { Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { createUser, fetchAssignableRoles } from "../../app/slices/userSlice";
import PageHeader from "../../components/common/PageHeader";
import SnackbarNotification from "../../components/common/SnackbarNotification";
import { SearchableSelect } from "../../components/common/SearchableSelect"; // 🆕 Add this import
import { userSchema } from "../../utils/validators";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";

interface FormData {
  name: string;
  email: string;
  password: string;
  roleId: string;
  regionId?: string;
  phone: string;
  isExternal?: boolean;
}

const CreateUser: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { assignableRoles } = useAppSelector((state) => state.users);
  const { user } = useAppSelector((state) => state.auth);
  const [selectedRoleName, setSelectedRoleName] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as any,
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(userSchema),
    context: { selectedRoleName },
    defaultValues: {
      name: "",
      email: "",
      password: "",
      roleId: "",
      regionId: "",
      phone: "",
      isExternal: false,
    },
  });

  // ✅ Watch the selected role
  const selectedRoleId = watch("roleId");
  const isExternalValue = watch("isExternal");

  // ✅ Check if selected role is "Technician"
  const selectedRole = assignableRoles.find(
    (role) => role.id === selectedRoleId
  );
  const isTechnicianRole = selectedRole?.name === "Technician";

  useEffect(() => {
    const foundRole = assignableRoles.find(
      (role) => role.id === selectedRoleId
    );
    setSelectedRoleName(foundRole?.name || "");
  }, [selectedRoleId, assignableRoles]);

  useEffect(() => {
    dispatch(fetchAssignableRoles());
  }, [dispatch]);

  const onSubmit = async (data: FormData) => {
    try {
      // ✅ Only include isExternal if role is Technician
      const payload = {
        ...data,
        createdById: user!.id,
        ...(isTechnicianRole && { isExternal: data.isExternal || false }),
      };

      await dispatch(createUser(payload)).unwrap();

      setSnackbar({
        open: true,
        message: "User created successfully!",
        severity: "success",
      });

      setTimeout(() => navigate("/users"), 2000);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || "Failed to create user",
        severity: "error",
      });
    }
  };

  return (
    <Box>
      <PageHeader
        title="Create User"
        breadcrumbs={[{ label: "Users", path: "/users" }, { label: "Create" }]}
      />

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              {/* Name */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Full Name"
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
                      label="Email"
                      type="email"
                      error={!!errors.email}
                      helperText={errors.email?.message}
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
                      label="Password"
                      type="text"
                      error={!!errors.password}
                      helperText={errors.password?.message}
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
                      label="Phone"
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                    />
                  )}
                />
              </Grid>

              {/* Role */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="roleId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Role"
                      error={!!errors.roleId}
                      helperText={errors.roleId?.message}
                    >
                      {assignableRoles.map((role) => (
                        <MenuItem key={role.id} value={role.id}>
                          {role.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              {/* 🆕 Region - Searchable (Only show if Technician) */}
              {isTechnicianRole && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="regionId"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        label="Select Region (Optional)"
                        value={field.value || ""}
                        onChange={field.onChange}
                        endpoint="/regions/search"
                        placeholder="Search region..."
                        error={!!errors.regionId}
                        helperText={errors.regionId?.message}
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
                </Grid>
              )}

              {/* ✅ Technician Type (Only show if role is Technician) */}
              <Grid size={12}>
                <Collapse in={isTechnicianRole}>
                  <Box
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      p: 2,
                      bgcolor: "background.paper",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      fontWeight={600}
                    >
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
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
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
                        icon={
                          isExternalValue ? <BusinessIcon /> : <PersonIcon />
                        }
                        label={
                          isExternalValue
                            ? "External Technician"
                            : "In-House Technician"
                        }
                        color={isExternalValue ? "warning" : "primary"}
                        size="small"
                      />
                    </Box>
                  </Box>
                </Collapse>
              </Grid>

              {/* Action Buttons */}
              <Grid size={12}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button type="submit" variant="contained" size="large">
                    Create User
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate("/users")}
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
};

export default CreateUser;
