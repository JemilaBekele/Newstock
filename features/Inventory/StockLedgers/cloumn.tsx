'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { CalendarDays, Package, User, FileText } from 'lucide-react';
import { IStockLedger, StockMovementType } from '@/models/store';

export const stockLedgerColumns: ColumnDef<IStockLedger>[] = [
  {
    accessorKey: 'batchId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Batch Number' />
    ),
    cell: ({ row }) => <div>{row.original.batch?.batchNumber ?? '-'}</div>,
    enableColumnFilter: true
  },
  {
    accessorKey: 'storeId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Store' />
    ),
    cell: ({ row }) => <div>{row.original.store?.name ?? '-'}</div>,
    enableColumnFilter: true
  },
  {
    accessorKey: 'shopId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Shop' />
    ),
    cell: ({ row }) => <div>{row.original.shop?.name ?? '-'}</div>,
    enableColumnFilter: true
  },
  {
    accessorKey: 'movementType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Movement Type' />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue<StockMovementType>();
      let colorClass = '';

      switch (value) {
        case 'IN':
          colorClass = 'text-green-600';
          break;
        case 'OUT':
          colorClass = 'text-red-600';
          break;
        case 'TRANSFER':
          colorClass = 'text-blue-600';
          break;
        case 'ADJUSTMENT':
          colorClass = 'text-yellow-600';
          break;
        case 'RETERN':
          colorClass = 'text-purple-600';
          break;
        default:
          colorClass = 'text-gray-600';
      }

      return (
        <div className={`flex items-center gap-1 ${colorClass}`}>
          <Package className='h-4 w-4' />
          {value}
        </div>
      );
    },
    enableColumnFilter: true
  },
  {
    accessorKey: 'quantity',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Quantity' />
    ),
    cell: ({ cell }) => (
      <div className='font-medium'>
        {cell.getValue<IStockLedger['quantity']>()}
      </div>
    )
  },
  {
    accessorKey: 'unitOfMeasureId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title=' Unit' />
    ),
    cell: ({ row }) => <div>{row.original.unitOfMeasure?.name ?? '-'}</div>,
    enableColumnFilter: true
  },
  {
    accessorKey: 'reference',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Reference' />
    ),
    cell: ({ cell }) => (
      <div className='text-muted-foreground flex items-center gap-1 text-sm'>
        <FileText className='h-4 w-4' />
        {cell.getValue<IStockLedger['reference']>() ?? '-'}
      </div>
    )
  },
  {
    accessorKey: 'userId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='User' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-1'>
        <User className='h-4 w-4' />
        {row.original.user?.name ?? row.original.userId ?? '-'}
      </div>
    )
  },
  {
    accessorKey: 'movementDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Movement Date' />
    ),
    cell: ({ cell }) => {
      const date = cell.getValue<IStockLedger['movementDate']>();
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
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ cell }) => {
      const date = cell.getValue<IStockLedger['createdAt']>();
      return (
        <div className='text-muted-foreground flex items-center gap-1 text-sm'>
          <CalendarDays className='h-4 w-4' />
          {date ? new Date(date).toLocaleDateString() : '-'}
        </div>
      );
    },
    enableColumnFilter: false
  }
];
