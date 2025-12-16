/* eslint-disable @typescript-eslint/no-explicit-any */
// REMOVE 'use client'

import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import PurchaseViewPage from '@/features/purchase/correctview';
import { Suspense } from 'react';

export default function StockPage({ searchParams }: { searchParams: any }) {
  const purchaseId = searchParams.id ?? '';

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <PurchaseViewPage purchaseId={purchaseId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
