/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Form,
  FormField,
  FormLabel,
  FormControl,
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
import { Plus, Trash2 } from 'lucide-react';
import {
  bulkUpdateAdditionalPrices,
  getTransferBatches
} from '@/service/transfer';
import { IShop } from '@/models/shop';
import { getShops } from '@/service/shop';

type TransferViewProps = {
  transferId?: string;
};

const formSchema = z.object({
  products: z.array(
    z.object({
      productName: z.string(),
      batches: z.array(
        z.object({
          batchId: z.string(),
          batchNumber: z.string(),
          additionalPrices: z.array(
            z.object({
              label: z.string().min(1, 'Label is required'),
              price: z.coerce.number().min(0, 'Price must be positive'),
              shopId: z.string().min(1, 'Shop is required')
            })
          )
        })
      )
    })
  )
});

interface IAdditionalPriceForm {
  productName: string;
  batches: {
    batchId: string;
    batchNumber: string;
    additionalPrices: {
      label: string;
      price: number;
      shopId: string;
    }[];
  }[];
}

export default function TransferBatchPriceForm({
  transferId
}: TransferViewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<IAdditionalPriceForm[]>([]);
  const [shops, setShops] = useState<IShop[]>([]);

  // Fetch shops on component mount
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const shopsData = await getShops();
        setShops(shopsData);
      } catch  {
        toast.error('Failed to fetch shops');
      }
    };
    fetchShops();
  }, []);

  useEffect(() => {
    if (!transferId) return;

    const fetchBatches = async () => {
      try {
        const batches = await getTransferBatches(transferId);

        const groupedByProduct = batches.reduce((acc: any, batch: any) => {
          const productName = batch.product?.name || 'Unknown Product';
          const existingProduct = acc.find(
            (p: any) => p.productName === productName
          );

          // Extract shopId from the nested shop object
          const batchData = {
            batchId: batch.id,
            batchNumber: batch.batchNumber,
            additionalPrices:
              batch.additionalPrices?.length > 0
                ? batch.additionalPrices.map((p: any) => ({
                    label: p.label,
                    price: p.price,
                    shopId: p.shop?.id || p.shopId || '' // Extract shopId from shop object
                  }))
                : [{ label: '', price: 0, shopId: '' }]
          };

          if (existingProduct) {
            existingProduct.batches.push(batchData);
          } else {
            acc.push({
              productName,
              batches: [batchData]
            });
          }

          return acc;
        }, []);

        setInitialData(groupedByProduct);
      } catch  {
        toast.error('Failed to fetch batches');
      }
    };
    fetchBatches();
  }, [transferId]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { products: initialData }
  });

  useEffect(() => {
    form.reset({ products: initialData });
  }, [initialData, form]);

  const { fields: productFields } = useFieldArray({
    control: form.control,
    name: 'products'
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const flattenedBatches = data.products.flatMap(
        (product) => product.batches
      );
      await bulkUpdateAdditionalPrices(flattenedBatches);
      toast.success('Additional prices updated successfully');
      router.push(`/dashboard/Transfer`);
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update prices');
    } finally {
      setLoading(false);
    }
  };

  const hasNoAdditionalPrices = (
    additionalPrices: { label: string; price: number; shopId: string }[]
  ) => {
    return (
      additionalPrices.length === 0 ||
      (additionalPrices.length === 1 &&
        additionalPrices[0].label === '' &&
        additionalPrices[0].price === 0 &&
        additionalPrices[0].shopId === '')
    );
  };

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle>Update Additional Prices</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {productFields.map((productField, productIndex) => (
              <div
                key={productField.id}
                className='space-y-4 rounded-md border p-4'
              >
                <FormLabel className='text-lg font-semibold'>
                  Product: {productField.productName}
                </FormLabel>

                <FormField
                  control={form.control}
                  name={`products.${productIndex}.batches`}
                  render={({ field: batchField }) => (
                    <div className='space-y-4'>
                      {batchField.value.map(
                        (batch: any, batchIndex: number) => (
                          <div
                            key={batch.batchId}
                            className={`space-y-2 rounded-md border p-4 ${hasNoAdditionalPrices(batch.additionalPrices) ? 'border-orange-200 dark:border-orange-400' : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'}`}
                          >
                            <FormLabel className='text-md font-medium'>
                              Batch Number: {batch.batchNumber}
                            </FormLabel>

                            <FormField
                              control={form.control}
                              name={`products.${productIndex}.batches.${batchIndex}.additionalPrices`}
                              render={({ field: priceField }) => (
                                <div className='space-y-4'>
                                  {/* Header labels */}
                                  <div className='grid grid-cols-12 items-center gap-4'>
                                    <div className='col-span-3'>
                                      <FormLabel className='text-sm font-medium'>
                                        Price Level
                                      </FormLabel>
                                    </div>
                                    <div className='col-span-3'>
                                      <FormLabel className='text-sm font-medium'>
                                        Price Amount
                                      </FormLabel>
                                    </div>
                                    <div className='col-span-4'>
                                      <FormLabel className='text-sm font-medium'>
                                        Shop
                                      </FormLabel>
                                    </div>
                                    <div className='col-span-2'>
                                      {/* Empty space for alignment with delete button */}
                                    </div>
                                  </div>

                                  {priceField.value.map(
                                    (price: any, priceIndex: number) => (
                                      <div
                                        key={priceIndex}
                                        className='grid grid-cols-12 items-end gap-4'
                                      >
                                        <div className='col-span-3'>
                                          <FormLabel className='text-muted-foreground mb-1 block text-xs'>
                                            Level {priceIndex + 1}
                                          </FormLabel>
                                          <FormControl>
                                            <Input
                                              placeholder='Price label'
                                              value={price.label}
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                priceField.onChange(
                                                  priceField.value.map(
                                                    (p: any, i: number) =>
                                                      i === priceIndex
                                                        ? { ...p, label: val }
                                                        : p
                                                  )
                                                );
                                              }}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </div>
                                        <div className='col-span-3'>
                                          <FormLabel className='text-muted-foreground mb-1 block text-xs'>
                                            Price
                                          </FormLabel>
                                          <FormControl>
                                            <Input
                                              type='number'
                                              step='0.01'
                                              placeholder='0.00'
                                              value={
                                                price.price === 0
                                                  ? ''
                                                  : price.price
                                              }
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                priceField.onChange(
                                                  priceField.value.map(
                                                    (p: any, i: number) =>
                                                      i === priceIndex
                                                        ? {
                                                            ...p,
                                                            price:
                                                              val === ''
                                                                ? 0
                                                                : Number(val)
                                                          }
                                                        : p
                                                  )
                                                );
                                              }}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </div>
                                        <div className='col-span-4'>
                                          <FormLabel className='text-muted-foreground mb-1 block text-xs'>
                                            Shop
                                          </FormLabel>
                                          <FormControl>
                                            <Select
                                              value={price.shopId}
                                              onValueChange={(value) => {
                                                priceField.onChange(
                                                  priceField.value.map(
                                                    (p: any, i: number) =>
                                                      i === priceIndex
                                                        ? {
                                                            ...p,
                                                            shopId: value
                                                          }
                                                        : p
                                                  )
                                                );
                                              }}
                                            >
                                              <SelectTrigger>
                                                <SelectValue placeholder='Select shop' />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {shops.map((shop) => (
                                                  <SelectItem
                                                    key={shop.id}
                                                    value={shop.id}
                                                  >
                                                    {shop.name}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </FormControl>
                                          <FormMessage />
                                        </div>
                                        <div className='col-span-2 flex justify-end'>
                                          {priceIndex > 0 && (
                                            <Button
                                              type='button'
                                              variant='destructive'
                                              size='icon'
                                              onClick={() =>
                                                priceField.onChange(
                                                  priceField.value.filter(
                                                    (_: any, i: number) =>
                                                      i !== priceIndex
                                                  )
                                                )
                                              }
                                            >
                                              <Trash2 className='h-4 w-4' />
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  )}

                                  <Button
                                    type='button'
                                    variant='outline'
                                    onClick={() =>
                                      priceField.onChange([
                                        ...priceField.value,
                                        { label: '', price: 0, shopId: '' }
                                      ])
                                    }
                                    className='mt-2'
                                  >
                                    <Plus className='mr-2 h-4 w-4' />
                                    Add Price Level
                                  </Button>
                                </div>
                              )}
                            />
                          </div>
                        )
                      )}
                    </div>
                  )}
                />
              </div>
            ))}

            <Button
              type='submit'
              disabled={loading}
              className='w-full md:w-auto'
            >
              {loading ? 'Updating...' : 'Update Additional Prices'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
