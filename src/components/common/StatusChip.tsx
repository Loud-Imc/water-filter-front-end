// components/common/StatusChip.tsx
import React from 'react';
import { Chip } from '@mui/material';
import type { RequestStatus, RequestType } from '../../types';

interface StatusChipProps {
  status: RequestStatus;
  requestType?: RequestType; // ✅ NEW: Optional request type
  size?: 'small' | 'medium';
}

const StatusChip: React.FC<StatusChipProps> = ({ 
  status, 
  requestType,
  size = 'small' 
}) => {
  // ✅ Special handling for ENQUIRY type
  if (requestType === 'ENQUIRY') {
    return (
      <Chip
        label="Enquiry"
        size={size}
        sx={{
          bgcolor: 'gray',
          color: 'white',
          fontWeight: 600,
          border: '1px solid',
          borderColor: 'info.main',
        }}
      />
    );
  }

  // Regular status colors for other types
  const getStatusColor = () => {
    switch (status) {
      case 'DRAFT':
        return { bg: 'grey.200', color: 'grey.800', border: 'grey.400' };
      case 'PENDING_APPROVAL':
        return { bg: 'warning.light', color: 'warning.dark', border: 'warning.main' };
      case 'APPROVED':
        return { bg: 'info.light', color: 'info.dark', border: 'info.main' };
      case 'ASSIGNED':
        return { bg: 'primary.light', color: 'primary.dark', border: 'primary.main' };
      case 'IN_PROGRESS':
        return { bg: 'secondary.light', color: 'secondary.dark', border: 'secondary.main' };
      case 'WORK_COMPLETED':
        return { bg: '#039688ff', color: 'success.dark', border: 'success.main' };
      case 'COMPLETED':
        return { bg: 'success.main', color: 'white', border: 'success.dark' };
      case 'REJECTED':
        return { bg: 'error.light', color: 'error.dark', border: 'error.main' };
      default:
        return { bg: 'grey.200', color: 'grey.800', border: 'grey.400' };
    }
  };

  const colors = getStatusColor();
  const label = status.replace(/_/g, ' ').toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <Chip
      label={label}
      size={size}
      sx={{
        bgcolor: colors.bg,
        color: 'white',
        fontWeight: 600,
        border: '1px solid',
        borderColor: colors.border,
      }}
    />
  );
};

export default StatusChip;
