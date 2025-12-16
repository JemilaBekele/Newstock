'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { CalendarDays } from 'lucide-react';
import { ISubCategory } from '@/models/Category';
import { SubCategoryCellAction } from './cell-action';

export const subCategoryColumns: ColumnDef<ISubCategory>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='SubCategory Name' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<ISubCategory['name']>()}</div>,
    enableColumnFilter: true
  },
  {
    accessorKey: 'category', // points to the nested object
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Category Name' />
    ),
    cell: ({ cell }) => {
      const category = cell.getValue<ISubCategory['category']>();
      return <div>{category?.name ?? '-'}</div>;
    },
    enableColumnFilter: true
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ cell }) => {
      const date = cell.getValue<ISubCategory['createdAt']>();
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
    cell: ({ row }) => <SubCategoryCellAction data={row.original} />
  }
];
