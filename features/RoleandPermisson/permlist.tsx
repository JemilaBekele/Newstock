import { searchParamsCache } from '@/lib/searchparams';
import { DataTable } from '@/components/ui/table/data-table';
import { getAllPermissions } from '@/service/roleService';
import { permissionColumns } from './permcolumn';

export default async function PermissionListingPage() {
  const page = Number(searchParamsCache.get('page')) || 1;
  const search = searchParamsCache.get('q') || '';
  const limit = Number(searchParamsCache.get('limit')) || 10;

  try {
    const { permissions, totalCount } = await getAllPermissions({
      page,
      limit
    });

    // Optional client-side search filtering by name or description
    const filteredData = permissions.filter((perm) =>
      `${perm.name} ${perm.description ?? ''}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    // Pagination (slice filtered results)
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return (
      // eslint-disable-next-line react-hooks/error-boundaries
      <DataTable
        data={paginatedData}
        totalItems={totalCount}
        columns={permissionColumns}
      />
    );
  } catch  {
    return <div className='text-red-500'>Error loading permission list.</div>;
  }
}
