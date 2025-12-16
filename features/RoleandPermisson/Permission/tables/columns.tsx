'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { RolePermissionCellAction } from './cell-action'; // Adjust path
import { IRolePermission } from '@/service/roleService';

export const rolePermissionColumns: ColumnDef<IRolePermission>[] = [
  {
    accessorKey: 'role.name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Role Name' />
    ),
    cell: ({ row }) => (
      <div className='font-medium'>{row.original.role?.name ?? '-'}</div>
    ),
    enableColumnFilter: true
  },
  {
    accessorKey: 'role.description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Role Description' />
    ),
    cell: ({ row }) => (
      <div className='text-muted-foreground'>
        {row.original.role?.description ?? '-'}
      </div>
    ),
    enableColumnFilter: true
  },
  {
    accessorKey: 'permission.name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Permission Name' />
    ),
    cell: ({ row }) => (
      <div className='font-medium'>{row.original.permission?.name ?? '-'}</div>
    ),
    enableColumnFilter: true
  },
  {
    accessorKey: 'permission.description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Permission Description' />
    ),
    cell: ({ row }) => (
      <div className='text-muted-foreground'>
        {row.original.permission?.description ?? '-'}
      </div>
    ),
    enableColumnFilter: true
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <RolePermissionCellAction data={row.original} />
  }
];
