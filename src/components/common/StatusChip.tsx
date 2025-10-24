import React from 'react';
import { Chip } from '@mui/material';
import { type RequestStatus } from '../../types';
import { getStatusBadgeColor } from '../../utils/helpers';

interface StatusChipProps {
  status: RequestStatus;
  size?: 'small' | 'medium';
}

const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'small' }) => {
  const color = getStatusBadgeColor(status);
  const label = status.replace(/_/g, ' ');

  return <Chip label={label} color={color} size={size} />;
};

export default StatusChip;
