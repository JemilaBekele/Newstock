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
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { IProduct, IProductBatch } from '@/models/Product';
import { getProducts } from '@/service/Product';
import {
  createProductBatch,
  updateProductBatch
} from '@/service/productBatchService';
// Form validation schema
const formSchema = z.object({
  batchNumber: z.string().min(1, 'Batch number is required'),
  expiryDate: z.string().optional(),
  productId: z.string().min(1, 'Product is required')
});

export default function ProductBatchForm({
  initialData,
  pageTitle
}: {
  initialData: IProductBatch | null;
  pageTitle: string;
}) {
  const router = useRouter();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch products and shops on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData] = await Promise.all([getProducts()]);
        setProducts(productsData);
      } catch  {
        toast.error('Failed to fetch data');
      }
    };
    fetchData();
  }, []);

  const defaultValues = useMemo(
    () => ({
      batchNumber: initialData?.batchNumber || '',
      expiryDate: initialData?.expiryDate
        ? new Date(initialData.expiryDate).toISOString().split('T')[0]
        : '',
      productId: initialData?.productId || ''
    }),
    [initialData]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      // Format the data for API
      const formattedData = {
        ...data,
        expiryDate: data.expiryDate || undefined
      };

      if (initialData?.id) {
        await updateProductBatch(initialData.id, formattedData);
        toast.success('Product batch updated successfully');
      } else {
        await createProductBatch(formattedData);
        toast.success('Product batch created successfully');
      }

      router.refresh();
      router.push('/dashboard/ProductBatch');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error?.message || 'Error saving product batch');
    } finally {
      setLoading(false);
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
                  name='batchNumber'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch Number *</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g., BATCH-001' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name='expiryDate'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input type='date' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Right Column */}
              <div className='space-y-4'>
                <FormField
                  name='productId'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select a product' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Prices Section */}

            <Button
              type='submit'
              disabled={loading}
              className='w-full md:w-auto'
            >
              {loading
                ? 'Saving...'
                : initialData
                  ? 'Update Product Batch'
                  : 'Create Product Batch'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
