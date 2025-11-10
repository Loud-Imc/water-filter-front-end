import React from 'react';
import { Box, Card, CardContent, Typography, Grid, LinearProgress } from '@mui/material';
import type { ServiceRequestsReport } from '../../types';

interface Props {
  data: ServiceRequestsReport;
}

const ServiceRequestsChart: React.FC<Props> = ({ data }) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Grid container spacing={3}>
          {/* Summary Stats */}
          <Grid size={{ xs: 12, md: 3, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Total Requests
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {data.total}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 3, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Completion Rate
            </Typography>
            <Typography variant="h4" fontWeight={700} color="success.main">
              {data.completionRate}%
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 3, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Avg Completion Time
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {data.avgCompletionTimeDays} days
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 3, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Request Types
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {data.byType.length}
            </Typography>
          </Grid>

          {/* By Status Breakdown */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Requests by Status
            </Typography>
            {data.byStatus.map((item) => (
              <Box key={item.status} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{item.status.replace(/_/g, ' ')}</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {item.count} ({item.percentage}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={parseFloat(item.percentage)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            ))}
          </Grid>

          {/* By Type Breakdown */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Requests by Type
            </Typography>
            {data.byType.map((item) => (
              <Box key={item.type} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{item.type}</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {item.count} ({item.percentage}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={parseFloat(item.percentage)}
                  color="secondary"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            ))}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ServiceRequestsChart;
