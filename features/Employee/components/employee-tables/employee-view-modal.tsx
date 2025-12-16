'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { IEmployee } from '@/models/employee';

interface EmployeeViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: IEmployee | null;
}

export const EmployeeViewModal: React.FC<EmployeeViewModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  if (!data) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-lg p-6'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold'>
            Employee Information
          </DialogTitle>
        </DialogHeader>

        {/* Basic Info */}
        <div className='grid grid-cols-2 gap-x-4 gap-y-2 text-sm'>
          <p className='font-medium'>Name:</p>
          <p>{data.name}</p>

          <p className='font-medium'>Email:</p>
          <p>{data.email}</p>

          <p className='font-medium'>Phone:</p>
          <p>{data.phone || 'N/A'}</p>

          <p className='font-medium'>Role:</p>
          <p>{data.role?.name || 'N/A'}</p>
          <p className='font-medium'>Branch:</p>
          <p>{data.branch?.name || 'N/A'}</p>
        </div>

        {/* Shops Section */}
        <div className='mt-5'>
          <h3 className='mb-1 text-sm font-semibold'>Assigned Shops</h3>
          {data.shops && data.shops.length > 0 ? (
            <ul className='ml-5 list-disc text-sm'>
              {data.shops.map((shop) => (
                <li key={shop.id}>{shop.name}</li>
              ))}
            </ul>
          ) : (
            <p className='text-muted-foreground text-sm'>No shops assigned</p>
          )}
        </div>

        {/* Stores Section */}
        <div className='mt-4'>
          <h3 className='mb-1 text-sm font-semibold'>Assigned Stores</h3>
          {data.stores && data.stores.length > 0 ? (
            <ul className='ml-5 list-disc text-sm'>
              {data.stores.map((store) => (
                <li key={store.id}>{store.name}</li>
              ))}
            </ul>
          ) : (
            <p className='text-muted-foreground text-sm'>No stores assigned</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
