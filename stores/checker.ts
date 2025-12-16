// utils/permissions.ts
import { usePermissionStore } from '@/stores/auth.store';

// This version can be used outside React components
export const checkPermissions = (
  permissions: string[],
  mode: 'all' | 'any' = 'any'
): boolean => {
  // Note: This assumes the permission store can be accessed directly
  // In a real app, you might need to pass the current permissions as a parameter
  const { hasAnyPermission, hasAllPermissions } = usePermissionStore.getState();

  if (!permissions || permissions.length === 0) return true;

  return mode === 'all'
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);
};

// React hook version
export const useCheckPermissions = (
  requiredPermission?: string,
  requiredPermissions?: string[],
  mode: 'all' | 'any' = 'any'
): boolean => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } =
    usePermissionStore();

  if (!requiredPermission && !requiredPermissions) return true;

  if (requiredPermission) {
    return hasPermission(requiredPermission);
  }

  if (requiredPermissions) {
    return mode === 'all'
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);
  }

  return false;
};
