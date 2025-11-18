import { useAppSelector } from '../app/hooks';

export const usePermission = () => {
  const permissions = useAppSelector((state) => state.auth.permissions);

  // console.log('🔑 User permissions from state:', permissions);
  const user = useAppSelector((state) => state.auth.user);

  // Check if user has a specific permission
  const hasPermission = (permission: string): boolean => {
    // Super Admin has all permissions
    if (user?.role?.name === 'Super Admin') {
      return true;
    }
    
    return permissions.includes(permission);
  };

  // Check if user has ANY of the permissions
  const hasAnyPermission = (permissionList: string[]): boolean => {
    if (user?.role?.name === 'Super Admin') {
      return true;
    }
    
    return permissionList.some((perm) => permissions.includes(perm));
  };

  // Check if user has ALL of the permissions
  const hasAllPermissions = (permissionList: string[]): boolean => {
    if (user?.role?.name === 'Super Admin') {
      return true;
    }
    
    return permissionList.every((perm) => permissions.includes(perm));
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};
