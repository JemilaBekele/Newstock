// features/Inventory/Products/listing.tsx
import { searchParamsCache } from '@/lib/searchparams';
import { getAllProducts } from '@/service/Product';
import { productColumns } from './tables/columns';
import { DataTable } from '@/components/ui/table/data-table';
import { IProduct } from '@/models/Product';
import ExportButtons from '@/components/export-button';

type ProductsListingPageProps = object;

export default async function ProductsListingPage({}: ProductsListingPageProps) {
  const page = searchParamsCache.get('page') || 1;
  const search = searchParamsCache.get('q') || '';
  const limit = searchParamsCache.get('limit') || 10;

  let products: IProduct[] = [];
  let totalCount = 0;
  let error: unknown = null;

  try {
    const result = await getAllProducts({ page, limit });
    products = result.products;
    totalCount = result.totalCount;
  } catch (err) {
    console.error('Error loading products:', err);
    error = err;
  }

  if (error) {
    return (
      <div className='p-4 text-red-500'>
        Error loading products. Please try again later.
      </div>
    );
  }

  const filteredData = products.filter((item) => {
    const searchLower = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchLower) ||
      item.generic?.toLowerCase().includes(searchLower) ||
      item.productCode?.toLowerCase().includes(searchLower) 
    );
  });

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return (
    <div>
      <ExportButtons data={filteredData} />
      <DataTable
        data={paginatedData}
        totalItems={totalCount}
        columns={productColumns}
      />
    </div>
  );
}