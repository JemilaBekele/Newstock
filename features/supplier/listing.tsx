import { searchParamsCache } from '@/lib/searchparams';
import { getAllSuppliers } from '@/service/supplier';
import { supplierColumns } from './tables/columns';
import { DataTable } from '@/components/ui/table/data-table';

type SuppliersListingPageProps = object;

export default async function SuppliersListingPage({}: SuppliersListingPageProps) {
  // ────────────────────────────────────────────────────────────────
  // Query‑string inputs
  // ────────────────────────────────────────────────────────────────
  const page = searchParamsCache.get('page') || 1;
  const search = searchParamsCache.get('q') || '';
  const limit = searchParamsCache.get('limit') || 10;

  try {
    // Fetch data from API
    const { suppliers, totalCount } = await getAllSuppliers({ page, limit });

    // ────────────────────────────────────────────────────────────────
    // Client‑side search filter
    // ────────────────────────────────────────────────────────────────
    const filteredData = suppliers.filter((item) =>
      item.name?.toLowerCase().includes(search.toLowerCase())
    );

    // ────────────────────────────────────────────────────────────────
    // Client‑side pagination
    // ────────────────────────────────────────────────────────────────
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return (
      // eslint-disable-next-line react-hooks/error-boundaries
      <DataTable
        data={paginatedData}
        totalItems={totalCount}
        columns={supplierColumns}
      />
    );
  } catch  {
    return (
      <div className='p-4 text-red-500'>
        Error loading suppliers. Please try again later.
      </div>
    );
  }
}
