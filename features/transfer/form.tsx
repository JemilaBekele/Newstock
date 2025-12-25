/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { IProductBatch } from '@/models/Product';
import { getStores, getStoresall } from '@/service/store';
import { getShops, getShopsall } from '@/service/shop';
import {
  getProductBatches,
  getUnitOfMeasuresByProductId
} from '@/service/Product';
import { createTransfer, updateTransfer } from '@/service/transfer';
import { useCallback, useEffect, useState } from 'react';
import { IconTrash } from '@tabler/icons-react';
import { ITransfer, TransferEntityType } from '@/models/transfer';
import { getAvailableProductsBySource } from '@/service/productBatchService';
import { IUnitOfMeasure } from '@/models/UnitOfMeasure';

// Zod schema
const formSchema = z.object({
  reference: z.string().optional(),
  sourceType: z.nativeEnum(TransferEntityType),
  sourceStoreId: z.string().optional(),
  sourceShopId: z.string().optional(),
  destinationType: z.nativeEnum(TransferEntityType),
  destStoreId: z.string().optional(),
  destShopId: z.string().optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product is required'),
        batchId: z.string().min(1, 'Batch is required'),
        unitOfMeasureId: z.string().min(1, 'Unit of measure is required'),
        quantity: z.number().min(1, 'Quantity must be greater than 0')
      })
    )
    .min(1, 'At least one item is required')
});

interface TransferFormProps {
  initialData: ITransfer | null;
  isEdit?: boolean;
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
  const [storeStockItems, setStoreStockItems] = useState<any[]>([]);
  const [batches, setBatches] = useState<{ [key: string]: IProductBatch[] }>(
    {}
  );
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<{
    [key: string]: IUnitOfMeasure[];
  }>({});
  const [isMounted, setIsMounted] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState<{
    [key: string]: boolean;
  }>({});
  const [loadingUOM, setLoadingUOM] = useState<{ [key: string]: boolean }>({});
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [initialItemsLoaded, setInitialItemsLoaded] = useState(false);
  const [loadingStoresShops, setLoadingStoresShops] = useState(true); // Add loading for stores/shops
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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
        unitOfMeasureId: item.unitOfMeasureId.toString(),
        quantity: Number(item.quantity)
      })) || [{ productId: '', batchId: '', unitOfMeasureId: '', quantity: 1 }]
    }
  });

  const sourceType = form.watch('sourceType');
  const sourceStoreId = form.watch('sourceStoreId');
  const sourceShopId = form.watch('sourceShopId');
  const destinationType = form.watch('destinationType');

  // Helper function to calculate available quantity in selected unit
  const calculateAvailableQuantity = (
    storeStockItem: any,
    selectedUnitOfMeasureId: string
  ) => {
    if (!storeStockItem || !selectedUnitOfMeasureId) return 0;

    const baseQuantity = storeStockItem.quantity;

    // Get the base conversion factor from the stock item's unit of measure
    const baseConversion = storeStockItem.unitOfMeasure?.conversionFactor || 1;

    // Find the selected unit of measure
    const selectedUnit = unitsOfMeasure[storeStockItem.product.id]?.find(
      (unit: IUnitOfMeasure) => unit.id === selectedUnitOfMeasureId
    );

    if (!selectedUnit) return baseQuantity;

    // Convert quantity to selected unit
    return baseQuantity * baseConversion;
  };

  // Helper function to get unique products from storeStockItems
  const getUniqueProducts = () => {
    const seenProductIds = new Set<string>();
    return storeStockItems.filter((item) => {
      if (!seenProductIds.has(item.product.id)) {
        seenProductIds.add(item.product.id);
        return true;
      }
      return false;
    });
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingStoresShops(true); // Start loading
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
        setLoadingStoresShops(false); // End loading
      }
    };
    fetchData();
  }, []);

  const fetchUnitsOfMeasure = useCallback(
    async (productId: string) => {
      if (!productId) return;

      if (!unitsOfMeasure[productId] && !loadingUOM[productId]) {
        setLoadingUOM((prev) => ({ ...prev, [productId]: true }));
        try {
          const uomData = await getUnitOfMeasuresByProductId(productId);

          if (Array.isArray(uomData)) {
            setUnitsOfMeasure((prev) => ({ ...prev, [productId]: uomData }));
          } else {
            setUnitsOfMeasure((prev) => ({
              ...prev,
              [productId]: uomData ? [uomData] : []
            }));
          }
        } catch  {
          toast.error('Failed to load units of measure');
          setUnitsOfMeasure((prev) => ({ ...prev, [productId]: [] }));
        } finally {
          setLoadingUOM((prev) => ({ ...prev, [productId]: false }));
        }
      }
    },
    [unitsOfMeasure, loadingUOM]
  );

  const fetchBatches = useCallback(
    async (productId: string) => {
      if (!batches[productId]) {
        setLoadingBatches((prev) => ({ ...prev, [productId]: true }));
        try {
          const batchData = await getProductBatches(productId);
          setBatches((prev) => ({ ...prev, [productId]: batchData }));
        } catch  {
          toast.error('Failed to load batches');
        } finally {
          setLoadingBatches((prev) => ({ ...prev, [productId]: false }));
        }
      }
    },
    [batches]
  );

  useEffect(() => {
    const fetchProductsFromSource = async () => {
      if (
        (sourceType === TransferEntityType.STORE && !sourceStoreId) ||
        (sourceType === TransferEntityType.SHOP && !sourceShopId)
      ) {
        setStoreStockItems([]);
        return;
      }

      setLoadingProducts(true);
      try {
        const sourceId =
          sourceType === TransferEntityType.STORE
            ? sourceStoreId
            : sourceShopId;
        if (!sourceId) return;

        const storeStockData = await getAvailableProductsBySource(
          sourceType,
          sourceId
        );
        setStoreStockItems(storeStockData);

        const productIds = Array.from(
          new Set(storeStockData.map((item: any) => item.product.id))
        );
        for (const productId of productIds as string[]) {
          await fetchUnitsOfMeasure(productId);
        }

        if (isEdit && !initialItemsLoaded) {
          const items = form.getValues('items');
          for (const item of items) {
            if (item.productId) {
              await fetchBatches(item.productId);
              await fetchUnitsOfMeasure(item.productId);
            }
          }
          setInitialItemsLoaded(true);
        }
      } catch {
        toast.error('Failed to load products from source');
        setStoreStockItems([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProductsFromSource();
  }, [
    sourceType,
    sourceStoreId,
    sourceShopId,
    form,
    isEdit,
    initialItemsLoaded,
    fetchUnitsOfMeasure,
    fetchBatches
  ]);

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

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        items: data.items.map((item) => ({
          ...item,
          quantity: Number(item.quantity)
        }))
      };

      let transferId: string | undefined;

      if (isEdit && initialData?.id) {
        const updatedTransfer = await updateTransfer(initialData.id, payload);
        transferId = updatedTransfer.id;
        toast.success('Transfer updated successfully');
        router.push(`/dashboard/Transfer/view?id=${initialData?.id}`);
      } else {
        const newTransfer = await createTransfer(payload);
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
                              unitOfMeasureId: '',
                              quantity: 1
                            }
                          ]);
                          setStoreStockItems([]);
                          setBatches({});
                          setUnitsOfMeasure({});
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
                                unitOfMeasureId: '',
                                quantity: 1
                              }
                            ]);
                            setStoreStockItems([]);
                            setBatches({});
                            setUnitsOfMeasure({});
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
                                unitOfMeasureId: '',
                                quantity: 1
                              }
                            ]);
                            setStoreStockItems([]);
                            setBatches({});
                            setUnitsOfMeasure({});
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
                  {loadingProducts && <div></div>}
                  <FormControl>
                    <div className='space-y-4'>
                      <div className='grid grid-cols-7 gap-4 text-sm font-semibold text-gray-700 dark:text-gray-300'>
                        <div>Product</div>
                        <div>Batch</div>
                        <div>Unit</div>
                        <div>Quantity</div>
                        <div>Available</div>
                        <div>Action</div>
                      </div>

                      {field.value.map((item, index) => {
                        const storeStockItem = storeStockItems.find(
                          (stock) =>
                            stock.product.id.toString() === item.productId &&
                            stock.batchId === item.batchId
                        );

                        const availableInSelectedUnit =
                          storeStockItem && item.unitOfMeasureId
                            ? calculateAvailableQuantity(
                                storeStockItem,
                                item.unitOfMeasureId
                              )
                            : storeStockItem?.quantity || 0;

                        const uniqueProducts = getUniqueProducts();
                        const productOptions =
                          isEdit && initialItemsLoaded
                            ? [
                                ...uniqueProducts.map((storeStockItem) => ({
                                  value: storeStockItem.product.id.toString(),
                                  label: `${storeStockItem.product.name}`,
                                  data: storeStockItem
                                })),
                                ...(item.productId &&
                                !uniqueProducts.some(
                                  (stock) =>
                                    stock.product.id.toString() ===
                                    item.productId
                                )
                                  ? [
                                      {
                                        value: item.productId,
                                        label: `[Current] ${initialData?.items.find((i) => i.productId.toString() === item.productId)?.product?.name || item.productId}`,
                                        data: null
                                      }
                                    ]
                                  : [])
                              ]
                            : uniqueProducts.map((storeStockItem) => ({
                                value: storeStockItem.product.id.toString(),
                                label: `${storeStockItem.product.name}`,
                                data: storeStockItem
                              }));

                        return (
                          <div
                            key={index}
                            className='grid grid-cols-7 items-center gap-4'
                          >
                            <div>
                              <Select
                                instanceId={`product-select-${index}`}
                                options={productOptions}
                                onChange={async (newValue) => {
                                  const newItems = [...field.value];
                                  newItems[index].productId =
                                    newValue?.value || '';
                                  newItems[index].batchId = '';
                                  newItems[index].unitOfMeasureId = '';
                                  newItems[index].quantity = 1;
                                  field.onChange(newItems);

                                  if (newValue?.value) {
                                    await fetchBatches(newValue.value);
                                    await fetchUnitsOfMeasure(newValue.value);
                                  }
                                }}
                                value={
                                  productOptions.find(
                                    (p) => p.value === item.productId
                                  ) || null
                                }
                                placeholder={
                                  loadingProducts
                                    ? 'Loading products...'
                                    : 'Search product'
                                }
                                isSearchable
                                isDisabled={loadingProducts}
                                isLoading={loadingProducts}
                                styles={isDark ? darkStyles : {}}
                              />
                            </div>

                            <div>
                              <Select
                                key={`batch-${item.productId}-${batches[item.productId]?.length || 0}`}
                                instanceId={`batch-select-${index}`}
                                options={storeStockItems
                                  .filter(
                                    (stock) =>
                                      stock.product.id.toString() ===
                                      item.productId
                                  )
                                  .map((stock) => ({
                                    value: stock.batchId.toString(),
                                    label: `${stock.batch.batchNumber}`
                                  }))}
                                onChange={(newValue) => {
                                  const newItems = [...field.value];
                                  newItems[index].batchId =
                                    newValue?.value || '';
                                  const selectedStock = storeStockItems.find(
                                    (stock) =>
                                      stock.batchId === newValue?.value &&
                                      stock.product.id.toString() ===
                                        item.productId
                                  );
                                  newItems[index].unitOfMeasureId =
                                    selectedStock?.unitOfMeasureId || '';
                                  field.onChange(newItems);
                                }}
                                value={
                                  storeStockItems
                                    .filter(
                                      (stock) =>
                                        stock.product.id.toString() ===
                                        item.productId
                                    )
                                    .map((stock) => ({
                                      value: stock.batchId.toString(),
                                      label: stock.batch.batchNumber
                                    }))
                                    .find((b) => b.value === item.batchId) ||
                                  null
                                }
                                placeholder={
                                  loadingBatches[item.productId]
                                    ? 'Loading...'
                                    : 'Select batch'
                                }
                                isSearchable
                                isDisabled={
                                  !item.productId ||
                                  loadingBatches[item.productId] ||
                                  loadingProducts
                                }
                                isLoading={loadingBatches[item.productId]}
                                styles={isDark ? darkStyles : {}}
                              />
                            </div>

                            <div>
                              <Select
                                instanceId={`unit-select-${index}`}
                                options={
                                  unitsOfMeasure[item.productId]?.map(
                                    (unit) => ({
                                      value: unit.id.toString(),
                                      label: `${unit.name}`
                                    })
                                  ) || []
                                }
                                onChange={(newValue) => {
                                  const newItems = [...field.value];
                                  newItems[index].unitOfMeasureId =
                                    newValue?.value || '';
                                  field.onChange(newItems);
                                }}
                                value={
                                  unitsOfMeasure[item.productId]
                                    ?.map((u) => ({
                                      value: u.id.toString(),
                                      label: `${u.name} `
                                    }))
                                    .find(
                                      (u) => u.value === item.unitOfMeasureId
                                    ) ||
                                  (unitsOfMeasure[item.productId]?.[0]
                                    ? {
                                        value:
                                          unitsOfMeasure[
                                            item.productId
                                          ][0].id.toString(),
                                        label: `${unitsOfMeasure[item.productId][0].name}`
                                      }
                                    : null)
                                }
                                placeholder={
                                  loadingUOM[item.productId]
                                    ? 'Loading...'
                                    : 'Search unit'
                                }
                                isSearchable
                                isDisabled={
                                  !item.productId ||
                                  loadingUOM[item.productId] ||
                                  loadingProducts
                                }
                                isLoading={loadingUOM[item.productId]}
                                styles={isDark ? darkStyles : {}}
                              />
                            </div>

                            <div>
                              <Input
                                type='number'
                                placeholder='Qty'
                                value={item.quantity}
                                min={1}
                                max={Math.floor(availableInSelectedUnit)}
                                onChange={(e) => {
                                  const newItems = [...field.value];
                                  const quantity = Number(e.target.value);
                                  const maxQuantity = Math.floor(
                                    availableInSelectedUnit
                                  );

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
                              ) : availableInSelectedUnit > 0 ? (
                                `${Math.floor(availableInSelectedUnit)} available`
                              ) : (
                                'Out of stock'
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
                                unitOfMeasureId: '',
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
                disabled={isLoading || loadingProducts}
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
