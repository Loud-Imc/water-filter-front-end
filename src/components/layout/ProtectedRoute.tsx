import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { usePermission } from '../../hooks/usePermission';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // Optional - for backward compatibility
  requiredPermissions?: string[]; // NEW - permission-based access
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  requiredPermissions,
}) => {
  const { isAuthenticated, user, loading } = useAppSelector((state) => state.auth);
  const { hasAnyPermission } = usePermission();

  if (loading) {
    return <LoadingSpinner fullScreen message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ✅ NEW: Check permissions first (if specified)
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasPermission = hasAnyPermission(requiredPermissions);
    
    if (!hasPermission) {
      console.log('❌ Access denied - Missing permission:', requiredPermissions);
      return <Navigate to="/unauthorized" replace />;
    }
    
    // Has permission, allow access
    return <>{children}</>;
  }

  // ✅ Fallback: Check role-based access (backward compatibility)
  if (allowedRoles && user) {
    const hasRole = allowedRoles.includes(user.role.name);
    
    if (!hasRole) {
      console.log('❌ Access denied - Wrong role:', user.role.name);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
