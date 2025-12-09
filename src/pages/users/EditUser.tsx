import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Tabs,
  Tab,
  Typography,
  InputAdornment,
  IconButton,
  Divider,
  Collapse,
  FormControlLabel,
  Checkbox,
  Chip,
} from "@mui/material";
import { Grid } from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LockResetIcon from "@mui/icons-material/LockReset";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import PageHeader from "../../components/common/PageHeader";
import SnackbarNotification from "../../components/common/SnackbarNotification";
import { SearchableSelect } from "../../components/common/SearchableSelect";
import { PermissionSelector } from "../../components/PermissionSelector";
import { axiosInstance } from "../../api/axios";
import * as yup from "yup";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

interface EditUserFormData {
  name: string;
  email: string;
  phone: string;
  roleId: string;
  regionId?: string; // 🆕 Make optional
  status: string;
  isExternal?: boolean;
}

interface PasswordResetFormData {
  newPassword: string;
  confirmPassword: string;
}

// 🆕 Updated schema with conditional region validation
const editUserSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string().required("Phone is required"),
  roleId: yup.string().required("Role is required"),
  regionId: yup.string().when("$selectedRoleName", {
    is: (roleName: string) => roleName === "Technician",
    then: (schema) => schema.optional(),
    otherwise: (schema) => schema.optional(),
  }),
  status: yup.string().required("Status is required"),
  isExternal: yup.boolean().optional(),
});

const passwordResetSchema = yup.object().shape({
  newPassword: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and number"
    )
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm password"),
});

const EditUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation(); // 🆕 Get location

  // 🆕 Get isSuperAdmin from navigation state
  const isSuperAdminFromState = location.state?.isSuperAdmin || false;

  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<any[]>([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [selectedRoleName, setSelectedRoleName] = useState(""); // 🆕 Track role name
  const [isSuperAdmin, setIsSuperAdmin] = useState(isSuperAdminFromState);

  const [customPermissions, setCustomPermissions] = useState<{
    add: string[];
    remove: string[];
  }>({ add: [], remove: [] });

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
    reset,
  } = useForm<EditUserFormData>({
    resolver: yupResolver(editUserSchema),
    context: { selectedRoleName }, // 🆕 Pass role name to validator
  });

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<PasswordResetFormData>({
    resolver: yupResolver(passwordResetSchema),
  });

  // ✅ Watch role and isExternal
  const selectedRoleId = watch("roleId");
  const isExternalValue = watch("isExternal");

  // ✅ Check if selected role is Technician
  const selectedRole = roles.find((role) => role.id === selectedRoleId);
  const isTechnicianRole = selectedRole?.name === "Technician";

  // 🆕 Update selectedRoleName when role changes
  useEffect(() => {
    const foundRole = roles.find((role) => role.id === selectedRoleId);
    setSelectedRoleName(foundRole?.name || "");
  }, [selectedRoleId, roles]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [userResponse, rolesResponse] = await Promise.all([
        axiosInstance.get(`/users/${id}`),
        axiosInstance.get("/users/assignable-roles"),
      ]);

      reset({
        name: userResponse.data.name,
        email: userResponse.data.email,
        phone: userResponse.data.phone || "",
        roleId: userResponse.data.roleId,
        regionId: userResponse.data.regionId || "",
        status: userResponse.data.status,
        isExternal: userResponse.data.isExternal || false,
      });

      const userIsSuperAdmin = userResponse.data.role?.name === "Super Admin";
      setIsSuperAdmin(userIsSuperAdmin);

      setRoles(rolesResponse.data);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to load user data",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePermissions = async () => {
    try {
      setSaving(true);
      console.log("💾 Saving permissions:", customPermissions);

      const response = await axiosInstance.put(
        `/users/${id}/permissions`,
        customPermissions
      );
      console.log("✅ Permissions saved:", response.data);

      setSnackbar({
        open: true,
        message: "Permissions updated successfully!",
        severity: "success",
      });
    } catch (error: any) {
      console.error("❌ Failed to save permissions:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to save permissions",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = async (data: EditUserFormData) => {
    try {
      // 🆕 Only include isExternal if role is Technician
      const payload = {
        ...data,
        ...(isTechnicianRole && { isExternal: data.isExternal || false }),
      };

      await axiosInstance.put(`/users/${id}`, payload);

      if (
        customPermissions.add.length > 0 ||
        customPermissions.remove.length > 0
      ) {
        await axiosInstance.put(`/users/${id}/permissions`, customPermissions);
      }

      setSnackbar({
        open: true,
        message: "User updated successfully!",
        severity: "success",
      });

      // setTimeout(() => navigate("/users"), 2000);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to update user",
        severity: "error",
      });
    }
  };

  const handlePasswordReset = async (data: PasswordResetFormData) => {
    try {
      setResettingPassword(true);

      await axiosInstance.put(`/users/${id}/reset-password`, {
        newPassword: data.newPassword,
      });

      setSnackbar({
        open: true,
        message: "Password reset successfully!",
        severity: "success",
      });

      resetPasswordForm();
      setShowPassword(false);
      setShowConfirmPassword(false);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to reset password",
        severity: "error",
      });
    } finally {
      setResettingPassword(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Edit User"
        breadcrumbs={[{ label: "Users", path: "/users" }, { label: "Edit" }]}
      />

      <Card>
        <Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)}>
          <Tab label="Basic Information" />
          <Tab label="Security" />
          <Tab label="Permissions" />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
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

              {/* Status */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Status"
                      error={!!errors.status}
                      helperText={errors.status?.message}
                    >
                      <MenuItem value="ACTIVE">Active</MenuItem>
                      <MenuItem value="BLOCKED">Blocked</MenuItem>
                      <MenuItem value="SUSPENDED">Suspended</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              {/* Role */}
              {/* <Grid size={{ xs: 12, md: 6 }}>
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
                      {roles.map((role) => (
                        <MenuItem key={role.id} value={role.id}>
                          {role.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid> */}

              {/* Role - Hide if Super Admin */}
              {!isSuperAdmin && (
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
                        disabled={isSuperAdmin} // Extra safety
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
              )}

              {/* 🆕 Region - Only show if Technician */}
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
                    Update User
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
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={currentTab} index={1}>
          <Box sx={{ maxWidth: 600 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <LockResetIcon color="primary" />
              <Typography variant="h6">Reset Password</Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Set a new password for this user. The password must be at least 8
              characters long and contain uppercase, lowercase, and numbers.
            </Typography>

            <form onSubmit={handlePasswordSubmit(handlePasswordReset)}>
              <Grid container spacing={3}>
                {/* New Password */}
                <Grid size={12}>
                  <Controller
                    name="newPassword"
                    control={passwordControl}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="New Password"
                        type={showPassword ? "text" : "password"}
                        error={!!passwordErrors.newPassword}
                        helperText={passwordErrors.newPassword?.message}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* Confirm Password */}
                <Grid size={12}>
                  <Controller
                    name="confirmPassword"
                    control={passwordControl}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Confirm New Password"
                        type={showConfirmPassword ? "text" : "password"}
                        error={!!passwordErrors.confirmPassword}
                        helperText={passwordErrors.confirmPassword?.message}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                edge="end"
                              >
                                {showConfirmPassword ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* Action Buttons */}
                <Grid size={12}>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="warning"
                      size="large"
                      disabled={resettingPassword}
                      startIcon={<LockResetIcon />}
                    >
                      {resettingPassword ? "Resetting..." : "Reset Password"}
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => {
                        resetPasswordForm();
                        setShowPassword(false);
                        setShowConfirmPassword(false);
                      }}
                    >
                      Clear
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>

            <Divider sx={{ my: 4 }} />

            <Box
              sx={{
                p: 2,
                bgcolor: "warning.lighter",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "warning.main",
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                color="warning.dark"
              >
                ⚠️ Security Notice
              </Typography>
              <Typography variant="caption" color="text.secondary">
                • Passwords are encrypted and cannot be retrieved
                <br />
                • Use strong passwords with mixed characters
                <br />• User will need to use the new password on next login
              </Typography>
            </Box>
          </Box>
        </TabPanel>

        {/* Permissions Tab */}
        <TabPanel value={currentTab} index={2}>
          <PermissionSelector userId={id!} onChange={setCustomPermissions} />
          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSavePermissions}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Permissions"}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/users")}
            >
              Cancel
            </Button>
          </Box>

          <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
            <Typography variant="caption" fontWeight="bold">
              Debug Info:
            </Typography>
            <Typography variant="caption" display="block">
              Added:{" "}
              {customPermissions.add.length > 0
                ? customPermissions.add.join(", ")
                : "None"}
            </Typography>
            <Typography variant="caption" display="block">
              Removed:{" "}
              {customPermissions.remove.length > 0
                ? customPermissions.remove.join(", ")
                : "None"}
            </Typography>
          </Box>
        </TabPanel>
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

export default EditUser;
