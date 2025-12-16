'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem
} from '@/components/ui/select';

import { IRole, IPermission } from '@/service/roleService';
import { getRoleall, getPermission, Createassign } from '@/service/roleService';
import { PERMISSIONS } from '@/stores/permissions';

type FormValues = {
  roleId: string;
  permissions: Record<string, boolean>;
};

export default function AssRolePermissionForm({
  pageTitle = 'Assign Permissions'
}: {
  pageTitle?: string;
}) {
  const router = useRouter();
  const [roles, setRoles] = useState<IRole[]>([]);
  const [allPermissions, setAllPermissions] = useState<IPermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});

  const form = useForm<FormValues>({
    defaultValues: {
      roleId: '',
      permissions: {}
    }
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [rolesData, permissionsData] = await Promise.all([
          getRoleall(),
          getPermission()
        ]);
        setRoles(rolesData || []);
        setAllPermissions(permissionsData || []);

        // Initialize expanded categories
        const initialExpanded: Record<string, boolean> = {};
        Object.keys(PERMISSIONS).forEach((category) => {
          initialExpanded[category] = false;
        });
        setExpandedCategories(initialExpanded);
      } catch  {
        toast.error('Failed to load roles or permissions.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

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
      toast.error('Please select a role');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedPermissions = Object.entries(values.permissions)
        .filter(([, isSelected]) => isSelected)
        .map(([permissionId]) => permissionId);

      await Createassign({
        roleId: values.roleId,
        permissionIds: selectedPermissions
      });

      toast.success('Permissions assigned successfully');
      router.push('/dashboard/RolePermission');
    } catch  {
      toast.error( 'Error assigning permissions');
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

  // Format permission name for display
  const formatPermissionName = (name: string) => {
    return name
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-center text-xl font-bold'>
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* Role Select */}
            <FormField
              control={form.control}
              name='roleId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select a role' />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id!}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {!form.getValues('roleId') && form.formState.isSubmitted && (
                    <FormMessage>Please select a role</FormMessage>
                  )}
                </FormItem>
              )}
            />

            {/* Permissions by Category */}
            <div className='space-y-4'>
              <FormLabel>Permissions</FormLabel>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                  <div key={category} className='rounded-lg border p-4'>
                    <div className='flex items-center justify-between'>
                      <div
                        className='flex flex-1 cursor-pointer items-center'
                        onClick={() => toggleCategory(category)}
                      >
                        <h3 className='font-medium'>
                          {formatPermissionName(category)}
                        </h3>
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
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className='mt-1'
                                      />
                                    </FormControl>
                                    <FormLabel className='leading-tight font-normal wrap-break-word'>
                                      {formatPermissionName(permission.name)}
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
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className='flex justify-end gap-4 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isSubmitting || isLoading}>
                {isSubmitting ? 'Processing...' : 'Assign Permissions'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
