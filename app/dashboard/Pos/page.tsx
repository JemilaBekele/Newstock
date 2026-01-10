/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { ProductSearch } from '@/features/Shop/list';
import { getCategories, getSubCategories } from '@/service/Category';
import { TopProducts } from '@/service/Product';
import { useSearchParams } from 'next/navigation';

export default function Page() {
const searchParams = useSearchParams();
const searchTerm = searchParams?.get('searchTerm') || '';
const categoryName = searchParams?.get('categoryName') || '';
const subCategoryName = searchParams?.get('subCategoryName') || '';

const [products, setProducts] = useState<any[]>([]);
const [categories, setCategories] = useState<any[]>([]);
const [subCategories, setSubCategories] = useState<any[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      const [productsData, categoriesData, subCategoriesData] =
        await Promise.all([
          TopProducts({
            searchTerm: searchTerm || undefined,
            categoryName: categoryName || undefined,
            subCategoryName: subCategoryName || undefined
          }),
          getCategories(),
          getSubCategories()
        ]);

      setProducts(productsData || []);
      setCategories(categoriesData || []);
      setSubCategories(subCategoriesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Handle error appropriately
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [searchTerm, categoryName, subCategoryName]); // Updated dependencies
  if (loading) {
    return (
      <PageContainer scrollable>
        <div className='flex-1 space-y-4'>
          <FormCardSkeleton />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <ProductSearch
          products={products}
          categories={categories}
          subCategories={subCategories}
          initialSearchTerm={searchTerm}
          initialCategoryName={categoryName}
          initialSubCategoryName={subCategoryName}
        />
      </div>
    </PageContainer>
  );
}
