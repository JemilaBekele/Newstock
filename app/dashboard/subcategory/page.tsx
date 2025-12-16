import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import SubCategoriesListingPage from '@/features/Inventory/subcategory/listing';
import { searchParamsCache } from '@/lib/searchparams';
import SubCategoryModal from '@/features/Inventory/subcategory/view-page';

import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { PERMISSIONS } from '@/stores/permissions';
import ItemTableAction from '@/features/genralinfo/Branch/tableaction';

export const metadata = {
  title: 'Dashboard: Subcategory'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function SubcategoryPage({ searchParams }: PageProps) {
  const parsedParams = await searchParams;
  searchParamsCache.parse(parsedParams);

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Subcategory Management'
            description='Manage subcategory information and records.'
          />

          <PermissionGuard
            requiredPermission={PERMISSIONS.SUBCATEGORY.CREATE.name}
          >
            <SubCategoryModal />
          </PermissionGuard>
        </div>
        <Separator />
        <Suspense
          fallback={
            <DataTableSkeleton columnCount={6} rowCount={8} filterCount={2} />
          }
        >
          {' '}
          <ItemTableAction />
          <SubCategoriesListingPage />
        </Suspense>
      </div>
    </PageContainer>
  );
}
