import React, { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, MenuItem, Typography } from '@mui/material';
import { Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createRequest } from '../../app/slices/requestSlice';
import PageHeader from '../../components/common/PageHeader';
import SnackbarNotification from '../../components/common/SnackbarNotification';
import { SearchableSelect } from '../../components/common/SearchableSelect';
import { serviceRequestSchema } from '../../utils/validators';

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

  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as any 
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(serviceRequestSchema),
    defaultValues: {
      type: 'SERVICE',
      description: '',
      customerId: '',
      regionId: '',
    },
  });

  // Watch regionId to filter customers by region
  const selectedRegionId = watch('regionId');

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
              {/* Request Type */}
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
                    </TextField>
                  )}
                />
              </Grid>

              {/* Region Selection - Searchable */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="regionId"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      label="Select Region"
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        // Reset customer when region changes
                        setValue('customerId', '');
                      }}
                      endpoint="/regions/search"
                      placeholder="Search region..."
                      error={!!errors.regionId}
                      helperText={errors.regionId?.message}
                      renderOption={(option: any) => (
                        <Box>
                          <Typography variant="body1">{option.name}</Typography>
                          {option._count && (
                            <Typography variant="caption" color="text.secondary">
                              {option._count.customers} customers • {option._count.technicians} technicians
                            </Typography>
                          )}
                        </Box>
                      )}
                    />
                  )}
                />
              </Grid>

              {/* Customer Selection - Searchable & Filtered by Region */}
              <Grid size={12}>
                <Controller
                  name="customerId"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      label="Select Customer"
                      value={field.value}
                      onChange={field.onChange}
                      endpoint="/customers/search"
                      placeholder="Search by name, phone, or email..."
                      error={!!errors.customerId}
                      helperText={errors.customerId?.message || 'Type at least 2 characters to search'}
                      filters={{ regionId: selectedRegionId }}
                      disabled={!selectedRegionId}
                      renderOption={(option: any) => (
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            {option.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {option.primaryPhone}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.address}
                          </Typography>
                        </Box>
                      )}
                    />
                  )}
                />
              </Grid>

              {/* Description */}
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
                      placeholder="Provide detailed description of the request..."
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Grid>

              {/* Action Buttons */}
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
