'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { IRole, IPermission } from '@/service/roleService';
import {
  getRoleById,
  getPermission,
  updateRolePermissionsService
} from '@/service/roleService';
import { PERMISSIONS } from '@/stores/permissions';

type FormValues = {
  roleId: string;
  roleName?: string;
  permissions: Record<string, boolean>;
};

export default function EditRolePermissionForm() {
  const router = useRouter();
  const params = useParams();
  const roleId = params.id as string;
  const [role, setRole] = useState<IRole | null>(null);
  const [allPermissions, setAllPermissions] = useState<IPermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});
  const [pageTitle, setPageTitle] = useState('Edit Role Permissions');

  const form = useForm<FormValues>({
    defaultValues: {
      roleId: '',
      roleName: '',
      permissions: {}
    }
  });

  useEffect(() => {
    const loadData = async () => {
      if (!roleId) {
        toast.error('Role ID is required');
        router.push('/dashboard/Role');
        return;
      }

      try {
        setIsLoading(true);

        // Load role details with permissions
        const roleData = await getRoleById(roleId);
        setRole(roleData);

        // Set page title from role name
        if (roleData.name) {
          setPageTitle(`Edit Permissions for "${roleData.name}" Role`);
        }

        // Load all permissions
        const permissionsData = await getPermission();
        setAllPermissions(permissionsData || []);

        // Set form values
        form.setValue('roleId', roleData.id);
        form.setValue('roleName', roleData.name);

        // Initialize permissions checkboxes based on existing role permissions
        const initialPermissions: Record<string, boolean> = {};

        // If role has permissions, mark them as checked
        if (roleData.permissions && Array.isArray(roleData.permissions)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          roleData.permissions.forEach((perm: any) => {
            // Handle both direct permission object and nested permission structure
            const permissionId = perm.id || perm.permissionId;
            initialPermissions[permissionId] = true;
          });
        }

        form.setValue('permissions', initialPermissions);

        // Initialize expanded categories
        const initialExpanded: Record<string, boolean> = {};
        Object.keys(PERMISSIONS).forEach((category) => {
          initialExpanded[category] = true; // Expanded by default for better UX
        });
        setExpandedCategories(initialExpanded);
      } catch  {
        toast.error('Failed to load role or permissions.');
      } finally {
        setIsLoading(false);
      }
    };

    if (roleId) {
      loadData();
    }
  }, [roleId, form, router]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleSelectAll = (category: string, select: boolean) => {
    const categoryPermissions = groupedPermissions[category];
    if (!categoryPermissions) return;

    const currentPermissions = form.getValues('permissions');
    const newPermissions = { ...currentPermissions };

    categoryPermissions.forEach((perm) => {
      newPermissions[perm.id] = select;
    });

    form.setValue('permissions', newPermissions);
  };

  const onSubmit = async (values: FormValues) => {
    if (!values.roleId) {
      toast.error('Role ID is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedPermissions = Object.entries(values.permissions)
        .filter(([, isSelected]) => isSelected)
        .map(([permissionId]) => permissionId);

      await updateRolePermissionsService({
        roleId: values.roleId,
        permissionIds: selectedPermissions
      });

      toast.success('Permissions updated successfully');
      router.push('/dashboard/Role');
      router.refresh();
    } catch  {
      toast.error('Error updating permissions');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group permissions by category
  const groupedPermissions: Record<string, IPermission[]> = {};
  Object.keys(PERMISSIONS).forEach((category) => {
    groupedPermissions[category] = allPermissions.filter((perm) =>
      Object.values(PERMISSIONS[category as keyof typeof PERMISSIONS]).some(
        (p) => (typeof p === 'string' ? p === perm.name : p.name === perm.name)
      )
    );
  });

  // Calculate checked permissions count by category
  const getCategoryCheckedCount = (category: string) => {
    const categoryPermissions = groupedPermissions[category];
    if (!categoryPermissions) return 0;

    const permissions = form.watch('permissions');
    return categoryPermissions.filter((perm) => permissions[perm.id]).length;
  };

  // Format permission name for display
  const formatPermissionName = (name: string) => {
    return name
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  if (isLoading) {
    return (
      <Card className='mx-auto w-full'>
        <CardContent className='flex h-64 items-center justify-center'>
          <p>Loading role data...</p>
        </CardContent>
      </Card>
    );
  }

  if (!role) {
    return (
      <Card className='mx-auto w-full'>
        <CardContent className='flex h-64 items-center justify-center'>
          <p>Role not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-center text-xl font-bold'>
          {pageTitle}
        </CardTitle>
        <p className='text-muted-foreground text-center text-sm'>
          Editing permissions for role:{' '}
          <span className='font-semibold'>{role.name}</span>
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* Role Information (Read-only) */}
            <div className='bg-muted/50 space-y-4 rounded-lg border p-4'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <FormItem>
                  <FormLabel>Role Name</FormLabel>
                  <FormControl>
                    <Input
                      value={role.name}
                      disabled
                      className='bg-background'
                    />
                  </FormControl>
                </FormItem>
              </div>
            </div>

            {/* Permissions by Category */}
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <FormLabel>Permissions</FormLabel>
                <div className='text-muted-foreground text-sm'>
                  {Object.keys(groupedPermissions).reduce(
                    (total, category) =>
                      total + getCategoryCheckedCount(category),
                    0
                  )}{' '}
                  / {allPermissions.length} permissions selected
                </div>
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {Object.entries(groupedPermissions).map(([category, perms]) => {
                  const checkedCount = getCategoryCheckedCount(category);
                  const totalCount = perms.length;

                  return (
                    <div key={category} className='rounded-lg border p-4'>
                      <div className='flex items-center justify-between'>
                        <div
                          className='flex flex-1 cursor-pointer items-center'
                          onClick={() => toggleCategory(category)}
                        >
                          <div className='flex items-center gap-2'>
                            <h3 className='font-medium'>
                              {formatPermissionName(category)}
                            </h3>
                            <span className='bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs'>
                              {checkedCount}/{totalCount}
                            </span>
                          </div>
                          {expandedCategories[category] ? (
                            <ChevronDown className='ml-2 h-4 w-4' />
                          ) : (
                            <ChevronRight className='ml-2 h-4 w-4' />
                          )}
                        </div>
                        {expandedCategories[category] && (
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              const allSelected = perms.every((perm) =>
                                form.getValues(`permissions.${perm.id}`)
                              );
                              handleSelectAll(category, !allSelected);
                            }}
                          >
                            {perms.every((perm) =>
                              form.getValues(`permissions.${perm.id}`)
                            )
                              ? 'Deselect All'
                              : 'Select All'}
                          </Button>
                        )}
                      </div>

                      {expandedCategories[category] && (
                        <div className='mt-3 space-y-2'>
                          {perms.length > 0 ? (
                            <div className='grid grid-cols-1 gap-2'>
                              {perms.map((permission) => (
                                <FormField
                                  key={permission.id}
                                  control={form.control}
                                  name={`permissions.${permission.id}`}
                                  render={({ field }) => (
                                    <FormItem className='flex items-start space-y-0 space-x-3'>
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value || false}
                                          onCheckedChange={field.onChange}
                                          className='mt-1'
                                        />
                                      </FormControl>
                                      <FormLabel className='leading-tight font-normal wrap-break-word'>
                                        {formatPermissionName(permission.name)}
                                        {permission.description && (
                                          <p className='text-muted-foreground mt-1 text-xs'>
                                            {permission.description}
                                          </p>
                                        )}
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                              ))}
                            </div>
                          ) : (
                            <p className='text-muted-foreground text-sm'>
                              No permissions in this category
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className='flex justify-end gap-4 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.push('/dashboard/Role')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={isSubmitting || isLoading}
                className='min-w-30'
              >
                {isSubmitting ? 'Updating...' : 'Update Permissions'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
