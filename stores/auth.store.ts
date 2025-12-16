// stores/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PermissionState {
  permissions: string[];
  setPermissions: (permissions: string[]) => void;
  clearPermissions: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  initializeFromSession: (sessionPermissions: string[]) => void;
}

export const usePermissionStore = create<PermissionState>()(
  persist(
    (set, get) => ({
      permissions: [],
      setPermissions: (permissions) => {
        set({ permissions });
      },
      clearPermissions: () => {
        set({ permissions: [] });
      },
      hasPermission: (permission) => {
        const hasPerm = get().permissions.includes(permission);

        return hasPerm;
      },
      hasAnyPermission: (permissions) => {
        const result = permissions.some((perm) =>
          get().permissions.includes(perm)
        );
        return result;
      },
      hasAllPermissions: (permissions) => {
        const result = permissions.every((perm) =>
          get().permissions.includes(perm)
        );
        return result;
      },
      initializeFromSession: (sessionPermissions) => {
        if (sessionPermissions && sessionPermissions.length > 0) {
          const current = get().permissions;
          if (JSON.stringify(current) !== JSON.stringify(sessionPermissions)) {
            set({ permissions: sessionPermissions });
          }
        }
      }
    }),
    {
      name: 'permission-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
        }
      }
    }
  )
);
