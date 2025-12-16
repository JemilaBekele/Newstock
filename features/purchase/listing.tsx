import { searchParamsCache } from '@/lib/searchparams';
import { DataTable } from '@/components/ui/table/data-table';
import { purchaseColumns } from './tables/columns';
import { getAllPurchases } from '@/service/purchase';

type PurchaseListingPageProps = object;

export default async function PurchaseListingPage({}: PurchaseListingPageProps) {
  const page = Number(searchParamsCache.get('page')) || 1;
  const search = searchParamsCache.get('q') || '';
  const limit = Number(searchParamsCache.get('limit')) || 10;

  try {
    // Fetch purchases from API
    const { purchases, totalCount } = await getAllPurchases({
      page,
      limit
    });

    // ──────────────────────────────────────────────
    // Client-side search filter (example: supplier name)
    // ──────────────────────────────────────────────
    const filteredData = purchases.filter((item) =>
      item?.supplier?.name?.toLowerCase().includes(search.toLowerCase())
    );

    // ──────────────────────────────────────────────
    // Client-side pagination (in case API doesn’t paginate fully)
    // ──────────────────────────────────────────────
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return (
      // eslint-disable-next-line react-hooks/error-boundaries
      <DataTable
        data={paginatedData}
        totalItems={totalCount}
        columns={purchaseColumns}
      />
    );
  } catch  {
    return <div>Error loading purchases.</div>;
  }
}
