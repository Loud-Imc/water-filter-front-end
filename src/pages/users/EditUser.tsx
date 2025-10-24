import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, TextField, Button, MenuItem,  } from '@mui/material';
import { Grid } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchUserById, updateUser, fetchAssignableRoles } from '../../app/slices/userSlice';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import { userSchema } from '../../utils/validators';
import { regionService } from '../../api/services/regionService';
import {type  Region } from '../../types';

interface FormData {
  name: string;
  email: string;
  password?: string;
  roleId: string;
  regionId?: string;
  phone?: string;
}

const EditUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedUser, assignableRoles, loading } = useAppSelector((state) => state.users);

  const [regions, setRegions] = useState<Region[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(userSchema.omit(['password'])),
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchUserById(id));
      dispatch(fetchAssignableRoles());
    }

    const fetchRegions = async () => {
      try {
        const data = await regionService.getAllRegions();
        setRegions(data);
      } catch (error) {
        console.error('Failed to fetch regions:', error);
      }
    };
    fetchRegions();
  }, [id, dispatch]);

  useEffect(() => {
    if (selectedUser) {
      reset({
        name: selectedUser.name,
        email: selectedUser.email,
        roleId: selectedUser.roleId,
        regionId: selectedUser.regionId || '',
        phone: selectedUser.phone || '',
      });
    }
  }, [selectedUser, reset]);

  const onSubmit = async (data: FormData) => {
    if (!id) return;

    try {
      await dispatch(
        updateUser({
          id,
          userData: data,
        })
      ).unwrap();

      setSnackbar({
        open: true,
        message: 'User updated successfully!',
        severity: 'success',
      });

      setTimeout(() => navigate('/users'), 2000);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || 'Failed to update user',
        severity: 'error',
      });
    }
  };

  if (loading || !selectedUser) {
    return <LoadingSpinner />;
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
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
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

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Phone (Optional)"
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                    />
                  )}
                />
              </Grid>

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

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="regionId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Region (Optional)"
                      error={!!errors.regionId}
                      helperText={errors.regionId?.message}
                    >
                      <MenuItem value="">None</MenuItem>
                      {regions.map((region) => (
                        <MenuItem key={region.id} value={region.id}>
                          {region.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

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

export default EditUser;
