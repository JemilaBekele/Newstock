'use client';

import { getFinancialTotalsApi } from '@/service/Report';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface PurchaseStats {
  approved: number;
  cancelled: number;
  pending: number;
  total: number;
  financialTotal: number;
}

interface TransferStats {
  completed: number;
  cancelled: number;
  pending: number;
  total: number;
}

interface SellStats {
  notApproved: number;
  partiallyDelivered: number;
  approved: number;
  delivered: number;
  cancelled: number;
  total: number;
  financialTotal: number;
}

interface CorrectionStats {
  approved: number;
  rejected: number;
  pending: number;
  total: number;
}

interface FinancialTotals {
  success: boolean;
  purchase: PurchaseStats;
  transfer: TransferStats;
  sell: SellStats;
  stockCorrection: CorrectionStats;
  sellStockCorrection: CorrectionStats;
  grandTotalCount: number;
  totalFinancial: number;
}

export default function FinancialTotalsFetcher({
  children
}: {
  children: (totals: FinancialTotals) => React.ReactNode;
}) {
  const [totals, setTotals] = useState<FinancialTotals>({
    success: false,
    purchase: {
      approved: 0,
      cancelled: 0,
      pending: 0,
      total: 0,
      financialTotal: 0
    },
    transfer: {
      completed: 0,
      cancelled: 0,
      pending: 0,
      total: 0
    },
    sell: {
      notApproved: 0,
      partiallyDelivered: 0,
      approved: 0,
      delivered: 0,
      cancelled: 0,
      total: 0,
      financialTotal: 0
    },
    stockCorrection: {
      approved: 0,
      rejected: 0,
      pending: 0,
      total: 0
    },
    sellStockCorrection: {
      approved: 0,
      rejected: 0,
      pending: 0,
      total: 0
    },
    grandTotalCount: 0,
    totalFinancial: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinancialTotals = async () => {
      try {
        const data = await getFinancialTotalsApi();
        setTotals(data);
      } catch  {
        toast.error('Failed to load financial totals. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialTotals();
  }, []);

  if (loading) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {Array.from({ length: 11 }).map((_, index) => (
          <div
            key={index}
            className='bg-muted h-24 animate-pulse rounded-xl'
          ></div>
        ))}
      </div>
    );
  }

  return <>{children(totals)}</>;
}
