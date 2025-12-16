import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import TransferBatchPriceForm from '@/features/transfer/createaddprice';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard : Transfer detail page'
};

type PageProps = {
  searchParams: Promise<{ transferId?: string }>; // Update to reflect searchParams as a Promise
};

export default async function LeasePage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams; // Await searchParams
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <TransferBatchPriceForm
            transferId={resolvedSearchParams.transferId}
          />
        </Suspense>
      </div>
    </PageContainer>
  );
}
