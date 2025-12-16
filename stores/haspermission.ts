// utils/navigation.ts
import { NavItem } from '@/types';
import { checkPermissions } from './checker';

export const filterNavItems = (navItems: NavItem[]): NavItem[] => {
  return navItems.filter((item) => {
    // Get all permissions to check (single or multiple)
    const permissionsToCheck = [];
    if (item.permission) permissionsToCheck.push(item.permission);
    if (item.permissions) permissionsToCheck.push(...item.permissions);

    // Check permissions
    const hasAccess = checkPermissions(
      permissionsToCheck,
      item.permissionMode || 'any'
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
