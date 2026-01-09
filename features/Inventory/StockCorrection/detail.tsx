/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';
import { toast } from 'sonner';
import {
  Package,
  Calendar,
  User,
  Info,
  Check,
  X,
  Loader2,
  AlertTriangle,
  MapPin
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  approveStockCorrection,
  getStockCorrectionId,
  rejectStockCorrection
} from '@/service/StockCorrection';
import {
  IStockCorrection,
  IStockCorrectionItem,
  StockCorrectionReason,
  StockCorrectionStatus
} from '@/models/StockCorrection';
import { PermissionGuard } from '@/components/PermissionGuard';
import { PERMISSIONS } from '@/stores/permissions';

type StockCorrectionViewProps = {
  id?: string;
};

const StockCorrectionDetailPage: React.FC<StockCorrectionViewProps> = ({
  id
}) => {
  const [stockCorrection, setStockCorrection] =
    useState<IStockCorrection | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchStockCorrection = useCallback(
    async () => {
      try {
        if (id) {
          const stockCorrectionData = await getStockCorrectionId(id);
          setStockCorrection(stockCorrectionData);
        }
      } catch  {
        toast.error('Failed to fetch stock correction details');
      } finally {
        setLoading(false);
      }
    },
    [id] // ✅ Added dependencies array
  );

  useEffect(() => {
    fetchStockCorrection();
  }, [fetchStockCorrection, id]);

const handleApprove = async () => {
  if (!id) return;

  setUpdating(true);
  try {
    const updatedStockCorrection = await approveStockCorrection(id);
    setStockCorrection(updatedStockCorrection);
    toast.success('Stock correction approved successfully');
    await fetchStockCorrection();
  } catch (error: any) { // Add error parameter
    console.error('Backend error:', error); // Log the error
    
    // Check for specific error messages
    if (error?.message?.includes('Insufficient stock')) {
      toast.error('Insufficient stock available. Please check stock levels.');
    } else if (error?.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error('Failed to approve stock correction');
    }
  } finally {
    setUpdating(false);
  }
};
  const handleReject = async () => {
    if (!id) return;

    setUpdating(true);
    try {
      const updatedStockCorrection = await rejectStockCorrection(id);
      setStockCorrection(updatedStockCorrection);
      toast.success('Stock correction rejected successfully');

      // Refresh the data to ensure we have the latest state
      await fetchStockCorrection();
    } catch  {
      toast.error('Failed to reject stock correction');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Loader2 className='mr-2 h-8 w-8 animate-spin' />
        <p>Loading stock correction details...</p>
      </div>
    );
  }

  if (!stockCorrection) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <p>Stock correction not found</p>
      </div>
    );
  }

  // Check if stock correction is approved or rejected
  const isImmutable =
    stockCorrection.status === StockCorrectionStatus.APPROVED ||
    stockCorrection.status === StockCorrectionStatus.REJECTED;

  // Get badge variant based on status
  const getStatusVariant = (status: StockCorrectionStatus) => {
    switch (status) {
      case StockCorrectionStatus.APPROVED:
        return 'default';
      case StockCorrectionStatus.REJECTED:
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Get reason display text
  const getReasonText = (reason: StockCorrectionReason) => {
    switch (reason) {
      case 'PURCHASE_ERROR':
        return 'Purchase Error';
      case 'TRANSFER_ERROR':
        return 'Transfer Error';
      case 'EXPIRED':
        return 'Expired';
      case 'DAMAGED':
        return 'Damaged';
      case 'MANUAL_ADJUSTMENT':
        return 'Manual Adjustment';
      default:
        return reason;
    }
  };

  return (
    <div className='container mx-auto space-y-6 p-4 md:p-8'>
      {/* Stock Correction Status Update Section - Only show if pending */}
      {!isImmutable && (
        <Card className='shadow-lg'>
          <CardHeader>
            <CardTitle className='text-xl font-bold'>
              Review Stock Correction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col items-start gap-4 sm:flex-row sm:items-center'>
              <div className='flex w-full gap-2 sm:w-auto'>
                <PermissionGuard
                  requiredPermission={PERMISSIONS.STOCK_CORRECTION.APPROVE.name}
                >
                  <Button
                    onClick={handleApprove}
                    disabled={updating}
                    className='w-full sm:w-auto'
                  >
                    {updating ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Approving...
                      </>
                    ) : (
                      <>
                        <Check className='mr-2 h-4 w-4' />
                        Approve Correction
                      </>
                    )}
                  </Button>
                </PermissionGuard>
                <PermissionGuard
                  requiredPermission={PERMISSIONS.STOCK_CORRECTION.REJECT.name}
                >
                  <Button
                    variant='destructive'
                    onClick={handleReject}
                    disabled={updating}
                    className='w-full sm:w-auto'
                  >
                    {updating ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <X className='mr-2 h-4 w-4' />
                        Reject Correction
                      </>
                    )}
                  </Button>
                </PermissionGuard>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Correction Details Card */}
      <Card className='shadow-lg'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-2xl font-bold'>
            <AlertTriangle className='text-primary' />
            Stock Correction {stockCorrection.reference || ''}
            <Badge
              variant={getStatusVariant(stockCorrection.status)}
              className='ml-2'
            >
              {stockCorrection.status === StockCorrectionStatus.APPROVED ? (
                <>
                  <Check className='mr-1 h-3 w-3' /> {stockCorrection.status}
                </>
              ) : stockCorrection.status === StockCorrectionStatus.REJECTED ? (
                <>
                  <X className='mr-1 h-3 w-3' /> {stockCorrection.status}
                </>
              ) : (
                <>{stockCorrection.status}</>
              )}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {/* Stock Correction Details */}
            <div className='space-y-4'>
              <h3 className='flex items-center gap-2 text-lg font-semibold'>
                <Info className='text-primary h-5 w-5' />
                Correction Information
              </h3>
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <AlertTriangle className='text-muted-foreground h-4 w-4' />
                  <p>
                    <span className='font-medium'>Reference:</span>{' '}
                    {stockCorrection.reference || 'N/A'}
                  </p>
                </div>
 {/* Location - Store or Shop */}
{(stockCorrection.store?.name || stockCorrection.shop?.name) && (
  <div className='flex items-start gap-2'>
    <MapPin className='text-muted-foreground mt-0.5 h-4 w-4 shrink-0' />
    <div className='space-y-1'>
      <p className='text-sm font-medium'>
        {stockCorrection.store?.name ? 'Store' : 'Shop'}
      </p>
      <p className='text-muted-foreground'>
        {stockCorrection.store?.name || stockCorrection.shop?.name}
        {stockCorrection.store?.branch?.name && 
          ` (${stockCorrection.store.branch.name})`}
        {stockCorrection.shop?.branch?.name && 
          ` (${stockCorrection.shop.branch.name})`}
      </p>
    </div>
  </div>
)}

                <div className='flex items-center gap-2'>
                  <AlertTriangle className='text-muted-foreground h-4 w-4' />
                  <p>
                    <span className='font-medium'>Type:</span>
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <AlertTriangle className='text-muted-foreground h-4 w-4' />
                  <p>
                    <span className='font-medium'>Reason:</span>{' '}
                    {getReasonText(stockCorrection.reason)}
                  </p>
                </div>
                {stockCorrection.purchaseId && (
                  <div className='flex items-center gap-2'>
                    <Package className='text-muted-foreground h-4 w-4' />
                    <p>
                      <span className='font-medium'>Purchase:</span>{' '}
                      {stockCorrection.purchase?.invoiceNo ||
                        stockCorrection.purchaseId}
                    </p>
                  </div>
                )}
                {stockCorrection.transferId && (
                  <div className='flex items-center gap-2'>
                    <Package className='text-muted-foreground h-4 w-4' />
                    <p>
                      <span className='font-medium'>Transfer:</span>{' '}
                      {stockCorrection.transfer?.reference ||
                        stockCorrection.transferId}
                    </p>
                  </div>
                )}
                {stockCorrection.createdBy && (
                  <div className='flex items-center gap-2'>
                    <User className='text-muted-foreground h-4 w-4' />
                    <p>
                      <span className='font-medium'>Created By:</span>{' '}
                      {stockCorrection.createdBy.name ?? 'Unknown Employee'}
                    </p>
                  </div>
                )}
                {stockCorrection.updatedBy && (
                  <div className='flex items-center gap-2'>
                    <User className='text-muted-foreground h-4 w-4' />
                    <p>
                      <span className='font-medium'>Updated By:</span>{' '}
                      {stockCorrection.updatedBy.name ?? 'Unknown Employee'}
                    </p>
                  </div>
                )}
                {stockCorrection.notes && (
                  <div>
                    <p className='font-medium'>Notes:</p>
                    <p className='text-muted-foreground'>
                      {stockCorrection.notes}
                    </p>
                  </div>
                )}
               
              </div>
            </div>

            {/* Date Details */}
            <div className='space-y-4'>
              <h3 className='flex items-center gap-2 text-lg font-semibold'>
                <Calendar className='text-primary h-5 w-5' />
                Date Details
              </h3>
              <div className='space-y-2'>
                <div>
                  <p className='font-medium'>Created At:</p>
                  <p className='text-muted-foreground'>
                    {formatDate(stockCorrection.createdAt)}
                  </p>
                </div>
                <div>
                  <p className='font-medium'>Updated At:</p>
                  <p className='text-muted-foreground'>
                    {formatDate(stockCorrection.updatedAt)}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <Package className='text-muted-foreground h-4 w-4' />
                  <p>
                    <span className='font-medium'>Total Items:</span>{' '}
                    {stockCorrection.items?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stock Correction Items Table Section */}
          {stockCorrection.items?.length > 0 && (
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Correction Items</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockCorrection.items.map((item: IStockCorrectionItem) => (
                    <TableRow key={item.id}>
                      <TableCell className='font-medium'>
                        {item.product?.name || 'Unknown Product'}
                      </TableCell>
                      <TableCell>{item.batch?.batchNumber || 'N/A'}</TableCell>
                      <TableCell>
                        {item.unitOfMeasure?.name || 'Unknown Unit'}
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center'>{item.quantity}</div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StockCorrectionDetailPage;
