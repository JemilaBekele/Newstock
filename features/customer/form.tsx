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
import { createCustomer, updateCustomer } from '@/service/customer';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { ICustomer } from '@/models/customer';

// ✅ Updated schema
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  phone1: z.string().min(5, 'Primary phone must be valid.'),
  phone2: z.string().optional(),
  tinNumber: z.string().optional(),
  address: z.string().optional(),
  companyName: z.string().optional()
});

export default function CustomerForm({
  initialData,
  pageTitle
}: {
  initialData: ICustomer | null;
  pageTitle: string;
}) {
  const router = useRouter();

  const defaultValues = useMemo(
    () => ({
      name: initialData?.name || '',
      phone1: initialData?.phone1 || '',
      phone2: initialData?.phone2 || '',
      tinNumber: initialData?.tinNumber || '',
      address: initialData?.address || '',
      companyName: initialData?.companyName || ''
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
        await updateCustomer(initialData.id, data);
        toast.success('Customer updated successfully');
      } else {
        await createCustomer(data);
        toast.success('Customer created successfully');
      }

      router.refresh();
      router.push('/dashboard/customer');
    } catch  {
      toast.error( 'Error saving customer');
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
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g., John Doe Clinic' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name='companyName'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g., ABC Trading PLC' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name='phone1'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Phone</FormLabel>
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
                  name='phone2'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g., +251 922 123 456'
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
                  name='tinNumber'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TIN Number</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g., 1234567890' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name='address'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g., Addis Ababa, Bole Road'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button type='submit' className='w-full md:w-auto'>
              {initialData ? 'Update Customer' : 'Create Customer'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
