/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Select from 'react-select';
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
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { getStores, getStoresall } from '@/service/store';
import { getShops, getShopsall } from '@/service/shop';
import { createTransfer, updateTransfer } from '@/service/transfer';
import { useCallback, useEffect, useRef, useState } from 'react';
import { IconTrash } from '@tabler/icons-react';
import { ITransfer, TransferEntityType } from '@/models/transfer';
import { getAvailableProductsBySource } from '@/service/productBatchService';
import { IUnitOfMeasure } from '@/models/UnitOfMeasure';

interface FormData {
  reference?: string;
  sourceType: TransferEntityType;
  sourceStoreId?: string;
  sourceShopId?: string;
  destinationType: TransferEntityType;
  destStoreId?: string;
  destShopId?: string;
  notes?: string;
  items: Array<{
    productId: string;
    batchId: string;
    quantity: number;
    // Removed: unitOfMeasureId: string;
  }>;
}

interface TransferFormProps {
  initialData: ITransfer | null;
  isEdit?: boolean;
}

interface StoreStockItem {
  id: string;
  storeId: string;
  batchId: string;
  quantity: number;
  status: string;
  unitOfMeasureId: string;
  createdAt: string;
  updatedAt: string;
  store: {
    id: string;
    name: string;
    branchId: string;
  };
  batch: {
    id: string;
    batchNumber: string;
    expiryDate: string | null;
    price: number | null;
  };
  product: {
    id: string;
    productCode: string;
    name: string;
    generic: string | null;
    description: string | null;
    sellPrice: number | null;
    imageUrl: string;
    isActive: boolean;
    category: any;
    subCategory: any | null;
    unitOfMeasure: IUnitOfMeasure;
  };
  unitOfMeasure: IUnitOfMeasure;
  availableQuantity: number;
  conversionFactor: number;
}

export default function TransferForm({
  initialData,
  isEdit = false
}: TransferFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [stores, setStores] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [disstores, setDisstores] = useState<any[]>([]);
  const [disshops, setDisshops] = useState<any[]>([]);
  const [storeStockItems, setStoreStockItems] = useState<StoreStockItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingStoresShops, setLoadingStoresShops] = useState(true);
  
  // Add refs to track API calls
  const hasFetchedProductsRef = useRef(false);
  const lastSourceRef = useRef<string>('');
  
  const router = useRouter();

  const form = useForm<FormData>({
    defaultValues: {
      reference: initialData?.reference || '',
      sourceType: initialData?.sourceType || TransferEntityType.STORE,
      sourceStoreId: initialData?.sourceStoreId || '',
      sourceShopId: initialData?.sourceShopId || '',
      destinationType: initialData?.destinationType || TransferEntityType.STORE,
      destStoreId: initialData?.destStoreId || '',
      destShopId: initialData?.destShopId || '',
      notes: initialData?.notes || '',
      items: initialData?.items?.map((item) => ({
        productId: item.productId.toString(),
        batchId: item.batchId.toString(),
        quantity: Number(item.quantity)
        // Removed: unitOfMeasureId: item.unitOfMeasureId.toString(),
      })) || [{ productId: '', batchId: '', quantity: 1 }] // Removed unitOfMeasureId
    }
  });

  const sourceType = form.watch('sourceType');
  const sourceStoreId = form.watch('sourceStoreId');
  const sourceShopId = form.watch('sourceShopId');
  const destinationType = form.watch('destinationType');

  // Create a stable source identifier
  const currentSource = `${sourceType}-${sourceType === TransferEntityType.STORE ? sourceStoreId : sourceShopId}`;

  // Get unique products from storeStockItems
  const getUniqueProducts = (): StoreStockItem[] => {
    const seenProductIds = new Set<string>();
    return storeStockItems.filter((item) => {
      if (!seenProductIds.has(item.product.id)) {
        seenProductIds.add(item.product.id);
        return true;
      }
      return false;
    });
  };

  // Get all batches for a specific product from storeStockItems
  const getBatchesForProduct = (productId: string): Array<{ id: string; batchNumber: string }> => {
    return storeStockItems
      .filter((item) => item.product.id === productId)
      .map((item) => ({
        id: item.batchId,
        batchNumber: item.batch.batchNumber
      }));
  };

  // Get unit of measure for a specific product
  const getUnitOfMeasureForProduct = (productId: string): IUnitOfMeasure | null => {
    const productItem = storeStockItems.find(item => item.product.id === productId);
    return productItem?.product.unitOfMeasure || null;
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch stores and shops
  useEffect(() => {
    const fetchData = async () => {
      setLoadingStoresShops(true);
      try {
        const [storesData, shopsData, disstoresData, disshopsData] = await Promise.all([
          getStores(),
          getShops(),
          getShopsall(),
          getStoresall(),
        ]);
        setStores(storesData);
        setShops(shopsData);
        setDisshops(disstoresData);
        setDisstores(disshopsData);
      } catch  {
        toast.error('Failed to load stores or shops');
      } finally {
        setLoadingStoresShops(false);
      }
    };
    fetchData();
  }, []);

  // Optimized: Fetch products from source
  const fetchProductsFromSource = useCallback(async () => {
    // Don't fetch if no source is selected
    if (
      (sourceType === TransferEntityType.STORE && !sourceStoreId) ||
      (sourceType === TransferEntityType.SHOP && !sourceShopId)
    ) {
      setStoreStockItems([]);
      hasFetchedProductsRef.current = false;
      lastSourceRef.current = '';
      return;
    }

    // Skip if we've already fetched for this source
    if (currentSource === lastSourceRef.current && hasFetchedProductsRef.current) {
      return;
    }

    console.log(`Fetching products for source: ${currentSource}`);
    
    setLoadingProducts(true);
    hasFetchedProductsRef.current = true;
    lastSourceRef.current = currentSource;

    try {
      const sourceId = sourceType === TransferEntityType.STORE ? sourceStoreId : sourceShopId;
      if (!sourceId) return;

      const storeStockData = await getAvailableProductsBySource(sourceType, sourceId);
      setStoreStockItems(storeStockData);

      // For edit mode, pre-select items
      if (isEdit) {
        const items = form.getValues('items');
        // No additional API calls needed
      }
    } catch {
      toast.error('Failed to load products from source');
      setStoreStockItems([]);
    } finally {
      setLoadingProducts(false);
    }
  }, [currentSource, sourceType, sourceStoreId, sourceShopId, form, isEdit]);

  const calculateAvailableQuantity = (
    storeStockItem: any
  ): number => {
    if (!storeStockItem) return 0;
    return storeStockItem.quantity;
  };

  // Debounced fetch effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProductsFromSource();
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(timeoutId);
    };
  }, [fetchProductsFromSource]);

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    return () => observer.disconnect();
  }, []);

  const darkStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      color: '#f9fafb'
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: '#1f2937',
      color: '#f9fafb'
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? '#374151' : '#1f2937',
      color: '#f9fafb'
    }),
    singleValue: (base: any) => ({
      ...base,
      color: '#f9fafb'
    }),
    input: (base: any) => ({
      ...base,
      color: '#f9fafb'
    }),
    placeholder: (base: any) => ({
      ...base,
      color: '#9ca3af'
    })
  };

 const onSubmit = async (data: FormData) => {
  setIsLoading(true);
  try {
    // Debug: Log the raw data
    console.log('Raw form data:', data);
    console.log('Raw items:', data.items);
    console.log('Items count:', data.items.length);

    // Validate source
    if (data.sourceType === TransferEntityType.STORE && !data.sourceStoreId) {
      toast.error('Source store is required');
      setIsLoading(false);
      return;
    }

    if (data.sourceType === TransferEntityType.SHOP && !data.sourceShopId) {
      toast.error('Source shop is required');
      setIsLoading(false);
      return;
    }

    // Validate destination
    if (data.destinationType === TransferEntityType.STORE && !data.destStoreId) {
      toast.error('Destination store is required');
      setIsLoading(false);
      return;
    }

    if (data.destinationType === TransferEntityType.SHOP && !data.destShopId) {
      toast.error('Destination shop is required');
      setIsLoading(false);
      return;
    }

    // Check if source and destination are the same
    if (
      (data.sourceType === TransferEntityType.STORE && 
       data.destinationType === TransferEntityType.STORE && 
       data.sourceStoreId === data.destStoreId) ||
      (data.sourceType === TransferEntityType.SHOP && 
       data.destinationType === TransferEntityType.SHOP && 
       data.sourceShopId === data.destShopId)
    ) {
      toast.error('Source and destination cannot be the same');
      setIsLoading(false);
      return;
    }

    // Debug each item
    data.items.forEach((item, index) => {
      console.log(`Item ${index + 1}:`, {
        productId: item.productId,
        batchId: item.batchId,
        quantity: item.quantity,
        productIdTruthy: !!item.productId,
        batchIdTruthy: !!item.batchId,
        quantityValid: item.quantity > 0,
        passesAll: item.productId && item.batchId && item.quantity > 0
      });
    });

    // Filter out incomplete items (removed unitOfMeasureId check)
    const validItems = data.items.filter(
      (item) => 
        item.productId && 
        item.batchId && 
        item.quantity > 0
    );
    
    console.log('Valid items found:', validItems);
    console.log('Valid items count:', validItems.length);

    // If no valid items, show error
    if (validItems.length === 0) {
      toast.error('Please add at least one valid item');
      setIsLoading(false);
      return;
    }

    // Clean the payload
    const cleanedPayload = {
      ...data,
      reference: data.reference?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
      sourceStoreId: data.sourceStoreId || undefined,
      sourceShopId: data.sourceShopId || undefined,
      destStoreId: data.destStoreId || undefined,
      destShopId: data.destShopId || undefined,
      items: validItems.map((item) => ({
        productId: item.productId.toString(),
        batchId: item.batchId.toString(),
        quantity: Number(item.quantity)
        // Removed: unitOfMeasureId: item.unitOfMeasureId.toString(),
      }))
    };

    console.log('Cleaned payload:', cleanedPayload);
    
    let transferId: string | undefined;

    if (isEdit && initialData?.id) {
      const updatedTransfer = await updateTransfer(initialData.id, cleanedPayload);
      transferId = updatedTransfer.id;
      toast.success('Transfer updated successfully');
      router.push(`/dashboard/Transfer/view?id=${initialData?.id}`);
    } else {
      const newTransfer = await createTransfer(cleanedPayload);
      transferId = newTransfer.transfer.id;
      toast.success('Transfer created successfully');
    }

    if (transferId) {
      router.push(`/dashboard/Transfer/view?id=${transferId}`);
    }
    router.refresh();
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      'An error occurred while saving transfer.';
    toast.error(message);
  } finally {
    setIsLoading(false);
  }
};

  if (!isMounted) {
    return (
      <Card className='mx-auto w-full'>
        <CardHeader>
          <CardTitle className='text-left text-2xl font-bold'>
            {isEdit ? 'Edit Transfer' : 'Create Transfer'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center py-8'>
            <div className='text-center'>
              <div className='border-primary mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2'></div>
              <div>Loading form...</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show loading state while stores/shops are loading
  if (loadingStoresShops) {
    return (
      <Card className='mx-auto w-full'>
        <CardHeader>
          <CardTitle className='text-left text-2xl font-bold'>
            {isEdit ? 'Edit Transfer' : 'Create Transfer'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center py-8'>
            <div className='text-center'>
              <div className='border-primary mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2'></div>
              <div>Loading stores and shops...</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {isEdit ? 'Edit Transfer' : 'Create Transfer'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='reference'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter transfer reference'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Empty column for spacing - aligns with Source/Destination Type column */}
              <div></div>
            </div>

            {/* Source and Destination Section - Aligned in same columns */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              {/* Source Column */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Source</h3>

                <FormField
                  control={form.control}
                  name='sourceType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <ShadcnSelect
                        value={field.value}
                        onValueChange={(value: TransferEntityType) => {
                          field.onChange(value);
                          if (value === TransferEntityType.STORE) {
                            form.setValue('sourceShopId', '');
                          } else {
                            form.setValue('sourceStoreId', '');
                          }
                          form.setValue('items', [
                            {
                              productId: '',
                              batchId: '',
                              quantity: 1
                            }
                          ]);
                          setStoreStockItems([]);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select source type' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={TransferEntityType.STORE}>
                            Store
                          </SelectItem>
                          <SelectItem value={TransferEntityType.SHOP}>
                            Shop
                          </SelectItem>
                        </SelectContent>
                      </ShadcnSelect>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {sourceType === TransferEntityType.STORE && (
                  <FormField
                    control={form.control}
                    name='sourceStoreId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store</FormLabel>
                        <ShadcnSelect
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue('items', [
                              {
                                productId: '',
                                batchId: '',
                                quantity: 1
                              }
                            ]);
                            setStoreStockItems([]);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select source store' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {stores.map((store) => (
                              <SelectItem
                                key={store.id}
                                value={store.id.toString()}
                              >
                                {store.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </ShadcnSelect>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {sourceType === TransferEntityType.SHOP && (
                  <FormField
                    control={form.control}
                    name='sourceShopId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shop</FormLabel>
                        <ShadcnSelect
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue('items', [
                              {
                                productId: '',
                                batchId: '',
                                quantity: 1
                              }
                            ]);
                            setStoreStockItems([]);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select source shop' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {shops.map((shop) => (
                              <SelectItem
                                key={shop.id}
                                value={shop.id.toString()}
                              >
                                {shop.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </ShadcnSelect>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Destination Column */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Destination</h3>

                <FormField
                  control={form.control}
                  name='destinationType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <ShadcnSelect
                        value={field.value}
                        onValueChange={(value: TransferEntityType) => {
                          field.onChange(value);
                          if (value === TransferEntityType.STORE) {
                            form.setValue('destShopId', '');
                          } else {
                            form.setValue('destStoreId', '');
                          }
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select destination type' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={TransferEntityType.STORE}>
                            Store
                          </SelectItem>
                          <SelectItem value={TransferEntityType.SHOP}>
                            Shop
                          </SelectItem>
                        </SelectContent>
                      </ShadcnSelect>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {destinationType === TransferEntityType.STORE && (
                  <FormField
                    control={form.control}
                    name='destStoreId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store</FormLabel>
                        <ShadcnSelect
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select destination store' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {disstores.map((store) => (
                              <SelectItem
                                key={store.id}
                                value={store.id.toString()}
                              >
                                {store.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </ShadcnSelect>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {destinationType === TransferEntityType.SHOP && (
                  <FormField
                    control={form.control}
                    name='destShopId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shop</FormLabel>
                        <ShadcnSelect
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select destination shop' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {disshops.map((shop) => (
                              <SelectItem
                                key={shop.id}
                                value={shop.id.toString()}
                              >
                                {shop.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </ShadcnSelect>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name='items'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Items</FormLabel>
                  <FormControl>
                    <div className='space-y-4'>
                      {/* Updated grid columns: removed "Unit" column */}
                      <div className='grid grid-cols-6 gap-4 text-sm font-semibold text-gray-700 dark:text-gray-300'>
                        <div>Product</div>
                        <div>Batch</div>
                        <div>Quantity</div>
                        <div>Available</div>
                        <div>Unit</div>
                        <div>Action</div>
                      </div>

                      {field.value.map((item, index) => {
                        const storeStockItem = storeStockItems.find(
                          (stock) =>
                            stock.product.id.toString() === item.productId &&
                            stock.batchId === item.batchId
                        );

                        const availableQuantity = storeStockItem?.quantity || 0;
                        
                        // Get unit of measure from the product
                        const productUnitOfMeasure = storeStockItem?.product.unitOfMeasure;

                        const uniqueProducts = getUniqueProducts();
                        const productOptions = uniqueProducts.map((storeStockItem) => ({
                          value: storeStockItem.product.id.toString(),
                          label: `${storeStockItem.product.name}`,
                          data: storeStockItem
                        }));

                        return (
                          <div
                            key={index}
                            className='grid grid-cols-6 items-center gap-4'
                          >
                            <div>
                              <Select
                                instanceId={`product-select-${index}`}
                                options={productOptions}
                                onChange={(newValue: any) => {
                                  const newItems = [...field.value];
                                  newItems[index].productId =
                                    newValue?.value || '';
                                  newItems[index].batchId = '';
                                  newItems[index].quantity = 1;
                                  field.onChange(newItems);
                                }}
                                value={
                                  productOptions.find(
                                    (p) => p.value === item.productId
                                  ) || null
                                }
                                placeholder={'Search product'}
                                isSearchable
                                isDisabled={loadingProducts}
                                isLoading={loadingProducts}
                                styles={isDark ? darkStyles : {}}
                              />
                            </div>

                            <div>
                              <Select
                                key={`batch-${item.productId}`}
                                instanceId={`batch-select-${index}`}
                                options={getBatchesForProduct(item.productId).map((batch) => ({
                                  value: batch.id,
                                  label: batch.batchNumber
                                }))}
                                onChange={(newValue: any) => {
                                  const newItems = [...field.value];
                                  newItems[index].batchId =
                                    newValue?.value || '';
                                  
                                  field.onChange(newItems);
                                }}
                                value={
                                  getBatchesForProduct(item.productId)
                                    .find((b) => b.id === item.batchId) 
                                    ? {
                                        value: item.batchId,
                                        label: getBatchesForProduct(item.productId)
                                          .find((b) => b.id === item.batchId)?.batchNumber || ''
                                      }
                                    : null
                                }
                                placeholder={
                                  !item.productId || loadingProducts
                                    ? 'Select product first'
                                    : 'Select batch'
                                }
                                isSearchable
                                isDisabled={
                                  !item.productId || loadingProducts
                                }
                                isLoading={loadingProducts}
                                styles={isDark ? darkStyles : {}}
                              />
                            </div>

                            <div>
                              <Input
                                type='number'
                                placeholder='Qty'
                                value={item.quantity}
                                min={1}
                                max={Math.floor(availableQuantity)}
                                onChange={(e) => {
                                  const newItems = [...field.value];
                                  const quantity = Number(e.target.value);
                                  const maxQuantity = Math.floor(availableQuantity);

                                  newItems[index].quantity = Math.min(
                                    isNaN(quantity) ? 0 : quantity,
                                    maxQuantity
                                  );
                                  field.onChange(newItems);
                                }}
                                disabled={loadingProducts}
                              />
                            </div>

                            <div className='text-muted-foreground text-sm'>
                              {loadingProducts ? (
                                <div className='flex items-center gap-1'>
                                  <div className='h-3 w-3 animate-spin rounded-full border-b-2 border-gray-400'></div>
                                  <span>Loading...</span>
                                </div>
                              ) : availableQuantity > 0 ? (
                                `${Math.floor(availableQuantity)} available`
                              ) : (
                                'Out of stock'
                              )}
                            </div>

                            {/* Display unit of measure from product (read-only) */}
                            <div className='text-muted-foreground text-sm'>
                              {productUnitOfMeasure ? (
                                productUnitOfMeasure.name
                              ) : (
                                <span className='text-gray-400'>Select product</span>
                              )}
                            </div>

                            <div>
                              <Button
                                type='button'
                                variant='destructive'
                                size='sm'
                                onClick={() => {
                                  const newItems = [...field.value];
                                  newItems.splice(index, 1);
                                  field.onChange(newItems);
                                }}
                                disabled={
                                  field.value.length <= 1 || loadingProducts
                                }
                              >
                                <IconTrash size={16} />
                              </Button>
                            </div>
                          </div>
                        );
                      })}

                      <div className='flex justify-end'>
                        <Button
                          type='button'
                          onClick={() => {
                            field.onChange([
                              ...field.value,
                              {
                                productId: '',
                                batchId: '',
                                quantity: 1
                              }
                            ]);
                          }}
                          disabled={loadingProducts}
                        >
                          {loadingProducts ? (
                            <div className='flex items-center gap-2'>
                              <div className='h-4 w-4 animate-spin rounded-full border-b-2 border-white'></div>
                              Loading...
                            </div>
                          ) : (
                            'Add Item'
                          )}
                        </Button>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='notes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter notes (optional)' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end gap-2'>
              <Button
                type='submit'
                disabled={isLoading}
                className='min-w-24'
              >
                {isLoading ? (
                  <div className='flex items-center gap-2'>
                    <div className='h-4 w-4 animate-spin rounded-full border-b-2 border-white'></div>
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </div>
                ) : isEdit ? (
                  'Update Transfer'
                ) : (
                  'Create Transfer'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}