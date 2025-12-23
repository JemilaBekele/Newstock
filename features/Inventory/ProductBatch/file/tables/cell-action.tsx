'use client';

import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import { PermissionGuard } from '@/components/PermissionGuard';
import { PERMISSIONS } from '@/stores/permissions';

import { IconEdit, IconDotsVertical, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { deleteProductBatch } from '@/service/productBatchService';
import { IProductBatch } from '@/models/Product';
import { Edit } from 'lucide-react';

interface ProductBatchCellActionProps {
  data: IProductBatch;
}

export const ProductBatchCellAction: React.FC<ProductBatchCellActionProps> = ({
  data
}) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const onConfirm = async () => {
    if (!data?.id) {
      toast.error('Batch ID is missing. Cannot delete batch.');
      return;
    }

    setLoading(true);
    try {
      await deleteProductBatch(data.id);
      setOpen(false);
      router.refresh();
      toast.success('Batch deleted successfully');
    } catch  {
      toast.error('Error deleting batch. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Batch Actions</DropdownMenuLabel>

          <PermissionGuard
            requiredPermission={PERMISSIONS.PRODUCT_BATCH.UPDATE.name}
          >
            <DropdownMenuItem
              onClick={() => router.push(`/dashboard/ProductBatch/${data.id}`)}
            >
              <IconEdit className='mr-2 h-4 w-4' /> Update
            </DropdownMenuItem>
          </PermissionGuard>

           <PermissionGuard
            requiredPermission={PERMISSIONS.PRODUCT_BATCH.VIEW.name}
          >
          <DropdownMenuItem
            onClick={() =>
              router.push(`/dashboard/ProductBatch/view?id=${data.id}`)
            }
          >
            <Edit className='mr-2 h-4 w-4' /> View
          </DropdownMenuItem>
          </PermissionGuard>


          <PermissionGuard
            requiredPermission={PERMISSIONS.PRODUCT_BATCH.DELETE.name}
          >
            <DropdownMenuItem onClick={() => setOpen(true)}>
              <IconTrash className='mr-2 h-4 w-4' /> Delete
            </DropdownMenuItem>
          </PermissionGuard>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
