import React from 'react';
import { usePermission } from '../hooks/usePermission';
import { Box, Tooltip } from '@mui/material';

interface PermissionGateProps {
  permission: string | string[];
  fallback?: React.ReactNode;
  showMessage?: boolean;
  children: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  fallback = null,
  showMessage = false,
  children,
}) => {
  const { hasPermission, hasAnyPermission } = usePermission();

  const hasAccess = Array.isArray(permission)
    ? hasAnyPermission(permission)
    : hasPermission(permission);

  if (!hasAccess) {
    if (showMessage) {
      return (
        <Tooltip title="You don't have permission for this action">
          <Box sx={{ opacity: 0.5, cursor: 'not-allowed' }}>
            {children}
          </Box>
        </Tooltip>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
