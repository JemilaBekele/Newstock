// File: employee-tables/employee-columns.tsx
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { IEmployee } from '@/models/employee';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';

import { CellAction } from './cell-action';

export const employeeColumns: ColumnDef<IEmployee>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ cell }) => (
      <div className='font-medium'>{cell.getValue<IEmployee['name']>()}</div>
    )
    // meta: {
    //   label: 'Name',
    //   placeholder: 'Search employees...',
    //   variant: 'text', // This should match your filter input type
    //   icon: User
    // },
    // enableColumnFilter: true,
    // filterFn: 'includesString' // Explicitly set the filter function
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Role' />
    ),
    cell: ({ row }) => {
      // Access the role name safely
      const roleName = row.original.role?.name ?? 'No Role';
      return <div>{roleName}</div>;
    },
    enableColumnFilter: true
  },

  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<IEmployee['email']>()}</div>
    // meta: {
    //   label: 'Email',
    //   placeholder: 'Filter emails...',
    //   variant: 'text', // This should match your filter input type
    //   icon: Mail
    // },
    // enableColumnFilter: true,
    // filterFn: 'includesString' // Explicitly set the filter function
  },

  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Phone' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<IEmployee['phone']>()}</div>
  },

  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
