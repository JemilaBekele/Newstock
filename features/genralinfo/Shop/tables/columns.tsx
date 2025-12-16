'use client';

import { ColumnDef } from '@tanstack/react-table';
import { IShop } from '@/models/shop';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { ShopCellAction } from './cell-action'; // Adjust path if needed

export const shopColumns: ColumnDef<IShop>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => <div>{row.original.name}</div>,
    enableColumnFilter: true
  },

  {
    accessorKey: 'branch',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Branch' />
    ),
    cell: ({ row }) => <div>{row.original.branch?.name || '-'}</div>,
    enableColumnFilter: true
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <ShopCellAction data={row.original} />
  }
];
