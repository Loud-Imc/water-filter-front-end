import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, TextField, Button, MenuItem,  } from '@mui/material';
import { Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createRequest } from '../../app/slices/requestSlice';
import PageHeader from '../../components/common/PageHeader';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import { serviceRequestSchema } from '../../utils/validators';
import { regionService } from '../../api/services/regionService';
import { customerService } from '../../api/services/customerService';
import type { Region, Customer } from '../../types';

interface FormData {
  type: 'SERVICE' | 'INSTALLATION' | 'COMPLAINT' | 'ENQUIRY';
  description: string;
  customerId: string;
  regionId: string;
}

const CreateServiceRequest: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [regions, setRegions] = useState<Region[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(serviceRequestSchema),
    defaultValues: {
      type: 'SERVICE',
      description: '',
      customerId: '',
      regionId: '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [regionsData, customersData] = await Promise.all([
          regionService.getAllRegions(),
          customerService.getAllCustomers(),
        ]);
        setRegions(regionsData);
        setCustomers(customersData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      await dispatch(
        createRequest({
          ...data,
          requestedById: user!.id,
        })
      ).unwrap();

      setSnackbar({
        open: true,
        message: 'Service request created successfully!',
        severity: 'success',
      });

      setTimeout(() => navigate('/service-requests'), 2000);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || 'Failed to create request',
        severity: 'error',
      });
    }
  };

  return (
    <Box>
      <PageHeader
        title="Create Service Request"
        breadcrumbs={[
          { label: 'Service Requests', path: '/service-requests' },
          { label: 'Create' },
        ]}
      />

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Request Type"
                      error={!!errors.type}
                      helperText={errors.type?.message}
                    >
                      <MenuItem value="SERVICE">Service</MenuItem>
                      <MenuItem value="INSTALLATION">Installation</MenuItem>
                      <MenuItem value="COMPLAINT">Complaint</MenuItem>
                      {/* <MenuItem value="ENQUIRY">Enquiry</MenuItem> */}

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
                      label="Region"
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

              <Grid size={12}>
                <Controller
                  name="customerId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Customer"
                      error={!!errors.customerId}
                      helperText={errors.customerId?.message}
                    >
                      {customers.map((customer) => (
                        <MenuItem key={customer.id} value={customer.id}>
                          {customer.name} - {customer.address}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={4}
                      label="Description"
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button type="submit" variant="contained" size="large">
                    Create Request
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/service-requests')}
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

export default CreateServiceRequest;
