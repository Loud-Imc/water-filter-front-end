import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, TextField, Button, MenuItem,  } from '@mui/material';
import { Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createUser, fetchAssignableRoles } from '../../app/slices/userSlice';
import PageHeader from '../../components/common/PageHeader';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import { userSchema } from '../../utils/validators';
import { regionService } from '../../api/services/regionService';
import { type Region } from '../../types';

interface FormData {
  name: string;
  email: string;
  password: string;
  roleId: string;
  regionId: string ;
  phone: string ;
}

const CreateUser: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { assignableRoles } = useAppSelector((state) => state.users);
  const { user } = useAppSelector((state) => state.auth);

  const [regions, setRegions] = useState<Region[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      roleId: '',
      regionId: '',
      phone: '',
    },
  });

  useEffect(() => {
    dispatch(fetchAssignableRoles());
    
    const fetchRegions = async () => {
      try {
        const data = await regionService.getAllRegions();
        setRegions(data);
      } catch (error) {
        console.error('Failed to fetch regions:', error);
      }
    };
    fetchRegions();
  }, [dispatch]);

    const onSubmit = async (data: FormData) => {
      try {
        await dispatch(
          createUser({
            ...data,
            createdById: user!.id,
          })
        ).unwrap();

        setSnackbar({
        open: true,
        message: 'User created successfully!',
        severity: 'success',
      });

      setTimeout(() => navigate('/users'), 2000);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || 'Failed to create user',
        severity: 'error',
      });
    }
  };

  return (
    <Box>
      <PageHeader
        title="Create User"
        breadcrumbs={[
          { label: 'Users', path: '/users' },
          { label: 'Create' },
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
                      autoFocus
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

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Phone "
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
                      label="Region "
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
                    Create User
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

export default CreateUser;
