import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Tabs,
  Tab,
  Typography,
} from '@mui/material';
import { Grid } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import PageHeader from '../../components/common/PageHeader';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import { SearchableSelect } from '../../components/common/SearchableSelect';
import { PermissionSelector } from '../../components/PermissionSelector';
import { axiosInstance } from '../../api/axios';
import * as yup from 'yup';

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
  regionId?: string;
  status?: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED';
}


// interface FormData {
//    name: string;
//   email: string;
//   password?: string;
//   roleId: string;
//   regionId?: string | null;
//   phone?: string | null;
// }

const editUserSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone is required'),
  roleId: yup.string().required('Role is required'),
  regionId: yup.string().required('Region is required'),
  status: yup.string().required('Status is required'),
});

const EditUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<any[]>([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [customPermissions, setCustomPermissions] = useState<{
    add: string[];
    remove: string[];
  }>({ add: [], remove: [] });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as any,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditUserFormData>({
    resolver: yupResolver(editUserSchema),
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [userResponse, rolesResponse] = await Promise.all([
        axiosInstance.get(`/users/${id}`),
        axiosInstance.get('/users/assignable-roles'),
      ]);

      reset({
        name: userResponse.data.name,
        email: userResponse.data.email,
        phone: userResponse.data.phone || '',
        roleId: userResponse.data.roleId,
        regionId: userResponse.data.regionId || '',
        status: userResponse.data.status,
      });

      setRoles(rolesResponse.data);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to load user data',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

    const handleSavePermissions = async () => {
    try {
      setSaving(true);
      console.log('💾 Saving permissions:', customPermissions);

      // Check if there are changes
      // if (customPermissions.add.length === 0 && customPermissions.remove.length === 0) {
      //   setSnackbar({
      //     open: true,
      //     message: 'No permission changes to save',
      //     severity: 'info',
      //   });
      //   return;
      // }

      // Save permissions
      const response = await axiosInstance.put(`/users/${id}/permissions`, customPermissions);
      console.log('✅ Permissions saved:', response.data);

      setSnackbar({
        open: true,
        message: 'Permissions updated successfully!',
        severity: 'success',
      });

      // Optionally navigate back or refresh
      // setTimeout(() => navigate('/users'), 2000);
    } catch (error: any) {
      console.error('❌ Failed to save permissions:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to save permissions',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = async (data: EditUserFormData) => {
    try {
      // Update basic info
      await axiosInstance.put(`/users/${id}`, data);

      // Update permissions if changed
      if (customPermissions.add.length > 0 || customPermissions.remove.length > 0) {
        await axiosInstance.put(`/users/${id}/permissions`, customPermissions);
      }

      setSnackbar({
        open: true,
        message: 'User updated successfully!',
        severity: 'success',
      });

      setTimeout(() => navigate('/users'), 2000);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update user',
        severity: 'error',
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Edit User"
        breadcrumbs={[
          { label: 'Users', path: '/users' },
          { label: 'Edit' },
        ]}
      />

      <Card>
        <Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)}>
          <Tab label="Basic Information" />
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
                      {roles.map((role) => (
                        <MenuItem key={role.id} value={role.id}>
                          {role.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              {/* Region */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="regionId"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      label="Select Region"
                      value={field.value}
                      onChange={field.onChange}
                      endpoint="/regions"
                      placeholder="Search region..."
                      error={!!errors.regionId}
                      helperText={errors.regionId?.message}
                    />
                  )}
                />
              </Grid>

              {/* Action Buttons */}
              <Grid size={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button type="submit" variant="contained" size="large">
                    Update User
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/users')}
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <PermissionSelector
            userId={id!}
            onChange={setCustomPermissions}
          />
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSavePermissions}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Permissions'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/users')}
            >
              Cancel
            </Button>
          </Box>

           <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" fontWeight="bold">Debug Info:</Typography>
            <Typography variant="caption" display="block">
              Added: {customPermissions.add.length > 0 ? customPermissions.add.join(', ') : 'None'}
            </Typography>
            <Typography variant="caption" display="block">
              Removed: {customPermissions.remove.length > 0 ? customPermissions.remove.join(', ') : 'None'}
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
