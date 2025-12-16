import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { SalesReportsDataTable } from '@/features/Dasboard/ReportSell/staticgenerate';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard : Sale Reports'
};

export default async function SellPage() {
  return (
    <PageContainer scrollable={true}>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <SalesReportsDataTable />
        </Suspense>
      </div>
    </PageContainer>
  );
}
