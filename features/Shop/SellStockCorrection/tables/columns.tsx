'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { CalendarDays } from 'lucide-react';
import { StockCorrectionCellAction } from './cell-action';
import { ISellStockCorrection } from '@/models/SellStockCorrection';

export const stockCorrectionColumns: ColumnDef<ISellStockCorrection>[] = [
  {
    accessorKey: 'reference',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Reference' />
    ),
    cell: ({ cell }) => (
      <div>{cell.getValue<ISellStockCorrection['reference']>() ?? '-'}</div>
    ),
    enableColumnFilter: true
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ cell }) => (
      <div>{cell.getValue<ISellStockCorrection['status']>()}</div>
    ),
    enableColumnFilter: true
  },
  {
    accessorKey: 'notes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Notes' />
    ),
    cell: ({ cell }) => (
      <div className='max-w-50 truncate'>
        {cell.getValue<ISellStockCorrection['notes']>() ?? '-'}
      </div>
    ),
    enableColumnFilter: false
  },
  {
    accessorKey: 'createdBy',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created By' />
    ),
    cell: ({ cell }) => (
      <div>
        {cell.getValue<ISellStockCorrection['createdBy']>()?.name ?? '-'}
      </div>
    ),
    enableColumnFilter: true
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ cell }) => {
      const date = cell.getValue<ISellStockCorrection['createdAt']>();
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
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Updated At' />
    ),
    cell: ({ cell }) => {
      const date = cell.getValue<ISellStockCorrection['updatedAt']>();
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
    cell: ({ row }) => <StockCorrectionCellAction data={row.original} />
  }
];
