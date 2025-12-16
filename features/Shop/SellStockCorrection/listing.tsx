/* eslint-disable react-hooks/error-boundaries */
import { searchParamsCache } from '@/lib/searchparams';
import { DataTable } from '@/components/ui/table/data-table';
import { getAllSellStockCorrections } from '@/service/SellStockCorrection';
import { stockCorrectionColumns } from './tables/columns';
import { ISellStockCorrection } from '@/models/SellStockCorrection';

type StockCorrectionListingPageProps = object;

export default async function StockCorrectionListingPage({}: StockCorrectionListingPageProps) {
  // ────────────────────────────────────────────────────────────────
  // Query‑string inputs
  // ────────────────────────────────────────────────────────────────
  const page = Number(searchParamsCache.get('page')) || 1;
  const search = searchParamsCache.get('q') || '';
  const limit = Number(searchParamsCache.get('limit')) || 10;

  try {
    // Fetch data from API
    const { data, totalCount } = await getAllSellStockCorrections({
      page,
      limit
    });

    // ────────────────────────────────────────────────────────────────
    // Client‑side search filter
    // ────────────────────────────────────────────────────────────────
    const filteredData = data.filter((item: ISellStockCorrection) => {
      const searchLower = search.toLowerCase();

      const referenceMatch = item.reference
        ?.toLowerCase()
        .includes(searchLower);
      const notesMatch = item.notes?.toLowerCase().includes(searchLower);
      const createdByMatch = item.createdBy?.name
        ?.toLowerCase()
        .includes(searchLower);

      return referenceMatch || notesMatch || createdByMatch;
    });

    // ────────────────────────────────────────────────────────────────
    // Client‑side pagination
    // ────────────────────────────────────────────────────────────────
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return (
      <DataTable
        data={paginatedData}
        totalItems={totalCount}
        columns={stockCorrectionColumns}
      />
    );
  } catch {
    return (
      <div className='p-4 text-red-500'>
        Error loading stock corrections. Please try again later.
      </div>
    );
  }
}
