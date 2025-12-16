/* eslint-disable react-hooks/error-boundaries */
import { searchParamsCache } from '@/lib/searchparams';
import { getAllTransfers } from '@/service/transfer'; // your service
import { DataTable } from '@/components/ui/table/data-table';
import { ITransfer } from '@/models/transfer';
import { transferColumns } from './tables/columns';

type TransferListingPageProps = object;

export default async function TransferListingPage({}: TransferListingPageProps) {
  const page = Number(searchParamsCache.get('page')) || 1;
  const search = searchParamsCache.get('q') || '';
  const limit = Number(searchParamsCache.get('limit')) || 10;
  const startDate = searchParamsCache.get('startDate');
  const endDate = searchParamsCache.get('endDate');

  try {
    // ────────────────────────────────────────────────
    // Fetch data from API with optional date filters
    // ────────────────────────────────────────────────
    const { data, totalCount } = await getAllTransfers({
      page,
      limit,
      startDate,
      endDate
    });

    // ────────────────────────────────────────────────
    // Client-side search filter
    // (matches reference, status, source/destination IDs)
    // ────────────────────────────────────────────────
    const filteredData = data.filter((item: ITransfer) => {
      const searchTerm = search.toLowerCase();

      const reference = item?.reference?.toLowerCase() || '';
      const status = item?.status?.toLowerCase() || '';
      const sourceStore = item?.sourceStoreId?.toLowerCase() || '';
      const sourceShop = item?.sourceShopId?.toLowerCase() || '';
      const destStore = item?.destStoreId?.toLowerCase() || '';
      const destShop = item?.destShopId?.toLowerCase() || '';

      return (
        reference.includes(searchTerm) ||
        status.includes(searchTerm) ||
        sourceStore.includes(searchTerm) ||
        sourceShop.includes(searchTerm) ||
        destStore.includes(searchTerm) ||
        destShop.includes(searchTerm)
      );
    });

    // ────────────────────────────────────────────────
    // Client-side pagination
    // ────────────────────────────────────────────────
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return (
      <DataTable
        data={paginatedData}
        totalItems={totalCount}
        columns={transferColumns}
      />
    );
  } catch  {
    return <div>Error loading transfer records.</div>;
  }
}
