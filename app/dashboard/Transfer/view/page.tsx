import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import TransferDetailPage from '@/features/transfer/detail';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard : Transfer detail page'
};

type PageProps = {
  searchParams: Promise<{ id?: string }>; // Update to reflect searchParams as a Promise
};

export default async function LeasePage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams; // Await searchParams
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <TransferDetailPage id={resolvedSearchParams.id} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
