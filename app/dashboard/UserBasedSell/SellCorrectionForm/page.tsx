import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import UserSellViewPage from '@/features/Shop/userbased/viewSellStocorr';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard : Sale Details'
};

type PageProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function ProductPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const id = resolvedSearchParams?.id;

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          {id ? <UserSellViewPage sellId={id} /> : <FormCardSkeleton />}
        </Suspense>
      </div>
    </PageContainer>
  );
}
