import { searchParamsCache } from '@/lib/searchparams';
import { productBatchColumns } from './tables/columns';
import { DataTable } from '@/components/ui/table/data-table';
import { IProductBatch } from '@/models/Product';
import { getAllProductBatches } from '@/service/productBatchService';

type ProductBatchesListingPageProps = object;

export default async function ProductBatchesListingPage({}: ProductBatchesListingPageProps) {
  // ────────────────────────────────────────────────────────────────
  // Query-string inputs
  // ────────────────────────────────────────────────────────────────
  const page = searchParamsCache.get('page') || 1;
  const search = searchParamsCache.get('q') || '';
  const limit = searchParamsCache.get('limit') || 10;

  try {
    // Fetch data from API
    const { data: productBatches, totalCount } = await getAllProductBatches({
      page,
      limit
    });

    // ────────────────────────────────────────────────────────────────
    // Client-side search filter (on batchNumber or product name)
    // ────────────────────────────────────────────────────────────────
    const filteredData = productBatches.filter(
      (item: IProductBatch) =>
        item.batchNumber?.toLowerCase().includes(search.toLowerCase()) ||
        item.product?.name?.toLowerCase().includes(search.toLowerCase())
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
        columns={productBatchColumns}
      />
    );
  } catch  {
    return (
      <div className='p-4 text-red-500'>
        Error loading product batches. Please try again later.
      </div>
    );
  }
}
