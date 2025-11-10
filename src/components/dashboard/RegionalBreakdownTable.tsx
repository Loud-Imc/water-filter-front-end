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
import type { RegionalBreakdown } from '../../types';

interface Props {
  data: RegionalBreakdown[];
}

const RegionalBreakdownTable: React.FC<Props> = ({ data }) => {
  if (data.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        No regional data available
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Region</strong></TableCell>
            <TableCell align="right"><strong>Total Requests</strong></TableCell>
            <TableCell align="right"><strong>Completed</strong></TableCell>
            <TableCell align="right"><strong>Completion Rate</strong></TableCell>
            <TableCell align="right"><strong>Customers</strong></TableCell>
            <TableCell align="right"><strong>Technicians</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((region) => (
            <TableRow key={region.regionId} hover>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {region.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {region.district} • {region.city}
                </Typography>
              </TableCell>
              <TableCell align="right">{region.totalRequests}</TableCell>
              <TableCell align="right">{region.completedRequests}</TableCell>
              <TableCell align="right">
                <Chip
                  label={`${region.completionRate}%`}
                  color={parseFloat(region.completionRate) >= 70 ? 'success' : 'warning'}
                  size="small"
                />
              </TableCell>
              <TableCell align="right">{region.totalCustomers}</TableCell>
              <TableCell align="right">{region.totalTechnicians}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RegionalBreakdownTable;
