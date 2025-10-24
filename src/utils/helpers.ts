import { RequestStatus } from '../types';

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export const getStatusBadgeColor = (
  status: RequestStatus
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case 'DRAFT':
      return 'default';
    case 'PENDING_APPROVAL':
      return 'warning';
    case 'APPROVED':
      return 'success';
    case 'ASSIGNED':
      return 'info';
    case 'IN_PROGRESS':
      return 'primary';
    case 'WORK_COMPLETED':
      return 'success';
    case 'COMPLETED':
      return 'success';
    case 'REJECTED':
      return 'error';
    default:
      return 'default';
  }
};

export const canApproveRequest = (userRole: string, requestCreatorRole: string): boolean => {
  const salesRoles = ['Salesman', 'Sales Team Lead', 'Sales Manager'];
  const approverRoles = ['Super Admin', 'Service Admin', 'Service Manager', 'Service Team Lead'];

  // If created by sales, needs sales admin approval first
  if (salesRoles.includes(requestCreatorRole)) {
    return userRole === 'Sales Admin' || userRole === 'Super Admin';
  }

  return approverRoles.includes(userRole);
};

export const canAssignTechnician = (userRole: string): boolean => {
  return ['Super Admin', 'Service Admin', 'Service Manager'].includes(userRole);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
