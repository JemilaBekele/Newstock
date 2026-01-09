/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
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
  ArrowRightLeft
} from 'lucide-react';
import { ITransfer, ITransferItem, TransferStatus } from '@/models/transfer';
import {
  getTransferId,
  completeTransfer,
  cancelTransfer
} from '@/service/transfer';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { AlertModal } from '@/components/modal/alert-modal';
import { PermissionGuard } from '@/components/PermissionGuard';
import { PERMISSIONS } from '@/stores/permissions';
import { useSession } from 'next-auth/react';
import { getUserById } from '@/service/user'; // Add this import
import { Imployee } from '@/models/employee'; // Add this import

type TransferViewProps = {
  id?: string;
};

const TransferDetailPage: React.FC<TransferViewProps> = ({ id }) => {
  const { data: session } = useSession();
  const [transfer, setTransfer] = useState<ITransfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<TransferStatus>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [hasDestinationAccess, setHasDestinationAccess] = useState(false);
  const [userProfile, setUserProfile] = useState<Imployee | null>(null); // Add user profile state

  // Fetch user profile to get shops and stores
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user) return;
      
      try {
        const profile = await getUserById();
        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    if (session?.user) {
      fetchUserProfile();
    }
  }, [session]);

  const checkDestinationAccess = useCallback((transferData: ITransfer) => {
    if (!session?.user || !userProfile) {
      setHasDestinationAccess(false);
      return;
    }

    // Use the userProfile data which contains shops and stores
    const shops = (userProfile.shops as any[] | undefined) || [];
    const stores = (userProfile.stores as any[] | undefined) || [];
    
    console.log('DEBUG - Access Check:', {
      userShops: shops.map(s => ({ id: s.id, name: s.name })),
      userStores: stores.map(s => ({ id: s.id, name: s.name })),
      transferDest: {
        type: transferData.destinationType,
        storeId: transferData.destStore?.id,
        storeName: transferData.destStore?.name,
        shopId: transferData.destShop?.id,
        shopName: transferData.destShop?.name
      }
    });
    
    // Check access based on destination type
    if (transferData.destinationType === 'STORE' && transferData.destStore) {
      // Check if user has access to the destination store
      const hasStoreAccess = stores.some((store: any) => {
        // Try multiple comparison methods
        const matchById = store.id === transferData.destStore?.id;
        const matchByName = store.name === transferData.destStore?.name;
        const matchByStoreId = store.storeId === transferData.destStore?.id;
        
        console.log('Store comparison:', {
          storeId: store.id,
          storeName: store.name,
          destStoreId: transferData.destStore?.id,
          destStoreName: transferData.destStore?.name,
          matchById,
          matchByName,
          matchByStoreId
        });
        
        return matchById || matchByName || matchByStoreId;
      });
      
      console.log('Has store access:', hasStoreAccess);
      setHasDestinationAccess(hasStoreAccess);
      
      // If no access, check why
      if (!hasStoreAccess && stores.length > 0) {
        console.log('DEBUG - Store IDs for comparison:', {
          userStoreIds: stores.map(s => s.id),
          destStoreId: transferData.destStore?.id,
          userStoreNames: stores.map(s => s.name),
          destStoreName: transferData.destStore?.name
        });
      }
      
    } else if (transferData.destinationType === 'SHOP' && transferData.destShop) {
      // Check if user has access to the destination shop
      const hasShopAccess = shops.some((shop: any) => {
        // Try multiple comparison methods
        const matchById = shop.id === transferData.destShop?.id;
        const matchByName = shop.name === transferData.destShop?.name;
        
        console.log('Shop comparison:', {
          shopId: shop.id,
          shopName: shop.name,
          destShopId: transferData.destShop?.id,
          destShopName: transferData.destShop?.name,
          matchById,
          matchByName
        });
        
        return matchById || matchByName;
      });
      
      console.log('Has shop access:', hasShopAccess);
      setHasDestinationAccess(hasShopAccess);
    } else {
      console.log('No access - invalid destination type or missing data');
      setHasDestinationAccess(false);
    }
  }, [session, userProfile]);

  useEffect(() => {
    const fetchTransfer = async () => {
      try {
        if (id) {
          const transferData = await getTransferId(id);
          setTransfer(transferData);
          setSelectedStatus(transferData.status);
          
          // Check if user has access to destination
          checkDestinationAccess(transferData);
        }
      } catch (error) {
        console.error('Error fetching transfer:', error);
        toast.error('Failed to fetch transfer details');
      } finally {
        setLoading(false);
      }
    };

    if (id && session?.user) {
      fetchTransfer();
    }
  }, [id, refreshTrigger, checkDestinationAccess, session]);

  const handleStatusUpdate = async (action: 'complete' | 'cancel') => {
    if (!id) return;

    // Double-check access for completion
    if (action === 'complete' && !hasDestinationAccess) {
      toast.error('You do not have access to complete this transfer');
      return;
    }

    setUpdating(true);
    try {
      let updatedTransfer;
      if (action === 'complete') {
        updatedTransfer = await completeTransfer(id);
        setSelectedStatus(TransferStatus.COMPLETED);
        setIsCompleteModalOpen(false);
      } else {
        updatedTransfer = await cancelTransfer(id);
        setSelectedStatus(TransferStatus.CANCELLED);
        setIsCancelModalOpen(false);
      }

      setTransfer((prevTransfer) => ({
        ...updatedTransfer,
        items: prevTransfer?.items || updatedTransfer.items || []
      }));

      toast.success(`Transfer ${action}ed successfully`);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error(`Error ${action}ing transfer:`, error);
      toast.error(`Failed to ${action} transfer`);
    } finally {
      setUpdating(false);
    }
  };

  const openCompleteModal = () => {
    // Check access before opening modal
    if (!hasDestinationAccess) {
      toast.error('You do not have access to the destination shop/store');
      return;
    }
    setIsCompleteModalOpen(true);
  };

  const openCancelModal = () => {
    setIsCancelModalOpen(true);
  };

  // Show loading if still fetching user profile
  if (loading || !userProfile) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Loader2 className='mr-2 h-8 w-8 animate-spin' />
        <p>Loading transfer details...</p>
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <p>Transfer not found</p>
      </div>
    );
  }

  // Calculate total quantity
  const totalQuantity =
    transfer.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

  // Check if transfer is completed or cancelled
  const isImmutable =
    transfer.status === TransferStatus.COMPLETED ||
    transfer.status === TransferStatus.CANCELLED;

  return (
    <div className='container mx-auto space-y-6 p-4 md:p-8'>
      {/* Confirmation Modals */}
      <AlertModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        onConfirm={() => handleStatusUpdate('complete')}
        loading={updating}
        title='Complete Transfer'
        description='Are you sure you want to complete this transfer? This action cannot be undone.'
        confirmText='Complete Transfer'
        cancelText='Cancel'
        variant='default'
      />

      <AlertModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={() => handleStatusUpdate('cancel')}
        loading={updating}
        title='Cancel Transfer'
        description='Are you sure you want to cancel this transfer? This action cannot be undone.'
        confirmText='Cancel Transfer'
        cancelText='Go Back'
        variant='destructive'
      />

      {/* Transfer Status Update Section - Only show if not completed or cancelled */}
      {!isImmutable && (
        <Card className='shadow-lg'>
          <CardHeader>
            <CardTitle className='text-xl font-bold'>
              Update Transfer Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col items-start gap-4 sm:flex-row sm:items-center'>
              <div className='flex w-full gap-2 sm:w-auto'>
                {/* Complete Transfer Button - Conditionally shown based on destination access */}
                {hasDestinationAccess ? (
                  <PermissionGuard
                    requiredPermission={PERMISSIONS.TRANSFER.COMPLETE.name}
                  >
                    <Button
                      onClick={openCompleteModal}
                      disabled={
                        updating || transfer.status === TransferStatus.COMPLETED
                      }
                      className='w-full sm:w-auto'
                    >
                      {updating ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Completing...
                        </>
                      ) : (
                        <>
                          <Check className='mr-2 h-4 w-4' />
                          Complete Transfer
                        </>
                      )}
                    </Button>
                  </PermissionGuard>
                ) : (
                  // Show disabled button with tooltip or alternative message
                  <div className='relative group'>
                    <Button
                      disabled
                      className='w-full sm:w-auto opacity-50 cursor-not-allowed'
                    >
                      <Check className='mr-2 h-4 w-4' />
                      Complete Transfer
                    </Button>
                    <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10'>
                      No access to destination {transfer.destinationType?.toLowerCase()}
                    </div>
                  </div>
                )}

                {/* Cancel Transfer Button - Always visible if user has permission */}
                <PermissionGuard
                  requiredPermission={PERMISSIONS.TRANSFER.CANCEL.name}
                >
                  <Button
                    variant='destructive'
                    onClick={openCancelModal}
                    disabled={
                      updating || transfer.status === TransferStatus.CANCELLED
                    }
                    className='w-full sm:w-auto'
                  >
                    {updating ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <X className='mr-2 h-4 w-4' />
                        Cancel Transfer
                      </>
                    )}
                  </Button>
                </PermissionGuard>
              </div>

              {selectedStatus && selectedStatus !== transfer.status && (
                <Badge variant='outline' className='ml-2'>
                  Changing from {transfer.status} to {selectedStatus}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className='shadow-lg'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-2xl font-bold'>
            <ArrowRightLeft className='text-primary' />
            Transfer {transfer.reference || ''}
            <Badge
              variant={
                transfer.status === TransferStatus.COMPLETED
                  ? 'default'
                  : transfer.status === TransferStatus.CANCELLED
                    ? 'destructive'
                    : 'secondary'
              }
              className='ml-2'
            >
              {transfer.status === TransferStatus.COMPLETED ? (
                <>
                  <Check className='mr-1 h-3 w-3' /> {transfer.status}
                </>
              ) : transfer.status === TransferStatus.CANCELLED ? (
                <>
                  <X className='mr-1 h-3 w-3' /> {transfer.status}
                </>
              ) : (
                <>{transfer.status}</>
              )}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {/* Transfer Details */}
            <div className='space-y-4'>
              <h3 className='flex items-center gap-2 text-lg font-semibold'>
                <Info className='text-primary h-5 w-5' />
                Transfer Information
              </h3>
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <Package className='text-muted-foreground h-4 w-4' />
                  <p>
                    <span className='font-medium'>Reference:</span>{' '}
                    {transfer.reference || 'N/A'}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <Package className='text-muted-foreground h-4 w-4' />
                  <p>
                    <span className='font-medium'>Source:</span>{' '}
                    {transfer.sourceType === 'STORE'
                      ? (transfer.sourceStore?.name ?? 'Unknown Store')
                      : (transfer.sourceShop?.name ?? 'Unknown Shop')}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <Package className='text-muted-foreground h-4 w-4' />
                  <p>
                    <span className='font-medium'>Destination:</span>{' '}
                    {transfer.destinationType === 'STORE'
                      ? (transfer.destStore?.name ?? 'Unknown Store')
                      : (transfer.destShop?.name ?? 'Unknown Shop')}
                  </p>
                  {!hasDestinationAccess && (
                    <Badge variant="outline" className="text-xs">
                      No Access
                    </Badge>
                  )}
                </div>
                {transfer.createdBy && (
                  <div className='flex items-center gap-2'>
                    <User className='text-muted-foreground h-4 w-4' />
                    <p>
                      <span className='font-medium'>Initiated By:</span>{' '}
                      {transfer.createdBy.name ?? 'Unknown Employee'}
                    </p>
                  </div>
                )}
                {transfer.updatedBy && (
                  <div className='flex items-center gap-2'>
                    <User className='text-muted-foreground h-4 w-4' />
                    <p>
                      <span className='font-medium'>Approved By:</span>{' '}
                      {transfer.updatedBy.name ?? ''}
                    </p>
                  </div>
                )}
                {transfer.notes && (
                  <div>
                    <p className='font-medium'>Notes:</p>
                    <p className='text-muted-foreground'>{transfer.notes}</p>
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
                    {formatDate(transfer.createdAt)}
                  </p>
                </div>
                <div>
                  <p className='font-medium'>Updated At:</p>
                  <p className='text-muted-foreground'>
                    {formatDate(transfer.updatedAt)}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <Package className='text-muted-foreground h-4 w-4' />
                  <p>
                    <span className='font-medium'>Total Items:</span>{' '}
                    {transfer.items?.length || 0}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <Package className='text-muted-foreground h-4 w-4' />
                  <p>
                    <span className='font-medium'>Total Quantity:</span>{' '}
                    {totalQuantity}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transfer Items Table Section */}
         {transfer.items?.length > 0 && (
  <div className='space-y-4'>
    <h3 className='text-lg font-semibold'>Transfer Items</h3>
    
    {/* Desktop Table */}
    <div className='hidden md:block'>
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
          {transfer.items.map((item: ITransferItem) => (
            <TableRow key={item.id}>
              <TableCell className='font-medium'>
                {item.product?.name || 'Unknown Product'}
              </TableCell>
              <TableCell>
                {item.batch?.batchNumber || 'Unknown Batch'}
              </TableCell>
              <TableCell>
                {item.unitOfMeasure?.name || 'Unknown Unit'}
              </TableCell>
              <TableCell>{item.quantity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    {/* Mobile Cards */}
    <div className='md:hidden space-y-3'>
      {transfer.items.map((item: ITransferItem) => (
        <div 
          key={item.id} 
          className='bg-white border rounded-lg p-4 shadow-sm'
        >
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <p className='text-sm font-medium text-gray-500'>Product</p>
              <p className='font-medium'>{item.product?.name || 'Unknown Product'}</p>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-500'>Quantity</p>
              <p>{item.quantity}</p>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-500'>Batch</p>
              <p>{item.batch?.batchNumber || 'Unknown Batch'}</p>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-500'>Unit</p>
              <p>{item.unitOfMeasure?.name || 'Unknown Unit'}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransferDetailPage;