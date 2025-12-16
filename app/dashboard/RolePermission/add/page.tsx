import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import AssPermissionViewPage from '@/features/RoleandPermisson/Permission/viewass';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard : Role Permissions'
};

export default async function Page() {
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <AssPermissionViewPage />
        </Suspense>
      </div>
    </PageContainer>
  );
}
