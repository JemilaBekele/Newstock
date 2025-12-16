'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { IEmployee } from '@/models/employee';
import { useForm } from 'react-hook-form';
import { createEmployee, updateEmployee } from '@/service/employee';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { getRoleall, IRole } from '@/service/roleService';
import { IBranch } from '@/models/Branch';
import { getBranches } from '@/service/branch';
import { IShop } from '@/models/shop';
import { IStore } from '@/models/store';
import { getShops } from '@/service/shop';
import { getStores } from '@/service/store';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

// Define the form data type
interface FormData {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  userCode?: string;
  branchId?: string;
  roleId: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  shopIds: string[];
  storeIds: string[];
}

export default function EmployeeForm({
  initialData,
  pageTitle
}: {
  initialData: IEmployee | null;
  pageTitle: string;
}) {
  const router = useRouter();
  const [roles, setRoles] = useState<IRole[]>([]);
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [shops, setShops] = useState<IShop[]>([]);
  const [stores, setStores] = useState<IStore[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingShops, setLoadingShops] = useState(true);
  const [loadingStores, setLoadingStores] = useState(true);

  const isUpdateMode = !!initialData;

  const defaultValues = useMemo(
    () => ({
      name: initialData?.name || '',
      email: initialData?.email || '',
      password: '',
      phone: initialData?.phone || '',
      userCode: initialData?.userCode || '',
      branchId: initialData?.branchId || '',
      roleId: initialData?.roleId || initialData?.role?.id || '',
      status: initialData?.status || 'Active',
      shopIds:
        initialData?.shopIds ||
        initialData?.shops?.map((shop) => shop.id) ||
        [],
      storeIds:
        initialData?.storeIds ||
        initialData?.stores?.map((store) => store.id) ||
        []
    }),
    [initialData]
  );

  const form = useForm<FormData>({
    defaultValues,
    mode: 'onChange'
  });

  useEffect(() => {
    (async () => {
      try {
        const rolesData = await getRoleall();
        setRoles(rolesData);
      } catch {
        toast.error('Failed to fetch roles');
      } finally {
        setLoadingRoles(false);
      }
    })();

    (async () => {
      try {
        const branchesData = await getBranches();
        setBranches(branchesData);
      } catch {
        toast.error('Failed to fetch branches');
      } finally {
        setLoadingBranches(false);
      }
    })();

    (async () => {
      try {
        const shopsData = await getShops();
        setShops(shopsData);
      } catch {
        toast.error('Failed to fetch shops');
      } finally {
        setLoadingShops(false);
      }
    })();

    (async () => {
      try {
        const storesData = await getStores();
        setStores(storesData);
      } catch {
        toast.error('Failed to fetch stores');
      } finally {
        setLoadingStores(false);
      }
    })();
  }, []);

  const validateForm = (data: FormData): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Name validation
    if (!data.name || data.name.trim().length < 2) {
      errors.name = 'Employee name must be at least 2 characters.';
    }

    // Email validation
    if (!data.email) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Please enter a valid email address.';
    }

    // Password validation for create mode
    if (!isUpdateMode && (!data.password || data.password.length < 6)) {
      errors.password = 'Password must be at least 6 characters.';
    }

    // Password validation for update mode (only if provided)
    if (isUpdateMode && data.password && data.password.length > 0 && data.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    // Role validation
    if (!data.roleId) {
      errors.roleId = 'Role is required.';
    }

    return errors;
  };

  const onSubmit = async (data: FormData) => {
    try {
      // Validate form
      const errors = validateForm(data);
      if (Object.keys(errors).length > 0) {
        Object.entries(errors).forEach(([field, message]) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          form.setError(field as any, {
            type: 'manual',
            message
          });
        });
        return;
      }

      // Remove password field if it's empty during update
      const submitData = { ...data };
      if (isUpdateMode && !submitData.password) {
        delete submitData.password;
      }

      if (isUpdateMode && initialData?.id) {
        await updateEmployee(initialData.id, submitData);
        toast.success('Employee updated successfully');
        router.push(`/dashboard/employee`);
      } else {
        await createEmployee(submitData);
        toast.success('Employee created successfully');
        router.push(`/dashboard/employee`);
      }
    } catch {
      toast.error(
        isUpdateMode ? 'Error updating employee' : 'Error creating employee'
      );
    }
  };

  const handleShopChange = (shopId: string, checked: boolean) => {
    const currentShopIds = form.getValues('shopIds') || [];
    const updatedShopIds = checked
      ? [...currentShopIds, shopId]
      : currentShopIds.filter((id) => id !== shopId);

    form.setValue('shopIds', updatedShopIds, { shouldValidate: true });
  };

  const handleStoreChange = (storeId: string, checked: boolean) => {
    const currentStoreIds = form.getValues('storeIds') || [];
    const updatedStoreIds = checked
      ? [...currentStoreIds, storeId]
      : currentStoreIds.filter((id) => id !== storeId);

    form.setValue('storeIds', updatedStoreIds, { shouldValidate: true });
  };

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                name='name'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name='email'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                name='password'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Password {isUpdateMode ? '(Leave empty to keep current)' : ''}
                    </FormLabel>
                    <FormControl>
                      <Input type='password' {...field} placeholder={isUpdateMode ? 'Enter new password if changing' : ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name='phone'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name='branchId'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              loadingBranches
                                ? 'Loading branches...'
                                : 'Select branch'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Status Field */}
              <FormField
                name='status'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name='roleId'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              loadingRoles ? 'Loading roles...' : 'Select role'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id ?? ''}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Shops Assignment Section */}
            <div className='space-y-4'>
              <Label className='text-lg font-semibold'>Assign Shops</Label>
              {loadingShops ? (
                <div className='text-muted-foreground text-sm'>
                  Loading shops...
                </div>
              ) : (
                <div className='grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3'>
                  {shops.map((shop) => (
                    <div key={shop.id} className='flex items-center space-x-2'>
                      <Checkbox
                        id={`shop-${shop.id}`}
                        checked={
                          form.watch('shopIds')?.includes(shop.id) || false
                        }
                        onCheckedChange={(checked) =>
                          handleShopChange(shop.id, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`shop-${shop.id}`}
                        className='cursor-pointer text-sm font-normal'
                      >
                        {shop.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
              {form.formState.errors.shopIds && (
                <p className='text-destructive text-sm font-medium'>
                  {form.formState.errors.shopIds.message}
                </p>
              )}
            </div>

            {/* Stores Assignment Section */}
            <div className='space-y-4'>
              <Label className='text-lg font-semibold'>Assign Stores</Label>
              {loadingStores ? (
                <div className='text-muted-foreground text-sm'>
                  Loading stores...
                </div>
              ) : (
                <div className='grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3'>
                  {stores.map((store) => (
                    <div key={store.id} className='flex items-center space-x-2'>
                      <Checkbox
                        id={`store-${store.id}`}
                        checked={
                          form.watch('storeIds')?.includes(store.id) || false
                        }
                        onCheckedChange={(checked) =>
                          handleStoreChange(store.id, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`store-${store.id}`}
                        className='cursor-pointer text-sm font-normal'
                      >
                        {store.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
              {form.formState.errors.storeIds && (
                <p className='text-destructive text-sm font-medium'>
                  {form.formState.errors.storeIds.message}
                </p>
              )}
            </div>

            <Button type='submit'>
              {isUpdateMode ? 'Update Employee' : 'Add Employee'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}