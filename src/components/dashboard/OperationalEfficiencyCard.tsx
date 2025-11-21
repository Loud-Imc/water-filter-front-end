import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Alert,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type { OperationalEfficiency } from '../../types';

interface OperationalEfficiencyCardProps {
  data: OperationalEfficiency;
}

const OperationalEfficiencyCard: React.FC<OperationalEfficiencyCardProps> = ({ data }) => {
  const getAgeRangeColor = (ageRange: string) => {
    if (ageRange.includes('0-7')) return 'success';
    if (ageRange.includes('8-14')) return 'info';
    if (ageRange.includes('15-30')) return 'warning';
    return 'error';
  };

  const getAgeRangeIcon = (ageRange: string) => {
    if (ageRange.includes('30+')) return '🔴';
    if (ageRange.includes('15-30')) return '🟠';
    if (ageRange.includes('8-14')) return '⚠️';
    return '✅';
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SpeedIcon sx={{ fontSize: 28, mr: 1.5, color: 'info.main' }} />
          <Typography variant="h6" fontWeight={600}>
            Operational Efficiency
          </Typography>
        </Box>

        {/* Backlog Alert */}
        <Alert
          severity={data.backlogCount > 50 ? 'error' : data.backlogCount > 20 ? 'warning' : 'info'}
          icon={<WarningAmberIcon />}
          sx={{ mb: 3 }}
        >
          <Typography variant="body2" fontWeight={600}>
            Current Backlog: {data.backlogCount} requests
          </Typography>
          <Typography variant="caption">
            {data.backlogCount > 50
              ? 'High backlog - immediate action required'
              : data.backlogCount > 20
              ? 'Moderate backlog - monitor closely'
              : 'Backlog under control'}
          </Typography>
        </Alert>

        {/* Aging Analysis */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            📅 Aging Analysis
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            Pending requests by age
          </Typography>

          <Table size="small">
            <TableBody>
              {data.agingRequests.map((aging, index) => (
                <TableRow
                  key={index}
                  sx={{
                    '&:last-child td': { border: 0 },
                    bgcolor: index % 2 === 0 ? 'grey.50' : 'white',
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{getAgeRangeIcon(aging.ageRange)}</span>
                      <Typography variant="body2">{aging.ageRange}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={aging.count}
                      color={getAgeRangeColor(aging.ageRange)}
                      size="small"
                      sx={{ fontWeight: 600, minWidth: 50 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {data.agingRequests.every((a) => a.count === 0) && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: 'center', py: 3 }}
            >
              No pending requests
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default OperationalEfficiencyCard;
