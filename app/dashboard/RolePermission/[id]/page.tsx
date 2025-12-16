import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import RolePermissionViewPage from '@/features/RoleandPermisson/Permission/view-page';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard : Role Permissions'
};

type PageProps = { params: Promise<{ id: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <RolePermissionViewPage id={params.id} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
