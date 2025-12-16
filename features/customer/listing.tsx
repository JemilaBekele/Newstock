import { searchParamsCache } from '@/lib/searchparams';
import { getAllCustomers } from '@/service/customer';
import { customerColumns } from './tables/columns';
import { DataTable } from '@/components/ui/table/data-table';

type CustomersListingPageProps = object;

export default async function CustomersListingPage({}: CustomersListingPageProps) {
  // ────────────────────────────────────────────────────────────────
  // Query‑string inputs
  // ────────────────────────────────────────────────────────────────
  const page = Number(searchParamsCache.get('page')) || 1;
  const search = searchParamsCache.get('q') || '';
  const limit = Number(searchParamsCache.get('limit')) || 10;

  try {
    // Fetch data from API
    const { customers, totalCount } = await getAllCustomers({ page, limit });

    // ────────────────────────────────────────────────────────────────
    // Client‑side search filter
    // ────────────────────────────────────────────────────────────────
    const filteredData = customers.filter((item) =>
      `${item.name} ${item.phone1} ${item.phone2}`
        .toLowerCase()
        .includes(search.toLowerCase())
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
        columns={customerColumns}
      />
    );
  } catch  {
    return (
      <div className='p-4 text-red-500'>
        Error loading customers. Please try again later.
      </div>
    );
  }
}
