import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import SupplierViewPage from '@/features/supplier/view-page';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard : Supplier'
};

type PageProps = { params: Promise<{ id: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <SupplierViewPage supplierId={params.id} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
