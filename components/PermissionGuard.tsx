// components/PermissionGuard.tsx
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCheckPermissions } from '@/stores/checker';
import { usePermissionStore } from '@/stores/auth.store';

interface PermissionGuardProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[];
  mode?: 'all' | 'any';
  redirectTo?: string;
  hideInsteadOfRedirect?: boolean;
}

export const PermissionGuard = ({
  children,
  requiredPermission,
  requiredPermissions,
  mode = 'any',
  hideInsteadOfRedirect = false
}: PermissionGuardProps) => {
  const hasAccess = useCheckPermissions(
    requiredPermission,
    requiredPermissions,
    mode
  );
  const router = useRouter();
  // No need for checked state or effect; render directly based on hasAccess
  return hasAccess ? <>{children}</> : null;
};

// Standalone permission check function for non-React contexts
PermissionGuard.check = (
  requiredPermission?: string,
  requiredPermissions?: string[],
  mode: 'all' | 'any' = 'any'
): boolean => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } =
    usePermissionStore.getState();

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
