import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
} from '@mui/material';
import type { TechnicianPerformance } from '../../types';

interface Props {
  data: TechnicianPerformance[];
}

const TechnicianPerformanceTable: React.FC<Props> = ({ data }) => {
  const getCompletionRateColor = (rate: string) => {
    const rateNum = parseFloat(rate);
    if (rateNum >= 80) return 'success';
    if (rateNum >= 60) return 'warning';
    return 'error';
  };

  if (data.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        No technician data available for this period
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Technician</strong></TableCell>
            <TableCell><strong>Region</strong></TableCell>
            <TableCell align="right"><strong>Assigned</strong></TableCell>
            <TableCell align="right"><strong>Completed</strong></TableCell>
            <TableCell align="right"><strong>In Progress</strong></TableCell>
            <TableCell align="right"><strong>Completion Rate</strong></TableCell>
            <TableCell align="right"><strong>Avg Work Time</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((tech) => (
            <TableRow key={tech.technicianId} hover>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {tech.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {tech.email}
                </Typography>
              </TableCell>
              <TableCell>{tech.region}</TableCell>
              <TableCell align="right">{tech.assigned}</TableCell>
              <TableCell align="right">{tech.completed}</TableCell>
              <TableCell align="right">{tech.inProgress}</TableCell>
              <TableCell align="right">
                <Chip
                  label={`${tech.completionRate}%`}
                  color={getCompletionRateColor(tech.completionRate)}
                  size="small"
                />
              </TableCell>
              <TableCell align="right">{tech.avgWorkDurationHours}h</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TechnicianPerformanceTable;
