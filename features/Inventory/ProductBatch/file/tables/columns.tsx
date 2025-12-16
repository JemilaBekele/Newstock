'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { CalendarDays, Package, Hash } from 'lucide-react';
import { IProductBatch } from '@/models/Product';
import { ProductBatchCellAction } from './cell-action';

export const productBatchColumns: ColumnDef<IProductBatch>[] = [
  {
    accessorKey: 'batchNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Batch No.' />
    ),
    cell: ({ cell }) => (
      <div className='flex items-center gap-1'>
        <Hash className='text-muted-foreground h-4 w-4' />
        {cell.getValue<IProductBatch['batchNumber']>()}
      </div>
    ),
    enableColumnFilter: true
  },
  {
    accessorKey: 'product.name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Product' />
    ),
    cell: ({ row }) => {
      const product = row.original.product;
      return (
        <div className='flex items-center gap-2'>
          <Package className='text-muted-foreground h-4 w-4' />
          {product?.name ?? '-'}
        </div>
      );
    },
    enableColumnFilter: true
  },
  {
    accessorKey: 'expiryDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Expiry Date' />
    ),
    cell: ({ cell }) => {
      const date = cell.getValue<IProductBatch['expiryDate']>();
      return (
        <div className='text-muted-foreground flex items-center gap-1 text-sm'>
          <CalendarDays className='h-4 w-4' />
          {date ? new Date(date).toLocaleDateString() : '-'}
        </div>
      );
    },
    enableColumnFilter: false
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Price' />
    ),
    cell: ({ cell }) => (
      <div>{cell.getValue<IProductBatch['price']>() ?? '-'}</div>
    ),
    enableColumnFilter: false
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ cell }) => {
      const date = cell.getValue<IProductBatch['createdAt']>();
      return (
        <div className='text-muted-foreground flex items-center gap-1 text-sm'>
          <CalendarDays className='h-4 w-4' />
          {date ? new Date(date).toLocaleDateString() : '-'}
        </div>
      );
    },
    enableColumnFilter: false
  },
  {
    id: 'actions',
    cell: ({ row }) => <ProductBatchCellAction data={row.original} />
  }
];
