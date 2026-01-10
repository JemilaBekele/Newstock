import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import SelectCorrectionsToCheckPage from '@/features/Shop/table/tables/select-to-check';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard : Sale Details'
};

type PageProps = { params: Promise<{ id: string }> };


export default async function Page(props: PageProps) {
  const params = await props.params;
  const id = params.id;
  console.log('id from props:', id);

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          {id ? <SelectCorrectionsToCheckPage sellId={id} /> : <FormCardSkeleton />}
        </Suspense>
      </div>
    </PageContainer>
  );
}