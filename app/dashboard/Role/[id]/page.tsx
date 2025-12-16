import PageContainer from '@/components/layout/page-container';
import EditRolePermissionForm from '@/features/RoleandPermisson/Permission/edit';

export const metadata = {
  title: 'Dashboard : Edit Role Permissions'
};

export default function Page() {
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <EditRolePermissionForm />
      </div>
    </PageContainer>
  );
}
