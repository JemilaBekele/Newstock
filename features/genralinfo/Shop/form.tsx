'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import { IBranch } from '@/models/Branch';
import { createShop, updateShop } from '@/service/shop';
import { IShop } from '@/models/shop';
import { getBranches } from '@/service/branch';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  branchId: z.string().min(1, 'Branch is required')
});

interface ShopFormProps {
  initialData: IShop | null;
  closeModal: () => void;
  isEdit?: boolean;
}

export default function ShopForm({
  initialData,
  closeModal,
  isEdit = false
}: ShopFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [branches, setBranches] = useState<IBranch[]>([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        setBranches(await getBranches());
      } catch (error) {
        toast.error('Failed to load branches or locations');
      }
    })();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      branchId: initialData?.branchId || ''
    }
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      if (isEdit && initialData?.id) {
        await updateShop(initialData.id, data);
        toast.success('Shop updated successfully');
      } else {
        await createShop(data);
        toast.success('Shop created successfully');
      }
      router.refresh();
      closeModal();
    } catch  {
      const message =
    'An error occurred during saving.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className='mx-auto w-full max-w-2xl'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {isEdit ? 'Edit Shop' : 'Create Shop'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* Name */}
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g., Main Shop' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Branch */}
            <FormField
              control={form.control}
              name='branchId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder='Select branch' />
                    </SelectTrigger>
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

            <div className='flex justify-end gap-2'>
              <Button variant='outline' type='button' onClick={closeModal}>
                Cancel
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isEdit ? 'Update Shop' : 'Create Shop'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
