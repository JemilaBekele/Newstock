'use client';

import { InventoryDashboardApi } from '@/service/invarelDash';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface InventoryKpis {
  totalProducts: number | null;
  totalQuantity: number | null;
  inventoryValueCost: number | null;
  inventoryValueRetail: number | null;
  activeSuppliers: number | null;
  openPurchases: number | null;
  pendingTransfers: number | null;
  lowStockItems: number | null;
  expiringSoon: number | null;
  totalStores: number | null;
  totalShops: number | null;
}

export default function InventoryStatsFetcher({
  children
}: {
  children: (kpis: InventoryKpis) => React.ReactNode;
}) {
  const [kpis, setKpis] = useState<InventoryKpis>({
    totalProducts: null,
    totalQuantity: null,
    inventoryValueCost: null,
    inventoryValueRetail: null,
    activeSuppliers: null,
    openPurchases: null,
    pendingTransfers: null,
    lowStockItems: null,
    expiringSoon: null,
    totalStores: null,
    totalShops: null
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await InventoryDashboardApi.getDashboard();
        setKpis(data.kpis); // ✅ backend already wraps KPIs in `kpis`
      } catch (error) {
        toast.error('Failed to load inventory statistics. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className='bg-muted h-24 animate-pulse rounded-xl'
          ></div>
        ))}
      </div>
    );
  }

  return <>{children(kpis)}</>;
}
