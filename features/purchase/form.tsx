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
import { IPurchase } from '@/models/purchase';
import { IProduct, IProductBatch } from '@/models/Product';
import { getStores } from '@/service/store';
import {
  getProductBatches,
  getProducts,
  getUnitOfMeasuresByProductId
} from '@/service/Product';
import { createPurchase, updatePurchase } from '@/service/purchase';
import { ISupplier } from '@/models/supplier';
import { getSupplier } from '@/service/supplier';
import { useCallback, useEffect, useState } from 'react';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import { Modal } from '@/components/ui/modal';
import CreateSupplierModal from './suppliyer';
import CreateProductBatchModal from './batchcreate';
import { IUnitOfMeasure } from '@/models/UnitOfMeasure';
import { format } from 'date-fns';

// TypeScript interfaces for form values
interface FormItemValues {
  productId: string;
  batchId: string;
  unitOfMeasureId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface FormValues {
  invoiceNo: string;
  supplierId: string;
  storeId: string;
  purchaseDate: string;
  paymentStatus: string;
  notes?: string;
  items: FormItemValues[];
}

interface PurchaseFormProps {
  initialData: IPurchase | null;
  isEdit?: boolean;
}

export default function PurchaseForm({
  initialData,
  isEdit = false
}: PurchaseFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [batches, setBatches] = useState<{ [key: string]: IProductBatch[] }>(
    {}
  );
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<{
    [key: string]: IUnitOfMeasure[];
  }>({});
  const [isMounted, setIsMounted] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedProductForBatch, setSelectedProductForBatch] =
    useState<string>('');
  const [loadingBatches, setLoadingBatches] = useState<{
    [key: string]: boolean;
  }>({});
  const [loadingUOM, setLoadingUOM] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();

  const form = useForm<FormValues>({
    defaultValues: {
      invoiceNo: initialData?.invoiceNo || '',
      supplierId: initialData?.supplierId?.toString() || '',
      storeId: initialData?.storeId?.toString() || '',
      purchaseDate: initialData?.purchaseDate
        ? new Date(initialData.purchaseDate).toISOString().split('T')[0]
        : format(new Date(), 'yyyy-MM-dd'),
      paymentStatus: initialData?.paymentStatus || 'PENDING',
      notes: initialData?.notes || '',
      items:
        initialData?.items?.map((item) => ({
          ...item,
          productId: item.productId.toString(),
          batchId: item.batchId.toString(),
          unitOfMeasureId: item.unitOfMeasureId.toString(),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice)
        })) || []
    }
  });

  // Calculate totals
  const items = form.watch('items');
  const grandTotal = items.reduce(
    (total, item) => total + item.quantity * item.unitPrice,
    0
  );
  const totalProducts = items.filter((item) => item.productId).length;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch suppliers, stores, products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersData, storesData, productsData] = await Promise.all([
          getSupplier(),
          getStores(),
          getProducts()
        ]);
        setSuppliers(suppliersData);
        setStores(storesData);
        setProducts(productsData);
      } catch  {
        toast.error('Failed to load suppliers, stores, or products');
      }
    };
    fetchData();
  }, []);

  // Add empty dependency arrays to useCallback to fix TS2554 / eslint warnings

  const fetchBatches = useCallback(
    async (productId: string) => {
      if (!productId) return;

      if (!batches[productId] && !loadingBatches[productId]) {
        setLoadingBatches((prev) => ({ ...prev, [productId]: true }));
        try {
          const batchData = await getProductBatches(productId);
          setBatches((prev) => ({ ...prev, [productId]: batchData || [] }));
        } catch  {
          toast.error('Failed to load batches');
          setBatches((prev) => ({ ...prev, [productId]: [] }));
        } finally {
          setLoadingBatches((prev) => ({ ...prev, [productId]: false }));
        }
      }
    },
    [batches, loadingBatches]
  );

  const fetchUnitsOfMeasure = useCallback(
    async (productId: string) => {
      if (!productId) return;

      if (!unitsOfMeasure[productId] && !loadingUOM[productId]) {
        setLoadingUOM((prev) => ({ ...prev, [productId]: true }));
        try {
          const uomData = await getUnitOfMeasuresByProductId(productId);

          // Handle different response formats
          let uomArray: IUnitOfMeasure[] = [];

          if (Array.isArray(uomData)) {
            uomArray = uomData;
          } else if (uomData && typeof uomData === 'object') {
            // Handle single object response
            uomArray = [uomData as IUnitOfMeasure];
          }

          setUnitsOfMeasure((prev) => ({ ...prev, [productId]: uomArray }));

          // If there's only one unit of measure, automatically select it
          if (uomArray.length === 1) {
            const currentItems = form.getValues('items');
            const updatedItems = currentItems.map((item) => {
              if (item.productId === productId && !item.unitOfMeasureId) {
                return {
                  ...item,
                  unitOfMeasureId: uomArray[0]?.id?.toString() || ''
                };
              }
              return item;
            });
            form.setValue('items', updatedItems);
          }
        } catch  {
          toast.error('Failed to load units of measure');
          setUnitsOfMeasure((prev) => ({ ...prev, [productId]: [] }));
        } finally {
          setLoadingUOM((prev) => ({ ...prev, [productId]: false }));
        }
      }
    },
    [unitsOfMeasure, loadingUOM, form]
  );

  // FIXED: Automatically fetch batches and UOM when product is selected
  useEffect(() => {
    items.forEach((item) => {
      if (
        item.productId &&
        !batches[item.productId] &&
        !loadingBatches[item.productId]
      ) {
        fetchBatches(item.productId);
      }
      if (
        item.productId &&
        !unitsOfMeasure[item.productId] &&
        !loadingUOM[item.productId]
      ) {
        fetchUnitsOfMeasure(item.productId);
      }
    });
  }, [
    items,
    batches,
    unitsOfMeasure,
    loadingBatches,
    loadingUOM,
    fetchBatches,
    fetchUnitsOfMeasure
  ]);

  const handleSupplierCreated = () => {
    setShowSupplierModal(false);
    getSupplier()
      .then(setSuppliers)
      .catch(() => {
        toast.error('Failed to refresh suppliers');
      });
  };

  const handleBatchCreated = async () => {
    setShowBatchModal(false);

    if (selectedProductForBatch) {
      try {
        setLoadingBatches((prev) => ({
          ...prev,
          [selectedProductForBatch]: true
        }));

        // Clear cached batches for this product
        setBatches((prev) => {
          const newBatches = { ...prev };
          delete newBatches[selectedProductForBatch];
          return newBatches;
        });

        // Fetch fresh batch data
        const batchData = await getProductBatches(selectedProductForBatch);
        setBatches((prev) => ({
          ...prev,
          [selectedProductForBatch]: batchData || []
        }));

        // Update form with the first batch if available
        if (batchData && batchData.length > 0) {
          const currentItems = form.getValues('items');
          const updatedItems = currentItems.map((item) => {
            if (item.productId === selectedProductForBatch && !item.batchId) {
              return { ...item, batchId: batchData[0]?.id?.toString() || '' };
            }
            return item;
          });
          form.setValue('items', updatedItems);
        }

        toast.success('Batch created successfully');
      } catch {
        toast.error('Failed to refresh batches');
      } finally {
        setLoadingBatches((prev) => ({
          ...prev,
          [selectedProductForBatch]: false
        }));
      }
    }
  };

  const openBatchModalForProduct = (productId: string) => {
    setSelectedProductForBatch(productId);
    setShowBatchModal(true);
  };

  const updateItemTotal = (index: number) => {
    const items = form.getValues('items');
    const item = items[index];
    const totalPrice = item.quantity * item.unitPrice;

    const updatedItems = [...items];
    updatedItems[index] = { ...item, totalPrice };
    form.setValue('items', updatedItems);
  };

  const validateForm = (data: FormValues): boolean => {
    let isValid = true;

    // Validate invoiceNo
    if (!data.invoiceNo || data.invoiceNo.trim() === '') {
      form.setError('invoiceNo', {
        type: 'manual',
        message: 'Invoice No is required'
      });
      isValid = false;
    }

    // Validate supplierId
    if (!data.supplierId || data.supplierId.trim() === '') {
      form.setError('supplierId', {
        type: 'manual',
        message: 'Supplier is required'
      });
      isValid = false;
    }

    // Validate storeId
    if (!data.storeId || data.storeId.trim() === '') {
      form.setError('storeId', {
        type: 'manual',
        message: 'Store is required'
      });
      isValid = false;
    }

    // Validate purchaseDate
    if (!data.purchaseDate || data.purchaseDate.trim() === '') {
      form.setError('purchaseDate', {
        type: 'manual',
        message: 'Purchase Date is required'
      });
      isValid = false;
    }

    // Validate paymentStatus
    if (!data.paymentStatus || data.paymentStatus.trim() === '') {
      form.setError('paymentStatus', {
        type: 'manual',
        message: 'Payment status is required'
      });
      isValid = false;
    }

    // Validate items
    if (data.items.length === 0) {
      form.setError('items', {
        type: 'manual',
        message: 'At least one item is required'
      });
      isValid = false;
    }

    // Validate each item
    data.items.forEach((item, index) => {
      // Validate productId
      if (!item.productId || item.productId.trim() === '') {
        form.setError(`items.${index}.productId` as any, {
          type: 'manual',
          message: 'Product is required'
        });
        isValid = false;
      }

      // Validate batchId
      if (!item.batchId || item.batchId.trim() === '') {
        form.setError(`items.${index}.batchId` as any, {
          type: 'manual',
          message: 'Batch is required'
        });
        isValid = false;
      }

      // Validate unitOfMeasureId
      if (!item.unitOfMeasureId || item.unitOfMeasureId.trim() === '') {
        form.setError(`items.${index}.unitOfMeasureId` as any, {
          type: 'manual',
          message: 'Unit of measure is required'
        });
        isValid = false;
      }

      // Validate quantity
      if (item.quantity <= 0 || isNaN(item.quantity)) {
        form.setError(`items.${index}.quantity` as any, {
          type: 'manual',
          message: 'Quantity must be greater than 0'
        });
        isValid = false;
      }

      // Validate unitPrice
      if (item.unitPrice < 0 || isNaN(item.unitPrice)) {
        form.setError(`items.${index}.unitPrice` as any, {
          type: 'manual',
          message: 'Unit price must be positive'
        });
        isValid = false;
      }

      // Validate totalPrice
      if (item.totalPrice < 0 || isNaN(item.totalPrice)) {
        form.setError(`items.${index}.totalPrice` as any, {
          type: 'manual',
          message: 'Total price must be positive'
        });
        isValid = false;
      }
    });

    return isValid;
  };

  const onSubmit = async (data: FormValues) => {
    // Clear all errors first
    form.clearErrors();

    // Validate form
    if (!validateForm(data)) {
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...data,
        items: data.items.map((item) => ({
          ...item,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice)
        }))
      };

      if (isEdit && initialData?.id) {
        await updatePurchase(initialData.id, payload);
        toast.success('Purchase updated successfully');
      } else {
        await createPurchase(payload);
        toast.success('Purchase created successfully');
      }
      router.push('/dashboard/purchase');
      router.refresh();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'An error occurred while saving purchase.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

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

  if (!isMounted) {
    return (
      <Card className='mx-auto w-full'>
        <CardHeader>
          <CardTitle className='text-left text-2xl font-bold'>
            {isEdit ? 'Edit Purchase' : 'Create Purchase'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className='mx-auto w-full'>
        <CardHeader>
          <CardTitle className='text-left text-2xl font-bold'>
            {isEdit ? 'Edit Purchase' : 'Create Purchase'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='invoiceNo'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice No</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter invoice number' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='supplierId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier</FormLabel>
                      <div className='flex gap-2'>
                        <div className='flex-1'>
                          <Select
                            instanceId='supplier-select'
                            options={suppliers.map((supplier) => ({
                              value: supplier?.id?.toString() ?? '',
                              label: supplier?.name ?? 'Unnamed Supplier'
                            }))}
                            onChange={(newValue) =>
                              field.onChange(newValue?.value || '')
                            }
                            value={suppliers
                              .map((s) => ({
                                value: s?.id?.toString() ?? '',
                                label: s?.name ?? 'Unnamed Supplier'
                              }))
                              .find((s) => s.value === field.value)}
                            placeholder='Search for a supplier'
                            isSearchable
                            styles={isDark ? darkStyles : {}}
                          />
                        </div>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => setShowSupplierModal(true)}
                        >
                          <IconPlus size={16} />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='storeId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store</FormLabel>
                      <ShadcnSelect
                        value={field.value}
                        onValueChange={(value: string) => field.onChange(value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select a store' />
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

                <FormField
                  control={form.control}
                  name='purchaseDate'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Date</FormLabel>
                      <FormControl>
                        <Input type='date' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='items'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Items</FormLabel>
                    <FormControl>
                      <div className='space-y-4'>
                        <div className='grid grid-cols-8 gap-4 text-sm font-semibold'>
                          <div>Product</div>
                          <div>Batch</div>
                          <div>Unit</div>
                          <div>Quantity</div>
                          <div>Purchase Price</div>
                          <div>Total</div>
                          <div>Action</div>
                        </div>

                        {field.value.map((item, index) => (
                          <div
                            key={index}
                            className='grid grid-cols-8 items-center gap-4'
                          >
                            {/* Product */}
                            <div>
                              <Select
                                instanceId={`product-select-${index}`}
                                options={products.map((product) => ({
                                  value: product.id.toString(),
                                  label: product.name
                                }))}
                                onChange={(newValue) => {
                                  const newItems = [...field.value];
                                  newItems[index].productId =
                                    newValue?.value || '';
                                  newItems[index].batchId = '';
                                  newItems[index].unitOfMeasureId = '';
                                  field.onChange(newItems);
                                  if (newValue?.value) {
                                    fetchBatches(newValue.value);
                                    fetchUnitsOfMeasure(newValue.value);
                                  }
                                }}
                                value={products
                                  .map((p) => ({
                                    value: p.id.toString(),
                                    label: p.name
                                  }))
                                  .find((p) => p.value === item.productId)}
                                placeholder='Search product'
                                isSearchable
                                styles={isDark ? darkStyles : {}}
                              />
                            </div>

                            {/* Batch */}
                            <div className='flex gap-2'>
                              <div className='flex-1'>
                                <Select
                                  key={`batch-${item.productId}-${batches[item.productId]?.length || 0}`}
                                  instanceId={`batch-select-${index}`}
                                  options={
                                    Array.isArray(batches[item.productId])
                                      ? batches[item.productId].map(
                                          (batch) => ({
                                            value: batch.id.toString(),
                                            label: `${batch.batchNumber}`
                                          })
                                        )
                                      : []
                                  }
                                  onChange={(newValue) => {
                                    const newItems = [...field.value];
                                    newItems[index].batchId =
                                      newValue?.value || '';
                                    field.onChange(newItems);
                                  }}
                                  value={
                                    Array.isArray(batches[item.productId])
                                      ? batches[item.productId]
                                          .map((b) => ({
                                            value: b.id.toString(),
                                            label: `${b.batchNumber}`
                                          }))
                                          ?.find(
                                            (b) => b.value === item.batchId
                                          )
                                      : undefined
                                  }
                                  placeholder={
                                    loadingBatches[item.productId]
                                      ? 'Loading batches...'
                                      : 'Select batch'
                                  }
                                  isSearchable
                                  isDisabled={
                                    !item.productId ||
                                    loadingBatches[item.productId]
                                  }
                                  isLoading={loadingBatches[item.productId]}
                                  styles={isDark ? darkStyles : {}}
                                  noOptionsMessage={() =>
                                    'No batches available'
                                  }
                                />
                              </div>
                              {item.productId && (
                                <Button
                                  type='button'
                                  variant='outline'
                                  size='sm'
                                  onClick={() =>
                                    openBatchModalForProduct(item.productId)
                                  }
                                  title='Create new batch'
                                  disabled={loadingBatches[item.productId]}
                                >
                                  {loadingBatches[item.productId] ? (
                                    <div className='animate-spin'>⟳</div>
                                  ) : (
                                    <IconPlus size={16} />
                                  )}
                                </Button>
                              )}
                            </div>

                            {/* Unit of Measure - FIXED: Added Array.isArray check */}
                            <div>
                              <Select
                                instanceId={`uom-select-${index}`}
                                options={
                                  Array.isArray(unitsOfMeasure[item.productId])
                                    ? unitsOfMeasure[item.productId].map(
                                        (uom) => ({
                                          value: uom.id.toString(),
                                          label: uom.name
                                        })
                                      )
                                    : []
                                }
                                onChange={(newValue) => {
                                  const newItems = [...field.value];
                                  newItems[index].unitOfMeasureId =
                                    newValue?.value || '';
                                  field.onChange(newItems);
                                }}
                                value={
                                  Array.isArray(unitsOfMeasure[item.productId])
                                    ? unitsOfMeasure[item.productId]
                                        .map((uom) => ({
                                          value: uom.id.toString(),
                                          label: uom.name
                                        }))
                                        ?.find(
                                          (u) =>
                                            u.value === item.unitOfMeasureId
                                        )
                                    : undefined
                                }
                                placeholder={
                                  loadingUOM[item.productId]
                                    ? 'Loading units...'
                                    : 'Select unit'
                                }
                                isSearchable
                                isDisabled={
                                  !item.productId ||
                                  loadingUOM[item.productId] ||
                                  (Array.isArray(
                                    unitsOfMeasure[item.productId]
                                  ) &&
                                    unitsOfMeasure[item.productId].length === 1)
                                }
                                isLoading={loadingUOM[item.productId]}
                                styles={isDark ? darkStyles : {}}
                                noOptionsMessage={() => 'No units available'}
                              />
                            </div>

                            {/* Quantity */}
                            <div>
                              <Input
                                type='number'
                                placeholder='Qty'
                                value={item.quantity}
                                onChange={(e) => {
                                  const newItems = [...field.value];
                                  const quantity = Number(e.target.value);
                                  newItems[index].quantity = isNaN(quantity)
                                    ? 0
                                    : quantity;
                                  newItems[index].totalPrice =
                                    newItems[index].quantity *
                                    newItems[index].unitPrice;
                                  field.onChange(newItems);
                                  updateItemTotal(index);
                                }}
                              />
                            </div>

                            {/* Unit Price */}
                            <div>
                              <Input
                                type='number'
                                placeholder='Price'
                                value={item.unitPrice}
                                onChange={(e) => {
                                  const newItems = [...field.value];
                                  const unitPrice = Number(e.target.value);
                                  newItems[index].unitPrice = isNaN(unitPrice)
                                    ? 0
                                    : unitPrice;
                                  newItems[index].totalPrice =
                                    newItems[index].quantity *
                                    newItems[index].unitPrice;
                                  field.onChange(newItems);
                                  updateItemTotal(index);
                                }}
                              />
                            </div>

                            {/* Total Price */}
                            <div className='flex items-center justify-center'>
                              <span className='text-sm font-medium'>
                                {(item.quantity * item.unitPrice).toFixed(2)}
                              </span>
                            </div>

                            {/* Delete Button */}
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
                        ))}

                        {/* Summary Row */}
                        <div className='grid grid-cols-8 items-center gap-4 border-t pt-4'>
                          <div className='col-span-4 text-right font-semibold'>
                            Summary:
                          </div>
                          <div></div>
                          <div className='text-center text-lg font-bold'>
                            {grandTotal.toFixed(2)}
                          </div>
                          <div></div>
                        </div>

                        <div className='grid grid-cols-8 items-center gap-4'>
                          <div className='col-span-7 text-sm'>
                            Total Products: {totalProducts}
                          </div>
                          <div className='text-right'>
                            <Button
                              type='button'
                              onClick={() => {
                                field.onChange([
                                  ...field.value,
                                  {
                                    productId: '',
                                    batchId: '',
                                    unitOfMeasureId: '',
                                    quantity: 1,
                                    unitPrice: 0,
                                    totalPrice: 0
                                  }
                                ]);
                              }}
                            >
                              Add Item
                            </Button>
                          </div>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Grand Total Display */}
              <div className='rounded-lg p-4'>
                <div className='flex items-center justify-between'>
                  <div className='text-lg font-semibold'>Grand Total</div>
                  <div className='text-2xl font-bold text-green-600'>
                    {grandTotal.toFixed(2)}
                  </div>
                </div>
              </div>

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
                <Button type='submit' disabled={isLoading}>
                  {isEdit ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Supplier Creation Modal */}
      <Modal
        isOpen={showSupplierModal}
        onClose={() => setShowSupplierModal(false)}
        title='Create New Supplier'
        description={''}
      >
        <CreateSupplierModal
          closeModal={() => setShowSupplierModal(false)}
          onSuccess={handleSupplierCreated}
        />
      </Modal>

      {/* Product Batch Creation Modal */}
      <Modal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        title='Create Product Batch'
        description={''}
      >
        <CreateProductBatchModal
          closeModal={() => setShowBatchModal(false)}
          initialProductId={selectedProductForBatch}
          onSuccess={handleBatchCreated}
        />
      </Modal>
    </>
  );
}