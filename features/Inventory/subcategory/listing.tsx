import { searchParamsCache } from '@/lib/searchparams';
import { getSubCategoriesByCategory } from '@/service/Category';
import { subCategoryColumns } from './tables/columns';
import { DataTable } from '@/components/ui/table/data-table';

type SubCategoriesListingPageProps = object;

export default async function SubCategoriesListingPage({}: SubCategoriesListingPageProps) {
  // ────────────────────────────────────────────────────────────────
  // Query‑string inputs
  // ────────────────────────────────────────────────────────────────
  const page = searchParamsCache.get('page') || 1;
  const search = searchParamsCache.get('q') || '';
  const limit = searchParamsCache.get('limit') || 10;
  try {
    const { subcategories = [], totalCount = 0 } =
      await getSubCategoriesByCategory({ page, limit });

    const filteredData = subcategories.filter((item) =>
      item.name?.toLowerCase().includes(search.toLowerCase())
    );

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return (
      // eslint-disable-next-line react-hooks/error-boundaries
      <DataTable
        data={paginatedData}
        totalItems={totalCount}
        columns={subCategoryColumns}
      />
    );
  } catch  {
    return (
      <div className='p-4 text-red-500'>
        Error loading subcategories. Please try again later.
      </div>
    );
  }
}
