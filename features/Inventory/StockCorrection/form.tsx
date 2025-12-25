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
import { getStores } from '@/service/store';
import { getShops } from '@/service/shop';
import {
  getProductBatches,
  getUnitOfMeasuresByProductId
} from '@/service/Product';
import { useCallback, useEffect, useState } from 'react';
import { IconTrash } from '@tabler/icons-react';
import { getAvailableProductsBySource } from '@/service/productBatchService';
import { IProductBatch } from '@/models/Product';
import { IUnitOfMeasure } from '@/models/UnitOfMeasure';
import { IStockCorrection } from '@/models/StockCorrection';
import {
  createStockCorrection,
  updateStockCorrection
} from '@/service/StockCorrection';
import { TransferEntityType } from '@/models/transfer';

// Define types for form data
interface FormItemType {
  productId: string;
  batchId: string;
  unitOfMeasureId: string;
  quantity: number | string; // Allow string for free input
}

interface FormDataType {
  storeId: string;
  shopId: string;
  reason: 'PURCHASE_ERROR' | 'TRANSFER_ERROR' | 'EXPIRED' | 'DAMAGED' | 'MANUAL_ADJUSTMENT';
  reference: string;
  notes: string;
  items: FormItemType[];
}

interface StockCorrectionFormProps {
  initialData: IStockCorrection | null;
  isEdit?: boolean;
}

export default function StockCorrectionForm({
  initialData,
  isEdit = false
}: StockCorrectionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [stores, setStores] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
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
  const router = useRouter();

  // Initialize form without Zod
  const form = useForm<FormDataType>({
    defaultValues: {
      storeId: initialData?.storeId || '',
      shopId: initialData?.shopId || '',
      reason: initialData?.reason || 'MANUAL_ADJUSTMENT',
      reference: initialData?.reference || '',
      notes: initialData?.notes || '',
      items: initialData?.items?.map((item) => ({
        productId: item.productId.toString(),
        batchId: item.batchId?.toString() || '',
        unitOfMeasureId: item.unitOfMeasureId.toString(),
        quantity: Number(item.quantity)
      })) || [{ productId: '', batchId: '', unitOfMeasureId: '', quantity: 1 }]
    }
  });

  const locationType = form.watch('storeId') ? 'store' : 'shop';
  const locationId = form.watch('storeId') || form.watch('shopId');

  // Validation function
  const validateForm = (data: FormDataType) => {
    const errors: any = {};

    // Check if either store or shop is selected
    if (!data.storeId && !data.shopId) {
      errors.storeId = 'Either store or shop must be selected';
    }

    // Validate items
    if (!data.items || data.items.length === 0) {
      errors.items = 'At least one item is required';
    } else {
      data.items.forEach((item, index) => {
        if (!item.productId) {
          errors.items = errors.items || {};
          errors.items[index] = errors.items[index] || {};
          errors.items[index].productId = 'Product is required';
        }
        if (!item.unitOfMeasureId) {
          errors.items = errors.items || {};
          errors.items[index] = errors.items[index] || {};
          errors.items[index].unitOfMeasureId = 'Unit of measure is required';
        }
        if (item.quantity === '' || item.quantity === null || item.quantity === undefined) {
          errors.items = errors.items || {};
          errors.items[index] = errors.items[index] || {};
          errors.items[index].quantity = 'Quantity is required';
        } else if (typeof item.quantity === 'string') {
          const num = parseFloat(item.quantity);
          if (isNaN(num)) {
            errors.items = errors.items || {};
            errors.items[index] = errors.items[index] || {};
            errors.items[index].quantity = 'Quantity must be a valid number';
          }
        }
      });
    }

    return errors;
  };

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
    return (baseQuantity * baseConversion) / 1;
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
      try {
        const [storesData, shopsData] = await Promise.all([
          getStores(),
          getShops()
        ]);
        setStores(storesData);
        setShops(shopsData);
      } catch  {
        toast.error('Failed to load stores or shops');
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

  // Load units for initial items when editing
  useEffect(() => {
    if (isEdit && initialData && !initialItemsLoaded) {
      const loadInitialUnits = async () => {
        for (const item of initialData.items) {
          const productId = item.productId.toString();
          await fetchUnitsOfMeasure(productId);
        }
        setInitialItemsLoaded(true);
      };
      loadInitialUnits();
    }
  }, [isEdit, initialData, initialItemsLoaded, fetchUnitsOfMeasure]);

  useEffect(() => {
    const fetchProductsFromLocation = async () => {
      if (!locationId) {
        return;
      }

      setLoadingProducts(true);
      try {
        // Use the enum directly based on locationType
        const entityType =
          locationType === 'store'
            ? TransferEntityType.STORE
            : TransferEntityType.SHOP;

        const stockData = await getAvailableProductsBySource(
          entityType,
          locationId
        );

        setStoreStockItems(stockData);
      } catch  {
        toast.error('Failed to load products from location');
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProductsFromLocation();
  }, [
    locationType,
    locationId,
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

  const onSubmit = async (data: FormDataType) => {
    // Validate form
    const errors = validateForm(data);
    
    if (Object.keys(errors).length > 0) {
      // Set errors in react-hook-form
      Object.keys(errors).forEach((key) => {
        if (key === 'items') {
          // Handle nested errors for items
          Object.keys(errors.items).forEach((itemIndex) => {
            Object.keys(errors.items[itemIndex]).forEach((field) => {
              form.setError(`items.${itemIndex}.${field}` as any, {
                type: 'manual',
                message: errors.items[itemIndex][field]
              });
            });
          });
        } else {
          form.setError(key as any, {
            type: 'manual',
            message: errors[key]
          });
        }
      });
      return;
    }

    setIsLoading(true);
    try {
      // Convert quantity strings to numbers
      const payload = {
        ...data,
        items: data.items.map((item) => ({
          ...item,
          quantity: typeof item.quantity === 'string' ? parseFloat(item.quantity) : item.quantity
        }))
      };

      if (isEdit && initialData?.id) {
        await updateStockCorrection(initialData.id, payload);
        toast.success('Stock correction updated successfully');
      } else {
        await createStockCorrection(payload);
        toast.success('Stock correction created successfully');
      }

      router.push('/dashboard/StockCorrection');
      router.refresh();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'An error occurred while saving stock correction.';
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
            {isEdit ? 'Edit Stock Correction' : 'Create Stock Correction'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {isEdit ? 'Edit Stock Correction' : 'Create Stock Correction'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='storeId'
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Store (Optional)</FormLabel>
                    <ShadcnSelect
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (value) {
                          form.setValue('shopId', '');
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
                          <SelectValue placeholder='Select store' />
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
                    {fieldState.error && (
                      <p className='text-sm font-medium text-destructive'>
                        {fieldState.error.message}
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='shopId'
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Shop (Optional)</FormLabel>
                    <ShadcnSelect
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (value) {
                          form.setValue('storeId', '');
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
                          <SelectValue placeholder='Select shop' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {shops.map((shop) => (
                          <SelectItem key={shop.id} value={shop.id.toString()}>
                            {shop.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </ShadcnSelect>
                    {fieldState.error && (
                      <p className='text-sm font-medium text-destructive'>
                        {fieldState.error.message}
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='reason'
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <ShadcnSelect
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select reason' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='PURCHASE_ERROR'>
                          Purchase Error
                        </SelectItem>
                        <SelectItem value='TRANSFER_ERROR'>
                          Transfer Error
                        </SelectItem>
                        <SelectItem value='EXPIRED'>Expired</SelectItem>
                        <SelectItem value='DAMAGED'>Damaged</SelectItem>
                        <SelectItem value='MANUAL_ADJUSTMENT'>
                          Manual Adjustment
                        </SelectItem>
                      </SelectContent>
                    </ShadcnSelect>
                    {fieldState.error && (
                      <p className='text-sm font-medium text-destructive'>
                        {fieldState.error.message}
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='reference'
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Reference (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter reference' {...field} />
                    </FormControl>
                    {fieldState.error && (
                      <p className='text-sm font-medium text-destructive'>
                        {fieldState.error.message}
                      </p>
                    )}
                  </FormItem>
                )}
              />
            </div>

           <FormField
  control={form.control}
  name='items'
  render={({ field, fieldState }) => {
    // Cast fieldState.error to the correct type
    const itemsError = fieldState.error as any;
    
    return (
      <FormItem>
        <FormLabel>Items</FormLabel>
        {loadingProducts && <div></div>}
        <FormControl>
          <div className='space-y-4'>
            <div className='grid grid-cols-6 gap-4 text-sm font-semibold text-gray-700 dark:text-gray-300'>
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
                  (!item.batchId || stock.batchId === item.batchId)
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
                          stock.product.id.toString() === item.productId
                      )
                        ? [
                            {
                              value: item.productId,
                              label: `[Current] ${
                                initialData?.items.find(
                                  (i) => i.productId.toString() === item.productId
                                )?.product?.name || item.productId
                              }`,
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

              // Get the error for this specific item
              const itemError = itemsError?.[index];

              return (
                <div
                  key={index}
                  className='grid grid-cols-6 items-center gap-4'
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
                      styles={isDark ? darkStyles : {}}
                    />
                    {itemError?.productId && (
                      <p className='text-sm font-medium text-destructive mt-1'>
                        {itemError.productId.message}
                      </p>
                    )}
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
                          label: `${stock.batch?.batchNumber || 'N/A'}`
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
                            label: stock.batch?.batchNumber || 'N/A'
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
                        loadingBatches[item.productId]
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
                        // This handles the case where the unit exists in initial data but not yet in options
                        unitsOfMeasure[item.productId]
                          ?.map((u) => ({
                            value: u.id.toString(),
                            label: `${u.name} `
                          }))
                          .find(
                            (u) => u.value === item.unitOfMeasureId
                          ) ||
                        // Fallback: create a temporary option for the initial value
                        (item.unitOfMeasureId
                          ? {
                              value: item.unitOfMeasureId,
                              label: 'Loading...'
                            }
                          : null)
                      }
                      placeholder='Search unit'
                      isSearchable
                      isDisabled={!item.productId}
                      styles={isDark ? darkStyles : {}}
                    />
                    {itemError?.unitOfMeasureId && (
                      <p className='text-sm font-medium text-destructive mt-1'>
                        {itemError.unitOfMeasureId.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field: quantityField, fieldState: quantityFieldState }) => (
                        <div>
                          <Input
                            type='text'
                            inputMode='decimal'
                            placeholder='Qty'
                            value={quantityField.value.toString()}
                            onChange={(e) => {
                              const value = e.target.value;
                              
                              // Allow numbers, decimal point, and minus sign
                              const validPattern = /^-?\d*\.?\d*$/;
                              
                              if (validPattern.test(value)) {
                                quantityField.onChange(value);
                              }
                            }}
                            onBlur={(e) => {
                              const value = e.target.value;
                              if (value === '' || value === '-' || value === '.') {
                                // Set to 0 if empty or invalid
                                quantityField.onChange('0');
                              } else if (value.endsWith('.')) {
                                // Remove trailing decimal point
                                quantityField.onChange(value.slice(0, -1));
                              }
                            }}
                          />
                          <div className='mt-1 text-xs text-gray-500'>
                            {(() => {
                              const numValue = parseFloat(quantityField.value.toString());
                              if (isNaN(numValue)) {
                                return 'Enter valid number';
                              }
                              return numValue < 0 ? 'Subtraction' : numValue > 0 ? 'Addition' : 'Zero adjustment';
                            })()}
                          </div>
                          {quantityFieldState.error && (
                            <p className='text-sm font-medium text-destructive mt-1'>
                              {quantityFieldState.error.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  <div className='text-muted-foreground text-sm'>
                    {availableInSelectedUnit > 0
                      ? `${Math.floor(availableInSelectedUnit)} available`
                      : 'Out of stock'}
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
                      disabled={field.value.length <= 1}
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
                Add Item
              </Button>
            </div>
          </div>
        </FormControl>
        {fieldState.error && typeof fieldState.error === 'object' && 'message' in fieldState.error && (
          <p className='text-sm font-medium text-destructive'>
            {fieldState.error.message as string}
          </p>
        )}
      </FormItem>
    );
  }}
/>

            <FormField
              control={form.control}
              name='notes'
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter notes (optional)' {...field} />
                  </FormControl>
                  {fieldState.error && (
                    <p className='text-sm font-medium text-destructive'>
                      {fieldState.error.message}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <div className='flex justify-end gap-2'>
              <Button type='submit' disabled={isLoading || loadingProducts}>
                {isEdit ? 'Update' : 'Create'} Stock Correction
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}