// components/auth/PermissionInitializer.tsx
'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePermissionStore } from '@/stores/auth.store';

export default function PermissionInitializer() {
  const { data: session, status } = useSession();
  const initializeFromSession = usePermissionStore((state) => 
    state.initializeFromSession
  );
  const clearPermissions = usePermissionStore((state) => state.clearPermissions);
  const setHasHydrated = usePermissionStore((state) => state.setHasHydrated);

  useEffect(() => {
    // Mark store as hydrated once on client side
    setHasHydrated(true);
  }, [setHasHydrated]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.permissions) {
      // Initialize permissions from session
      initializeFromSession(session.user.permissions);
    } else if (status === 'unauthenticated') {
      // Clear permissions when user logs out
      clearPermissions();
    }
  }, [session, status, initializeFromSession, clearPermissions]);

  return null;
}