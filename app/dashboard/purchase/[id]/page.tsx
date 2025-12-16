import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import PurchaseViewPage from '@/features/purchase/view-page';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard :  Purchase'
};

type PageProps = { params: Promise<{ id: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <PurchaseViewPage purchaseId={params.id} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
