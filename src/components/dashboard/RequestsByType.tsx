import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Stack,
} from '@mui/material';

interface RequestsByTypeProps {
  data: Array<{ type: string; count: number }>;
}

const RequestsByType: React.FC<RequestsByTypeProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  const typeColors: Record<string, string> = {
    INSTALLATION: '#1976d2',
    SERVICE: '#2e7d32',
    COMPLAINT: '#d32f2f',
    ENQUIRY: '#ed6c02',
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Requests by Type
        </Typography>

        {data.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No data available
            </Typography>
          </Box>
        ) : (
          <Stack spacing={3} sx={{ mt: 2 }}>
            {data.map((item) => {
              const percentage = total > 0 ? (item.count / total) * 100 : 0;
              
              return (
                <Box key={item.type}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" fontWeight={500}>
                      {item.type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.count} ({percentage.toFixed(1)}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'action.hover',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: typeColors[item.type] || 'primary.main',
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default RequestsByType;
