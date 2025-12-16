'use client';

import { ColumnDef } from '@tanstack/react-table';
import { IStore } from '@/models/store';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { StoreCellAction } from './cell-action'; // Adjust path if needed

export const storeColumns: ColumnDef<IStore>[] = [
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
    cell: ({ row }) => <StoreCellAction data={row.original} />
  }
];
