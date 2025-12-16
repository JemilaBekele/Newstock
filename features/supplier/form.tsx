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
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSupplier, updateSupplier } from '@/service/supplier';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { ISupplier } from '@/models/supplier';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  tinNumber: z.string().optional(),
  notes: z.string().optional()
});

export default function SupplierForm({
  initialData,
  pageTitle
}: {
  initialData: ISupplier | null;
  pageTitle: string;
}) {
  const router = useRouter();

  const defaultValues = useMemo(
    () => ({
      name: initialData?.name || '',
      contactName: initialData?.contactName || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      country: initialData?.country || '',
      tinNumber: initialData?.tinNumber || '',
      notes: initialData?.notes || ''
    }),
    [initialData]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (initialData?.id) {
        await updateSupplier(initialData.id, data);
        toast.success('Supplier updated successfully');
      } else {
        await createSupplier(data);
        toast.success('Supplier created successfully');
      }

      router.refresh();
      router.push('/dashboard/supplier');
    } catch  {
      toast.error( 'Error saving supplier');
    }
  };

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle>{pageTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              {/* Left Column */}
              <div className='space-y-4'>
                <FormField
                  name='name'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g., Ethio Pharma PLC'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name='contactName'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g., Mr. Solomon Tadesse'
                          {...field}
                        />
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
                        <Input
                          placeholder='e.g., +251 911 123 456'
                          {...field}
                        />
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
                        <Input
                          type='email'
                          placeholder='e.g., contact@supplier.com'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Right Column */}
              <div className='space-y-4'>
                <FormField
                  name='address'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name='city'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name='country'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name='tinNumber'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TIN Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Full width field */}
            <FormField
              name='notes'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type='submit' className='w-full md:w-auto'>
              {initialData ? 'Update Supplier' : 'Create Supplier'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
