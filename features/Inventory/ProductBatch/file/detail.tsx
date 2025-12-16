'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Package, Calendar, Info, DollarSign, Boxes } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { Loader2 } from 'lucide-react';
import { getProductBatchId } from '@/service/productBatchService';
import { IProductBatch } from '@/models/Product';

type ProductBatchViewProps = {
  id?: string;
};

const ProductBatchDetailPage: React.FC<ProductBatchViewProps> = ({ id }) => {
  const [batch, setBatch] = useState<IProductBatch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductBatch = async () => {
      try {
        if (id) {
          const batchData = await getProductBatchId(id);
          setBatch(batchData);
        }
      } catch  {
        toast.error('Failed to fetch product batch details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductBatch();
  }, [id]);

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Loader2 className='mr-2 h-8 w-8 animate-spin' />
        <p>Loading product batch details...</p>
      </div>
    );
  }

  if (!batch || !id) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <p>Product batch not found</p>
      </div>
    );
  }

  return (
    <div className='container mx-auto space-y-6 p-4 md:p-8'>
      <Card className='shadow-lg'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-2xl font-bold'>
            <Package className='text-primary' />
            Product Batch {batch.batchNumber || ''}
            <Badge variant='secondary' className='ml-2'>
              {batch.stock ? `${batch.stock} in stock` : 'Stock unavailable'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <div className='space-y-4'>
              <h3 className='flex items-center gap-2 text-lg font-semibold'>
                <Info className='text-primary h-5 w-5' />
                Batch Information
              </h3>
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <Package className='text-muted-foreground h-4 w-4' />
                  <p>
                    <span className='font-medium'>Batch Number:</span>{' '}
                    {batch.batchNumber || 'N/A'}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <Package className='text-muted-foreground h-4 w-4' />
                  <p>
                    <span className='font-medium'>Product:</span>{' '}
                    {batch.product?.name || 'Unknown Product'}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <Package className='text-muted-foreground h-4 w-4' />
                  <p>
                    <span className='font-medium'>Store:</span>{' '}
                    {batch.storeId || 'Unknown Store'}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <DollarSign className='text-muted-foreground h-4 w-4' />
                  <p>
                    <span className='font-medium'>Price:</span>{' '}
                    {typeof batch.price === 'number'
                      ? `$${batch.price.toFixed(2)}`
                      : 'N/A'}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <Boxes className='text-muted-foreground h-4 w-4' />
                  <p>
                    <span className='font-medium'>Stock:</span>{' '}
                    {batch.stock || 'N/A'}
                  </p>
                </div>
                {batch.warningQuantity && (
                  <div className='flex items-center gap-2'>
                    <Boxes className='text-muted-foreground h-4 w-4' />
                    <p>
                      <span className='font-medium'>Warning Quantity:</span>{' '}
                      {batch.warningQuantity}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className='space-y-4'>
              <h3 className='flex items-center gap-2 text-lg font-semibold'>
                <Calendar className='text-primary h-5 w-5' />
                Date & Unit Details
              </h3>
              <div className='space-y-2'>
                <div>
                  <p className='font-medium'>Created At:</p>
                  <p className='text-muted-foreground'>
                    {formatDate(batch.createdAt)}
                  </p>
                </div>
                <div>
                  <p className='font-medium'>Updated At:</p>
                  <p className='text-muted-foreground'>
                    {formatDate(batch.updatedAt)}
                  </p>
                </div>
                {batch.expiryDate && (
                  <div>
                    <p className='font-medium'>Expiry Date:</p>
                    <p className='text-muted-foreground'>
                      {formatDate(batch.expiryDate)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductBatchDetailPage;
