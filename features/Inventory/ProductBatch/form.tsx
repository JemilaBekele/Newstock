'use client';

import React, { useState, useEffect } from 'react';
import { IStore } from '@/models/store';
import { IShop } from '@/models/shop';
import { getStores } from '@/service/store';
import { getShops } from '@/service/shop';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Copy } from 'lucide-react';
import { createProductBatch } from '@/service/Product';

interface ProductBatchFormProps {
  productId: string;
}

interface BatchFormData {
  batchNumber: string;
  expiryDate?: string;
  price?: number;
  stock?: number;
  warningQuantity?: number;
  storeId?: string;
}

const ProductBatchForm: React.FC<ProductBatchFormProps> = ({ productId }) => {
  const router = useRouter();
  const [batches, setBatches] = useState<BatchFormData[]>([
    {
      batchNumber: '',
      expiryDate: undefined,
      price: undefined,
      stock: undefined,
      warningQuantity: undefined,
      storeId: undefined
    }
  ]);
  const [stores, setStores] = useState<IStore[]>([]);
  const [shops, setShops] = useState<IShop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const storesResponse = await getStores();
        const shopsResponse = await getShops();
        setStores(storesResponse);
        setShops(shopsResponse);
      } catch (err) {
        setError('Failed to load required data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [productId, router]);

  const handleBatchChange = (batchIndex: number, field: string, value: any) => {
    setBatches((prev) =>
      prev.map((batch, index) =>
        index === batchIndex ? { ...batch, [field]: value } : batch
      )
    );
  };

  const handleDateSelect = (batchIndex: number, date: Date | undefined) => {
    handleBatchChange(
      batchIndex,
      'expiryDate',
      date ? format(date, 'yyyy-MM-dd') : undefined
    );
  };

  const addBatch = () => {
    setBatches((prev) => [
      ...prev,
      {
        batchNumber: '',
        expiryDate: undefined,
        price: undefined,
        stock: undefined,
        warningQuantity: undefined,
        storeId: undefined
      }
    ]);
  };

  const removeBatch = (index: number) => {
    if (batches.length > 1) {
      setBatches((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const duplicateBatch = (index: number) => {
    const batchToDuplicate = { ...batches[index] };
    setBatches((prev) => [
      ...prev,
      {
        ...batchToDuplicate,
        batchNumber: `${batchToDuplicate.batchNumber}-copy` || ''
      }
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const batchesData = batches.map((batch) => ({
        batchNumber: batch.batchNumber,
        expiryDate: batch.expiryDate,
        price: batch.price,
        stock: batch.stock,
        warningQuantity: batch.warningQuantity,
        storeId: batch.storeId
      }));

      await createProductBatch(productId, batchesData);
      setSuccess(`Successfully created ${batches.length} batch(es)`);
      setTimeout(() => {
        router.push(`/dashboard/Products`);
      }, 2000);
    } catch (err) {
      setError('Failed to create product batches');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && (stores.length === 0 || shops.length === 0)) {
    return <div>Loading form...</div>;
  }

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <span>Create Product Batches</span>
          <Button type='button' onClick={addBatch} variant='outline' size='sm'>
            <Plus className='mr-2 h-4 w-4' />
            Add Batch
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant='destructive' className='mb-4'>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert
            variant='default'
            className='mb-4 border-green-200 bg-green-50'
          >
            <AlertDescription className='text-green-800'>
              {success}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className='space-y-6'>
          {batches.map((batch, batchIndex) => (
            <div key={batchIndex} className='space-y-4 rounded-lg border p-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold'>
                  Batch {batchIndex + 1}
                </h3>
                <div className='flex space-x-2'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => duplicateBatch(batchIndex)}
                  >
                    <Copy className='mr-1 h-4 w-4' />
                    Duplicate
                  </Button>
                  {batches.length > 1 && (
                    <Button
                      type='button'
                      variant='destructive'
                      size='sm'
                      onClick={() => removeBatch(batchIndex)}
                    >
                      <Trash2 className='mr-1 h-4 w-4' />
                      Remove
                    </Button>
                  )}
                </div>
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                <div className='space-y-2'>
                  <Label htmlFor={`batchNumber-${batchIndex}`}>
                    Batch Number *
                  </Label>
                  <Input
                    id={`batchNumber-${batchIndex}`}
                    value={batch.batchNumber}
                    onChange={(e) =>
                      handleBatchChange(
                        batchIndex,
                        'batchNumber',
                        e.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor={`expiryDate-${batchIndex}`}>
                    Expiry Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        className='w-full justify-start text-left font-normal'
                      >
                        {batch.expiryDate
                          ? format(new Date(batch.expiryDate), 'PPP')
                          : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0'>
                      <Calendar
                        mode='single'
                        selected={
                          batch.expiryDate
                            ? new Date(batch.expiryDate)
                            : undefined
                        }
                        onSelect={(date) => handleDateSelect(batchIndex, date)}
                        initialFocus
                        captionLayout='dropdown'
                        fromYear={new Date().getFullYear()}
                        toYear={new Date().getFullYear() + 20}
                        className='rounded-md border shadow-sm'
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor={`price-${batchIndex}`}>
                    Purchase Price *
                  </Label>
                  <Input
                    type='number'
                    id={`price-${batchIndex}`}
                    min='0'
                    step='0.01'
                    value={batch.price ?? ''}
                    onChange={(e) =>
                      handleBatchChange(
                        batchIndex,
                        'price',
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor={`stock-${batchIndex}`}>Initial Stock *</Label>
                  <Input
                    type='number'
                    id={`stock-${batchIndex}`}
                    min='0'
                    value={batch.stock ?? ''}
                    onChange={(e) =>
                      handleBatchChange(
                        batchIndex,
                        'stock',
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor={`warningQuantity-${batchIndex}`}>
                    Warning Quantity
                  </Label>
                  <Input
                    type='number'
                    id={`warningQuantity-${batchIndex}`}
                    min='0'
                    value={batch.warningQuantity ?? ''}
                    onChange={(e) =>
                      handleBatchChange(
                        batchIndex,
                        'warningQuantity',
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor={`storeId-${batchIndex}`}>Store</Label>
                  <Select
                    value={batch.storeId || ''}
                    onValueChange={(value) =>
                      handleBatchChange(batchIndex, 'storeId', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select Store' />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id.toString()}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}

          <div className='flex justify-between'>
            <Button type='button' onClick={addBatch} variant='outline'>
              <Plus className='mr-2 h-4 w-4' />
              Add Another Batch
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Creating...' : `Create ${batches.length} Batch(es)`}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductBatchForm;
