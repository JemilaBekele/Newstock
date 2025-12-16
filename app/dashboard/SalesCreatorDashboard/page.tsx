import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import SalesCreatorDashboard from '@/features/Dasboard/ReportSell/sellcreator';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard : my Sales Report'
};

export default async function SellPage() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <SalesCreatorDashboard />
        </Suspense>
      </div>
    </PageContainer>
  );
}
