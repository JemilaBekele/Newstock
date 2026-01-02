// stores/auth.store.ts
import { create } from 'zustand';
import { persist, PersistStorage } from 'zustand/middleware';

interface PermissionState {
  permissions: string[];
  _hasHydrated: boolean;
  _isInitialized: boolean; // Track if initialized from server
  setPermissions: (permissions: string[]) => void;
  clearPermissions: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  initializeFromSession: (sessionPermissions: string[]) => void;
  setHasHydrated: (state: boolean) => void;
  setIsInitialized: (state: boolean) => void;
}

// Custom storage to handle SSR/CSR mismatch
const storage: PersistStorage<PermissionState> = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = localStorage.getItem(name);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(name, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(name);
  }
};

export const usePermissionStore = create<PermissionState>()(
  persist(
    (set, get) => ({
      permissions: [],
      _hasHydrated: false,
      _isInitialized: false,
      
      setPermissions: (permissions) => {
        set({ permissions, _isInitialized: true });
      },
      
      clearPermissions: () => {
        set({ permissions: [], _isInitialized: false });
      },
      
      hasPermission: (permission) => {
        // Wait for both hydration and initialization
        if (!get()._hasHydrated || !get()._isInitialized) return false;
        return get().permissions.includes(permission);
      },
      
      hasAnyPermission: (permissions) => {
        if (!get()._hasHydrated || !get()._isInitialized) return false;
        return permissions.some((perm) =>
          get().permissions.includes(perm)
        );
      },
      
      hasAllPermissions: (permissions) => {
        if (!get()._hasHydrated || !get()._isInitialized) return false;
        return permissions.every((perm) =>
          get().permissions.includes(perm)
        );
      },
      
      initializeFromSession: (sessionPermissions) => {
        if (sessionPermissions && sessionPermissions.length > 0) {
          const current = get().permissions;
          if (JSON.stringify(current) !== JSON.stringify(sessionPermissions)) {
            set({ 
              permissions: sessionPermissions,
              _isInitialized: true 
            });
          }
        }
      },
      
      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },
      
      setIsInitialized: (state) => {
        set({ _isInitialized: state });
      }
    }),
    {
      name: 'permission-storage',
      storage,
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            // Mark as hydrated first
            state.setHasHydrated(true);
            
            // Reset initialization flag on rehydration
            // This prevents using stale permissions from localStorage
            state.setIsInitialized(false);
          }
        };
      }
    }
  )
);

// Hook to check if store is fully ready
export const useStoreHydration = () => {
  return usePermissionStore((state) => state._hasHydrated);
};

// Hook to check if permissions are fully initialized
export const usePermissionsReady = () => {
  const hasHydrated = usePermissionStore((state) => state._hasHydrated);
  const isInitialized = usePermissionStore((state) => state._isInitialized);
  const permissions = usePermissionStore((state) => state.permissions);
  
  return hasHydrated && isInitialized;
};

// Hook to get safe permissions (empty array if not ready)
export const useSafePermissions = () => {
  const hasHydrated = usePermissionStore((state) => state._hasHydrated);
  const isInitialized = usePermissionStore((state) => state._isInitialized);
  const permissions = usePermissionStore((state) => state.permissions);
  
  if (!hasHydrated || !isInitialized) {
    return [];
  }
  
  return permissions;
};