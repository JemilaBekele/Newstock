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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { ISubCategory, ICategory } from '@/models/Category';
import {
  createSubCategory,
  updateSubCategory,
  getCategories
} from '@/service/Category';

// Zod schema: categoryId as string (UUID)
const formSchema = z.object({
  name: z.string().min(1, 'Subcategory name is required'),
  categoryId: z.string({ required_error: 'Category is required' })
});

interface SubCategoryFormProps {
  initialData: ISubCategory | null;
  closeModal: () => void;
  isEdit?: boolean;
}

export default function SubCategoryForm({
  initialData,
  closeModal,
  isEdit = false
}: SubCategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch  {
        toast.error( 'Failed to fetch categories');
      }
    };
    fetchCategories();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      categoryId: initialData?.categoryId || '' // initially empty, will update after categories load
    }
  });

  // Update default categoryId once categories are fetched
  useEffect(() => {
    if (!initialData && categories.length > 0) {
      form.setValue('categoryId', categories[0].id);
    }
  }, [categories, initialData, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      if (isEdit && initialData?.id) {
        await updateSubCategory(initialData.id, data);
        toast.success('Subcategory updated successfully');
      } else {
        await createSubCategory(data);
        toast.success('Subcategory created successfully');
      }

      router.refresh();
      closeModal();
    } catch  {
      const message = 'An error occurred during saving.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className='mx-auto w-full max-w-2xl'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {isEdit ? 'Edit Subcategory' : 'Create Subcategory'}
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
                    <Input placeholder='e.g., Smartphones' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category Select */}
            <FormField
              control={form.control}
              name='categoryId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder='Select category' />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end gap-2'>
              <Button variant='outline' type='button' onClick={closeModal}>
                Cancel
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isEdit ? 'Update Subcategory' : 'Create Subcategory'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
