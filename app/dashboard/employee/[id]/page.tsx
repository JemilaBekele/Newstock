import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import PmployeeViewPage from '@/features/Employee/view';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard : Employee View'
};

type PageProps = { params: Promise<{ id: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <PmployeeViewPage id={params.id} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
