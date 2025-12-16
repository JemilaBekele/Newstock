'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { IPermission } from '@/service/roleService';

export const permissionColumns: ColumnDef<IPermission>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Permission Name' />
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
  }
];
