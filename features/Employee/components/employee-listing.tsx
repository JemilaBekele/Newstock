// File: employee-listing-page.tsx
import { employeeColumns } from './employee-tables/columns';
import { getAllEmployees } from '@/service/employee';
import { searchParamsCache } from '@/lib/searchparams';
import { DataTable } from '@/components/ui/table/data-table';

type EmployeeListingPageProps = object;

export default async function EmployeeListingPage({}: EmployeeListingPageProps) {
  const page = searchParamsCache.get('page') || 1;
  const search = searchParamsCache.get('q') || '';
  const limit = searchParamsCache.get('limit') || 10;
  const startDate = searchParamsCache.get('startDate'); // Remove the null fallback
  const endDate = searchParamsCache.get('endDate'); // Remove the null fallback

  try {
    const {
      success,
      totalCount,
      employees = []
    } = await getAllEmployees({
      page,
      startDate, // Will be undefined if not in params
      endDate // Will be undefined if not in params
    });

    if (!success) throw new Error('Failed to fetch employees');

    // Apply client-side search filter
    const filteredData = employees.filter((item) => {
      const searchLower = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(searchLower) ||
        item.email?.toLowerCase().includes(searchLower) ||
        item.phone?.toLowerCase().includes(searchLower)
      );
    });

    // Implement client-side pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return (
      <DataTable
        data={paginatedData}
        totalItems={totalCount}
        columns={employeeColumns}
      />
    );
  } catch  {
    return <div>Error loading employees</div>;
  }
}
