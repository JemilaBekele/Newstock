import { searchParamsCache } from '@/lib/searchparams';
import { getAllProducts } from '@/service/Product';
import { productColumns } from './tables/columns';
import { DataTable } from '@/components/ui/table/data-table';

type ProductsListingPageProps = object;

export default async function ProductsListingPage({}: ProductsListingPageProps) {
  // ────────────────────────────────────────────────────────────────
  // Query-string inputs
  // ────────────────────────────────────────────────────────────────
  const page = searchParamsCache.get('page') || 1;
  const search = searchParamsCache.get('q') || '';
  const limit = searchParamsCache.get('limit') || 10;

  try {
    // Fetch data from API
    const { products, totalCount } = await getAllProducts({ page, limit });

    // ────────────────────────────────────────────────────────────────
    // Client-side search filter
    // ────────────────────────────────────────────────────────────────
    const filteredData = products.filter((item) =>
      item.name?.toLowerCase().includes(search.toLowerCase())
    );

    // ────────────────────────────────────────────────────────────────
    // Client-side pagination
    // ────────────────────────────────────────────────────────────────
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return (
      // eslint-disable-next-line react-hooks/error-boundaries
      <DataTable
        data={paginatedData}
        totalItems={totalCount}
        columns={productColumns}
      />
    );
  } catch  {
    return (
      <div className='p-4 text-red-500'>
        Error loading products. Please try again later.
      </div>
    );
  }
}
