// 'use client';

// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage
// } from '@/components/ui/form';
// import { Input } from '@/components/ui/input';
// import { useForm, useFieldArray } from 'react-hook-form';
// import * as z from 'zod';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { toast } from 'sonner';
// import { useRouter } from 'next/navigation';
// import { useEffect, useMemo, useState } from 'react';
// import { ICustomer } from '@/models/customer';
// import { IShop } from '@/models/shop';
// import { getCustomer } from '@/service/customer';
// import { getShops, getAvailableBatchesByProductAndShop } from '@/service/shop';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { ISell, SaleStatus } from '@/models/Sell';
// import { IAdditionalPrice, IProduct, IProductBatch } from '@/models/Product';
// import { updateSell } from '@/service/Sell';

// // Form validation schema
// const formSchema = z.object({
//   customerId: z.string().min(1, 'Customer is required'),
//   saleStatus: z.nativeEnum(SaleStatus),
//   notes: z.string().optional(),
//   discount: z.coerce.number().min(0, 'Discount cannot be negative').optional(),
//   vat: z.coerce.number().min(0, 'VAT cannot be negative').optional(),
//   items: z.array(z.object({
//     id: z.string().optional(),
//     productId: z.string().min(1, 'Product is required'),
//     productName: z.string().min(1, 'Product name is required'),
//     shopId: z.string().min(1, 'Shop is required'),
//     shopName: z.string().min(1, 'Shop name is required'),
//     batchId: z.string().min(1, 'Batch is required'),
//     batchNumber: z.string().min(1, 'Batch number is required'),
//     quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
//     unitPrice: z.coerce.number().min(0, 'Price cannot be negative'),
//     totalPrice: z.coerce.number().min(0, 'Total price cannot be negative'),
//   })).min(1, 'At least one item is required')
// });

// // Types for the form
// type FormValues = z.infer<typeof formSchema>;

// interface SalesFormProps {
//   initialData: ISell | null;
//   pageTitle: string;
//   products: IProduct[];
// }

// export default function SalesUpdateForm({ initialData, pageTitle, products }: SalesFormProps) {
//   const router = useRouter();
//   const [customers, setCustomers] = useState<ICustomer[]>([]);
//   const [shops, setShops] = useState<IShop[]>([]);
//   const [batches, setBatches] = useState<IProductBatch[]>([]);
//   const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
//   const [selectedShop, setSelectedShop] = useState<IShop | null>(null);
//   const [selectedBatch, setSelectedBatch] = useState<IProductBatch | null>(null);
//   const [newItemQuantity, setNewItemQuantity] = useState<number>(1);
//   const [newItemUnitPrice, setNewItemUnitPrice] = useState<number>(0);
//   const [priceSelectionMode, setPriceSelectionMode] = useState<'base' | 'additional' | 'custom'>('base');
//   const [selectedAdditionalPrice, setSelectedAdditionalPrice] = useState<IAdditionalPrice | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Fetch customers and shops on component mount
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const [customersData, shopsData] = await Promise.all([
//           getCustomer(),
//           getShops()
//         ]);
//         setCustomers(customersData);
//         setShops(shopsData);
//       } catch (err) {
//         setError('Failed to fetch data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // Fetch batches when product and shop are selected for new item
//   useEffect(() => {
//     const fetchBatches = async () => {
//       if (!selectedShop || !selectedProduct) return;

//       try {
//         setLoading(true);
//         setError(null);
//         const batchesData = await getAvailableBatchesByProductAndShop(
//           selectedProduct.id,
//           selectedShop.id,
//         );
//         setBatches(batchesData as unknown as IProductBatch[]);

//         // Auto-select the first batch if available
//         if (Array.isArray(batchesData) && batchesData.length > 0) {
//           const firstBatch = batchesData[0] as unknown as IProductBatch;
//           setSelectedBatch(firstBatch);
//           setNewItemUnitPrice(firstBatch?.price || 0);
//         }
//       } catch (err) {
//         setError('Failed to fetch available batches');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (selectedShop && selectedProduct) {
//       fetchBatches();
//     }
//   }, [selectedShop, selectedProduct]);

//   // Get additional price options for selected batch
//   const getAdditionalPriceOptions = (): IAdditionalPrice[] => {
//     if (!selectedBatch || !selectedBatch.AdditionalPrice) return [];

//     // Filter prices that are either global (shopId: null) or specific to the selected shop
//     return selectedBatch.AdditionalPrice.filter(
//       (price: any) => price.shopId === null || price.shopId === selectedShop?.id
//     ) || [];
//   };

//   // Handle price selection mode change
//   const handlePriceModeChange = (mode: 'base' | 'additional' | 'custom') => {
//     setPriceSelectionMode(mode);

//     if (mode === 'base' && selectedBatch) {
//       setNewItemUnitPrice(selectedBatch.price || 0);
//       setSelectedAdditionalPrice(null);
//     } else if (mode === 'custom') {
//       setSelectedAdditionalPrice(null);
//     } else if (mode === 'additional' && getAdditionalPriceOptions().length > 0) {
//       const firstAdditionalPrice = getAdditionalPriceOptions()[0];
//       setSelectedAdditionalPrice(firstAdditionalPrice);
//       setNewItemUnitPrice(firstAdditionalPrice.price);
//     }
//   };

//   // Handle additional price selection
//   const handleAdditionalPriceChange = (priceId: string) => {
//     const additionalPrice = getAdditionalPriceOptions().find(price => price.id === priceId);
//     if (additionalPrice) {
//       setSelectedAdditionalPrice(additionalPrice);
//       setNewItemUnitPrice(additionalPrice.price);
//     }
//   };

//   // Calculate default values for the form
//   const defaultValues = useMemo(
//     () => ({
//       customerId: initialData?.customerId || '',
//       saleStatus: initialData?.saleStatus || SaleStatus.NOT_APPROVED,
//       notes: initialData?.notes || '',
//       discount: initialData?.discount || 0,
//       vat: initialData?.vat || 0,
//       items: initialData?.items?.map(item => ({
//         id: item.id,
//         productId: item.batch?.productId || '',
//         productName: item.batch?.product?.name || 'Unknown Product',
//         shopId: item.shopId || '',
//         shopName: item.shop?.name || 'Unknown Shop',
//         batchId: item.batchId || '',
//         batchNumber: item.batch?.batchNumber || 'Unknown Batch',
//         quantity: item.quantity || 1,
//         unitPrice: item.unitPrice || 0,
//         totalPrice: item.totalPrice || 0,
//       })) || []
//     }),
//     [initialData]
//   );

//   const form = useForm<FormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues
//   });

//   // Add useFieldArray hook
//   const { fields, append, remove, update } = useFieldArray({
//     control: form.control,
//     name: "items"
//   });

//   // Update item quantity and recalculate total price
//   const updateItemQuantity = (index: number, newQuantity: number) => {
//     const currentItem = fields[index];
//     if (currentItem) {
//       update(index, {
//         ...currentItem,
//         quantity: newQuantity,
//         totalPrice: newQuantity * currentItem.unitPrice
//       });
//     }
//   };

//   // Update item unit price and recalculate total price
//   const updateItemUnitPrice = (index: number, newUnitPrice: number) => {
//     const currentItem = fields[index];
//     if (currentItem) {
//       update(index, {
//         ...currentItem,
//         unitPrice: newUnitPrice,
//         totalPrice: newUnitPrice * currentItem.quantity
//       });
//     }
//   };

//   // Add new item to the form
//   const addNewItem = () => {
//     if (!selectedProduct || !selectedShop || !selectedBatch) {
//       toast.error('Please select product, shop, and batch');
//       return;
//     }

//     if (newItemQuantity < 1) {
//       toast.error('Quantity must be at least 1');
//       return;
//     }

//     const newItem = {
//       productId: selectedProduct.id,
//       productName: selectedProduct.name,
//       shopId: selectedShop.id,
//       shopName: selectedShop.name,
//       batchId: selectedBatch.id,
//       batchNumber: selectedBatch.batchNumber,
//       quantity: newItemQuantity,
//       unitPrice: newItemUnitPrice,
//       totalPrice: newItemQuantity * newItemUnitPrice
//     };

//     append(newItem);

//     // Reset new item form
//     setSelectedProduct(null);
//     setSelectedShop(null);
//     setSelectedBatch(null);
//     setNewItemQuantity(1);
//     setNewItemUnitPrice(0);
//     setPriceSelectionMode('base');
//     setSelectedAdditionalPrice(null);
//     setBatches([]);
//   };

//   // Calculate totals
//   const calculateTotals = () => {
//     const subTotal = fields.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
//     const discount = form.getValues('discount') || 0;
//     const vat = form.getValues('vat') || 0;
//     const grandTotal = subTotal - discount + vat;

//     return { subTotal, discount, vat, grandTotal };
//   };

//   const { subTotal, discount, vat, grandTotal } = calculateTotals();

//   // Submit the form
//   const onSubmit = async (data: FormValues) => {
//     if (!initialData?.id) {
//       toast.error('No sale ID found for update');
//       return;
//     }

//     try {
//       const sellData = {
//         ...data,
//         totalProducts: data.items.length,
//         subTotal,
//         discount,
//         vat,
//         grandTotal,
//         items: data.items.map(item => ({
//           id: item.id, // Include the ID for existing items
//           shopId: item.shopId,
//           batchId: item.batchId,
//           quantity: item.quantity,
//           unitPrice: item.unitPrice,
//           totalPrice: item.totalPrice
//         }))
//       };

//       await updateSell(initialData.id, sellData);
//       toast.success('Sale updated successfully');
//       router.refresh();
//       router.push('/dashboard/Sell');
//     } catch (error: any) {
//       toast.error(error?.message || 'Error updating sale');
//     }
//   };

//   if (loading) {
//     return <div className="flex justify-center items-center h-64">Loading...</div>;
//   }

//   if (error) {
//     return <div className="flex justify-center items-center h-64 text-red-500">{error}</div>;
//   }

//   if (!initialData) {
//     return <div className="flex justify-center items-center h-64">No sale data found</div>;
//   }

//   const additionalPriceOptions = getAdditionalPriceOptions();

//   return (
//     <Card className='mx-auto w-full'>
//       <CardHeader>
//         <CardTitle>{pageTitle}</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
//             {/* Customer and Basic Info */}
//             <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
//               <FormField
//                 control={form.control}
//                 name="customerId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Customer</FormLabel>
//                     <Select onValueChange={field.onChange} defaultValue={field.value}>
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select a customer" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         {customers.map((customer) => (
//                           <SelectItem key={customer.id} value={customer.id ?? ''}>
//                             {customer.name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="saleStatus"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Sale Status</FormLabel>
//                     <Select onValueChange={field.onChange} defaultValue={field.value}>
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select sale status" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         {Object.values(SaleStatus).map((status) => (
//                           <SelectItem key={status} value={status}>
//                             {status}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             {/* Add New Item Section */}
//             <div className='border rounded-lg p-4 space-y-4'>
//               <h3 className='text-lg font-medium'>Add New Item</h3>

//               <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
//                 {/* Product Selection */}
//                 <FormItem>
//                   <FormLabel>Product</FormLabel>
//                   <Select
//                     value={selectedProduct?.id || ''}
//                     onValueChange={(value) => {
//                       const product = products.find(p => p.id === value);
//                       setSelectedProduct(product || null);
//                     }}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select a product" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {products.map((product) => (
//                         <SelectItem key={product.id} value={product.id}>
//                           {product.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </FormItem>

//                 {/* Shop Selection */}
//                 <FormItem>
//                   <FormLabel>Shop</FormLabel>
//                   <Select
//                     value={selectedShop?.id || ''}
//                     onValueChange={(value) => {
//                       const shop = shops.find(s => s.id === value);
//                       setSelectedShop(shop || null);
//                     }}
//                     disabled={!selectedProduct}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select a shop" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {shops.map((shop) => (
//                         <SelectItem key={shop.id} value={shop.id}>
//                           {shop.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </FormItem>

//                 {/* Batch Selection */}
//                 <FormItem>
//                   <FormLabel>Batch</FormLabel>
//                   <Select
//                     value={selectedBatch?.id || ''}
//                     onValueChange={(value) => {
//                       const batch = batches.find(b => b.id === value);
//                       setSelectedBatch(batch || null);
//                       if (batch) {
//                         setNewItemUnitPrice(batch.price || 0);
//                         setPriceSelectionMode('base');
//                         setSelectedAdditionalPrice(null);
//                       }
//                     }}
//                     disabled={!selectedShop || !selectedProduct}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select a batch" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {batches.map((batch) => (
//                         <SelectItem key={batch.id} value={batch.id}>
//                           {batch.batchNumber} (${batch.price})
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </FormItem>
//               </div>

//               {selectedBatch && (
//                 <>
//                   {/* Price Selection Mode */}
//                   <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
//                     <FormItem>
//                       <FormLabel>Price Selection</FormLabel>
//                       <Select
//                         value={priceSelectionMode}
//                         onValueChange={(value: 'base' | 'additional' | 'custom') => handlePriceModeChange(value)}
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select price mode" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="base">Base Price (${selectedBatch.price})</SelectItem>
//                           {additionalPriceOptions.length > 0 && (
//                             <SelectItem value="additional">Additional Price</SelectItem>
//                           )}
//                           <SelectItem value="custom">Custom Price</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </FormItem>

//                     {/* Additional Price Selection */}
//                     {priceSelectionMode === 'additional' && additionalPriceOptions.length > 0 && (
//                       <FormItem>
//                         <FormLabel>Additional Price</FormLabel>
//                         <Select
//                           value={selectedAdditionalPrice?.id || ''}
//                           onValueChange={handleAdditionalPriceChange}
//                         >
//                           <SelectTrigger>
//                             <SelectValue placeholder="Select additional price" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {additionalPriceOptions.map((price) => (
//                               <SelectItem key={price.id} value={price.id}>
//                                 {price.label} (${price.price})
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                       </FormItem>
//                     )}

//                     {/* Custom Price Input */}
//                     {priceSelectionMode === 'custom' && (
//                       <FormItem>
//                         <FormLabel>Custom Price</FormLabel>
//                         <Input
//                           type="number"
//                           value={newItemUnitPrice}
//                           onChange={(e) => setNewItemUnitPrice(Math.max(0, parseFloat(e.target.value) || 0))}
//                           min="0"
//                           step="0.01"
//                         />
//                       </FormItem>
//                     )}
//                   </div>

//                   {/* Quantity and Total */}
//                   <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
//                     <FormItem>
//                       <FormLabel>Quantity</FormLabel>
//                       <Input
//                         type="number"
//                         value={newItemQuantity}
//                         onChange={(e) => setNewItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
//                         min="1"
//                       />
//                     </FormItem>

//                     <FormItem>
//                       <FormLabel>Unit Price</FormLabel>
//                       <Input
//                         type="number"
//                         value={newItemUnitPrice}
//                         onChange={(e) => setNewItemUnitPrice(Math.max(0, parseFloat(e.target.value) || 0))}
//                         min="0"
//                         step="0.01"
//                       />
//                     </FormItem>

//                     <FormItem>
//                       <FormLabel>Total Price</FormLabel>
//                       <Input
//                         value={(newItemQuantity * newItemUnitPrice).toFixed(2)}
//                         disabled
//                       />
//                     </FormItem>
//                   </div>
//                 </>
//               )}

//               <Button
//                 type="button"
//                 onClick={addNewItem}
//                 disabled={!selectedProduct || !selectedShop || !selectedBatch}
//                 className='w-full md:w-auto'
//               >
//                 Add Item to Sale
//               </Button>
//             </div>

//             {/* Items List */}
//             <div className='border rounded-lg p-4'>
//               <h3 className='text-lg font-medium mb-4'>Sale Items</h3>

//               {fields.map((item, index) => (
//                 <div key={item.id} className='border rounded p-4 mb-4'>
//                   <div className='grid grid-cols-1 gap-4 md:grid-cols-3 mb-4'>
//                     <div>
//                       <FormLabel>Product</FormLabel>
//                       <Input value={item.productName} disabled />
//                     </div>
//                     <div>
//                       <FormLabel>Shop</FormLabel>
//                       <Input value={item.shopName} disabled />
//                     </div>
//                     <div>
//                       <FormLabel>Batch Number</FormLabel>
//                       <Input value={item.batchNumber} disabled />
//                     </div>
//                   </div>

//                   <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
//                     <FormItem>
//                       <FormLabel>Quantity</FormLabel>
//                       <Input
//                         type="number"
//                         value={item.quantity}
//                         onChange={(e) => updateItemQuantity(index, Math.max(1, parseInt(e.target.value) || 1))}
//                         min="1"
//                       />
//                     </FormItem>

//                     <FormItem>
//                       <FormLabel>Unit Price</FormLabel>
//                       <Input
//                         type="number"
//                         value={item.unitPrice}
//                         onChange={(e) => updateItemUnitPrice(index, Math.max(0, parseFloat(e.target.value) || 0))}
//                         min="0"
//                         step="0.01"
//                       />
//                     </FormItem>

//                     <FormItem>
//                       <FormLabel>Total Price</FormLabel>
//                       <Input
//                         value={item.totalPrice.toFixed(2)}
//                         disabled
//                       />
//                     </FormItem>
//                   </div>

//                   <div className='mt-4'>
//                     <Button
//                       type="button"
//                       variant="destructive"
//                       size="sm"
//                       onClick={() => remove(index)}
//                     >
//                       Remove Item
//                     </Button>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Totals */}
//             <div className='border rounded-lg p-4'>
//               <h3 className='text-lg font-medium mb-4'>Totals</h3>

//               <div className='space-y-2'>
//                 <div className='flex justify-between'>
//                   <span>Subtotal:</span>
//                   <span>${subTotal.toFixed(2)}</span>
//                 </div>

//                 <FormField
//                   control={form.control}
//                   name="discount"
//                   render={({ field }) => (
//                     <FormItem className='flex justify-between items-center'>
//                       <FormLabel>Discount:</FormLabel>
//                       <div className='w-32'>
//                         <FormControl>
//                           <Input
//                             type="number"
//                             {...field}
//                             min="0"
//                             step="0.01"
//                           />
//                         </FormControl>
//                       </div>
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="vat"
//                   render={({ field }) => (
//                     <FormItem className='flex justify-between items-center'>
//                       <FormLabel>VAT:</FormLabel>
//                       <div className='w-32'>
//                         <FormControl>
//                           <Input
//                             type="number"
//                             {...field}
//                             min="0"
//                             step="0.01"
//                           />
//                         </FormControl>
//                       </div>
//                     </FormItem>
//                   )}
//                 />

//                 <div className='flex justify-between font-bold text-lg pt-2 border-t'>
//                   <span>Grand Total:</span>
//                   <span>${grandTotal.toFixed(2)}</span>
//                 </div>
//               </div>
//             </div>

//             {/* Notes */}
//             <FormField
//               control={form.control}
//               name="notes"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Notes</FormLabel>
//                   <FormControl>
//                     <Input {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Submit Button */}
//             <Button type='submit' className='w-full md:w-auto'>
//               Update Sale
//             </Button>
//           </form>
//         </Form>
//       </CardContent>
//     </Card>
//   );
// }
