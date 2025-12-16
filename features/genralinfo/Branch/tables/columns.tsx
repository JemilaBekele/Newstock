'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { IBranch } from '@/models/Branch'; // Adjust path as needed
import { BranchCellAction } from './cell-action'; // Adjust path as needed
import { format } from 'date-fns';

export const branchColumns: ColumnDef<IBranch>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => <div>{row.original.name}</div>,
    enableColumnFilter: true
  },
  {
    accessorKey: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Address' />
    ),
    cell: ({ row }) => <div>{row.original.address || '-'}</div>,
    enableColumnFilter: true
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Phone' />
    ),
    cell: ({ row }) => <div>{row.original.phone || '-'}</div>,
    enableColumnFilter: true
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => <div>{row.original.email || '-'}</div>,
    enableColumnFilter: true
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ row }) => (
      <div>{format(new Date(row.original.createdAt), 'yyyy-MM-dd')}</div>
    ),
    enableColumnFilter: true
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Updated At' />
    ),
    cell: ({ row }) => (
      <div>{format(new Date(row.original.updatedAt), 'yyyy-MM-dd')}</div>
    ),
    enableColumnFilter: true
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <BranchCellAction data={row.original} />
  }
];
