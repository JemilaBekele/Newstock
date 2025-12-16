// utils/navigation.ts
import { PermissionGuard } from '@/components/PermissionGuard';
import { NavItem } from '@/types';

export const filterNavItems = (navItems: NavItem[]): NavItem[] => {
  return navItems.filter((item) => {
    // Check permissions using the PermissionGuard's static check method
    const hasAccess = PermissionGuard.check(
      item.permission,
      item.permissions,
      item.permissionMode
    );

    // If no access, filter out this item
    if (!hasAccess) return false;

    // If item has children, filter them too
    if (item.items && item.items.length > 0) {
      item.items = filterNavItems(item.items);

      // If after filtering there are no children, hide parent if it has no direct link
      if (item.items.length === 0 && !item.url) return false;
    }

    return true;
  });
};
