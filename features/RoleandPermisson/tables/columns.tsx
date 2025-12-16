'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { RoleCellAction } from './cell-action'; // Replace with your actual path
import { IRole } from '@/service/roleService';

export const roleColumns: ColumnDef<IRole>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Role Name' />
    ),
    cell: ({ row }) => <div className='font-medium'>{row.original.name}</div>,
    enableColumnFilter: true
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ row }) => (
      <div className='text-muted-foreground'>
        {row.original.description || '-'}
      </div>
    ),
    enableColumnFilter: true
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <RoleCellAction data={row.original} />
  }
];
