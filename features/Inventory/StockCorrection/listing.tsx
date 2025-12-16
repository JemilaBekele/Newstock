import { searchParamsCache } from '@/lib/searchparams';
import { stockCorrectionColumns } from './tables/columns';
import { DataTable } from '@/components/ui/table/data-table';
import { IStockCorrection } from '@/models/StockCorrection';
import { getAllStockCorrections } from '@/service/StockCorrection';

type StockCorrectionsListingPageProps = object;

export default async function StockCorrectionsListingPage({}: StockCorrectionsListingPageProps) {
  // ────────────────────────────────────────────────────────────────
  // Query‑string inputs
  // ────────────────────────────────────────────────────────────────
  const page = searchParamsCache.get('page') || 1;
  const search = searchParamsCache.get('q') || '';
  const limit = searchParamsCache.get('limit') || 10;

  try {
    // Fetch data from API
    const { data: stockCorrections, totalCount } = await getAllStockCorrections(
      { page, limit }
    );

    // ────────────────────────────────────────────────────────────────
    // Client‑side search filter (e.g., by reference or reason)
    // ────────────────────────────────────────────────────────────────
    const filteredData = (
      stockCorrections as unknown as IStockCorrection[]
    ).filter(
      (item) =>
        item.reference?.toLowerCase().includes(search.toLowerCase()) ||
        item.reason?.toLowerCase().includes(search.toLowerCase())
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
        columns={stockCorrectionColumns}
      />
    );
  } catch  {
    return (
      <div className='p-4 text-red-500'>
        Error loading stock corrections. Please try again later.
      </div>
    );
  }
}
