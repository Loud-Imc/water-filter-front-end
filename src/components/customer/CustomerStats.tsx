import React from 'react';
import { Card, CardContent, Typography, Box, Stack } from '@mui/material';
import { formatDate } from '../../utils/helpers';

interface CustomerStatsProps {
  statistics: {
    totalServices: number;
    installations: number;
    reInstallations: number;
    services: number;
    complaints: number;
    enquiries: number;
    lastService: string | null;
    completedServices: number;
  };
  sx?: any;
}

const CustomerStats: React.FC<CustomerStatsProps> = ({ statistics, sx }) => {
  const statItems = [
    { label: 'Total Services', value: statistics.totalServices, color: 'primary.main' },
    { label: 'Installations', value: statistics.installations, color: 'info.main' },
    { label: 'Re-Installations', value: statistics.reInstallations, color: 'secondary.main' },
    { label: 'Services', value: statistics.services, color: 'success.main' },
    { label: 'Complaints', value: statistics.complaints, color: 'error.main' },
    { label: 'Enquiries', value: statistics.enquiries, color: 'warning.main' },
  ];

  return (
    <Card sx={sx}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Statistics
        </Typography>

        <Stack spacing={2}>
          {statItems.map((item) => (
            <Box
              key={item.label}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {item.label}
              </Typography>
              <Typography variant="h6" fontWeight={600} sx={{ color: item.color }}>
                {item.value}
              </Typography>
            </Box>
          ))}

          <Box sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Completion Rate
            </Typography>
            <Typography variant="h6" fontWeight={600} color="success.main">
              {statistics.totalServices > 0
                ? Math.round((statistics.completedServices / statistics.totalServices) * 100)
                : 0}
              %
            </Typography>
          </Box>

          {statistics.lastService && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Last Service
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {formatDate(statistics.lastService)}
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default CustomerStats;
