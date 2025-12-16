import { searchParamsCache } from '@/lib/searchparams';
import { DataTable } from '@/components/ui/table/data-table';
import { getAllRolePermissions } from '@/service/roleService';
import { rolePermissionColumns } from './tables/columns';

type PermissionListingPageProps = object;

export default async function RolePermissionListingPage({}: PermissionListingPageProps) {
  const page = Number(searchParamsCache.get('page')) || 1;
  const search = (searchParamsCache.get('q') || '').toLowerCase();
  const limit = Number(searchParamsCache.get('limit')) || 10;
  const startDate = searchParamsCache.get('startDate') || undefined;
  const endDate = searchParamsCache.get('endDate') || undefined;

  try {
    const { rolePermissions, totalCount } = await getAllRolePermissions({
      page,
      limit,
      startDate,
      endDate
    });

    // Client-side search filter on name or description
    const filteredData = rolePermissions.filter(
      (perm) =>
        perm.role?.name.toLowerCase().includes(search) ||
        (perm.permission?.name?.toLowerCase() ?? '').includes(search)
    );

    // Client-side pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return (
      // eslint-disable-next-line react-hooks/error-boundaries
      <DataTable
        data={paginatedData}
        totalItems={totalCount}
        columns={rolePermissionColumns}
      />
    );
  } catch  {
    return <div className='text-red-500'>Error loading permissions list.</div>;
  }
}
