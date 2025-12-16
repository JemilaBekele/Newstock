'use client';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Store,
  Warehouse
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserDashboardSummaryApi } from '@/service/Report';

// Types
interface ShopSummary {
  shopId: string;
  shopName: string;
  shopCode: string;
  pendingCount: number;
}

interface StockAlert {
  id: string;
  name: string;
  productCode: string;
  batchId: string;
  batchNumber: string;
  location: 'shop' | 'store';
  locationName: string;
  quantity: number;
  unit: string;
  expiryDate?: Date;
  warningQuantity: number;
  alertType: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRED' | 'EXPIRING_SOON';
  message: string;
}

interface StockSummary {
  shopId?: string;
  shopName?: string;
  shopCode?: string;
  storeId?: string;
  storeName?: string;
  productId: string;
  productName: string;
  productCode: string;
  batchId: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  status: string;
  expiryDate?: Date;
  hasExpiryAlert: boolean;
  hasLowStockAlert: boolean;
}

interface DashboardSummary {
  userShopsCount: number;
  userStoresCount: number;
  approvedSalesCount: number;
  pendingDelivery: {
    totalItems: number;
    shopsWithPending: number;
    breakdown: ShopSummary[];
  };
  stockAlerts: {
    lowStockProducts: StockAlert[];
    expiredProducts: StockAlert[];
    expiringSoonProducts: StockAlert[];
    totalAlerts: number;
  };
  shopStockSummary: StockSummary[];
  storeStockSummary: StockSummary[];
  summary: {
    totalProductsInShops: number;
    totalProductsInStores: number;
    totalUniqueProducts: number;
    criticalAlerts: number;
  };
}

// Main Dashboard Component
export default function StoreUserDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getUserDashboardSummaryApi();
      setSummary(data);
    } catch  {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className='flex min-h-96 items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='pt-6 text-center'>
            <div className='mb-4 text-red-500'>
              <Package className='mx-auto h-12 w-12' />
            </div>
            <h3 className='mb-2 text-lg font-semibold'>
              Error Loading Dashboard
            </h3>
            <p className='text-muted-foreground mb-4'>{error}</p>
            <button
              onClick={loadDashboardData}
              className='bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2'
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className='flex min-h-96 items-center justify-center'>
        <p className='text-muted-foreground'>No data available</p>
      </div>
    );
  }

  return (
    <div className='space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
          <p className='text-muted-foreground'>
            Overview of your shops, stores, inventory, and alerts
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <MetricCard
          title='Total Shops'
          value={summary.userShopsCount.toString()}
          description='Shops you manage'
          icon={<Store className='h-4 w-4' />}
          color='blue'
        />
        <MetricCard
          title='Total Stores'
          value={summary.userStoresCount.toString()}
          description='Stores you manage'
          icon={<Warehouse className='h-4 w-4' />}
          color='indigo'
        />
        <MetricCard
          title='Approved Sales'
          value={summary.approvedSalesCount.toString()}
          description='Total approved orders'
          icon={<ShoppingCart className='h-4 w-4' />}
          color='green'
        />
        <MetricCard
          title='Pending Deliveries'
          value={summary.pendingDelivery.totalItems.toString()}
          description='Items awaiting delivery'
          icon={<Package className='h-4 w-4' />}
          color='orange'
        />
        <MetricCard
          title='Active Shops'
          value={`${summary.pendingDelivery.shopsWithPending}/${summary.userShopsCount}`}
          description='Shops with pending items'
          icon={<TrendingUp className='h-4 w-4' />}
          color='purple'
        />
        <MetricCard
          title='Total Products'
          value={summary.summary.totalUniqueProducts.toString()}
          description='Unique products across locations'
          icon={<Package className='h-4 w-4' />}
          color='cyan'
        />
        <MetricCard
          title='Stock Alerts'
          value={summary.stockAlerts.totalAlerts.toString()}
          description='Items needing attention'
          icon={<AlertTriangle className='h-4 w-4' />}
          color='red'
        />
        <MetricCard
          title='Critical Alerts'
          value={summary.summary.criticalAlerts.toString()}
          description='Expired & out of stock items'
          icon={<AlertTriangle className='h-4 w-4' />}
          color='rose'
        />
      </div>

      {/* Detailed Views */}
      <Tabs defaultValue='alerts' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='alerts'>Stock Alerts</TabsTrigger>
          <TabsTrigger value='pending'>Pending Deliveries</TabsTrigger>
          <TabsTrigger value='shops'>Shop Inventory</TabsTrigger>
          <TabsTrigger value='stores'>Store Inventory</TabsTrigger>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
        </TabsList>

        <TabsContent value='alerts'>
          <StockAlertsCard stockAlerts={summary.stockAlerts} />
        </TabsContent>

        <TabsContent value='pending'>
          <PendingDeliveriesCard
            pendingItems={summary.pendingDelivery.breakdown}
          />
        </TabsContent>

        <TabsContent value='shops'>
          <InventoryCard
            title='Shop Inventory'
            data={summary.shopStockSummary}
            type='shop'
            totalProducts={summary.summary.totalProductsInShops}
          />
        </TabsContent>

        <TabsContent value='stores'>
          <InventoryCard
            title='Store Inventory'
            data={summary.storeStockSummary}
            type='store'
            totalProducts={summary.summary.totalProductsInStores}
          />
        </TabsContent>

        <TabsContent value='overview'>
          <OverviewCard summary={summary} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  color:
    | 'blue'
    | 'green'
    | 'orange'
    | 'purple'
    | 'indigo'
    | 'cyan'
    | 'red'
    | 'rose';
}

function MetricCard({
  title,
  value,
  description,
  icon,
  color
}: MetricCardProps) {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950',
    green:
      'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950',
    orange:
      'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950',
    purple:
      'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950',
    indigo:
      'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950',
    cyan: 'border-cyan-200 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-950',
    red: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950',
    rose: 'border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950'
  };

  const iconColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600',
    indigo: 'text-indigo-600',
    cyan: 'text-cyan-600',
    red: 'text-red-600',
    rose: 'text-rose-600'
  };

  return (
    <Card className={colorClasses[color]}>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        <div className={iconColors[color]}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{value}</div>
        <p className='text-muted-foreground text-xs'>{description}</p>
      </CardContent>
    </Card>
  );
}

// Stock Alerts Card Component
// Stock Alerts Card Component - UPDATED with better keys
// Stock Alerts Card Component - FIXED with unique keys
// Stock Alerts Card Component - FIXED with guaranteed unique keys
import { useMemo } from 'react';
// ... other imports

function StockAlertsCard({
  stockAlerts
}: {
  stockAlerts: DashboardSummary['stockAlerts'];
}) {
  // Use useMemo to create stable unique keys without Math.random during render
  const allAlerts = useMemo(() => {
    const alerts = [
      ...stockAlerts.expiredProducts.map((alert, index) => ({
        ...alert,
        source: 'expired',
        uniqueKey: `${alert.id}-${alert.batchId}-${alert.location}-EXPIRED-expired-${index}`
      })),
      ...stockAlerts.lowStockProducts.map((alert, index) => ({
        ...alert,
        source: 'lowStock',
        uniqueKey: `${alert.id}-${alert.batchId}-${alert.location}-LOW_STOCK-lowStock-${index}`
      })),
      ...stockAlerts.expiringSoonProducts.map((alert, index) => ({
        ...alert,
        source: 'expiringSoon',
        uniqueKey: `${alert.id}-${alert.batchId}-${alert.location}-EXPIRING_SOON-expiringSoon-${index}`
      }))
    ];
    return alerts;
  }, [stockAlerts]);

  // ... rest of the component remains the same
  const getAlertBadgeVariant = (alertType: string) => {
    switch (alertType) {
      case 'EXPIRED':
        return 'destructive';
      case 'OUT_OF_STOCK':
        return 'destructive';
      case 'LOW_STOCK':
        return 'secondary';
      case 'EXPIRING_SOON':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'EXPIRED':
      case 'EXPIRING_SOON':
        return <Calendar className='h-4 w-4' />;
      case 'LOW_STOCK':
      case 'OUT_OF_STOCK':
        return <Package className='h-4 w-4' />;
      default:
        return <AlertTriangle className='h-4 w-4' />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <AlertTriangle className='h-5 w-5 text-red-500' />
          Stock Alerts
          <Badge variant='outline' className='ml-2'>
            {stockAlerts.totalAlerts} total
          </Badge>
        </CardTitle>
        <CardDescription>
          Products that need your attention - expired, low stock, or expiring
          soon
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {allAlerts.length === 0 ? (
            <div className='text-muted-foreground py-8 text-center'>
              <Package className='mx-auto mb-4 h-12 w-12 opacity-50' />
              <p>No stock alerts - everything looks good!</p>
            </div>
          ) : (
            allAlerts.map((alert) => (
              <div
                key={alert.uniqueKey}
                className='hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors'
              >
                <div className='flex flex-1 items-center space-x-4'>
                  <div
                    className={`rounded-full p-2 ${
                      alert.alertType === 'EXPIRED' ||
                      alert.alertType === 'OUT_OF_STOCK'
                        ? 'bg-red-100 text-red-600 dark:bg-red-900'
                        : alert.alertType === 'LOW_STOCK'
                          ? 'bg-orange-100 text-orange-600 dark:bg-orange-900'
                          : 'bg-blue-100 text-blue-600 dark:bg-blue-900'
                    }`}
                  >
                    {getAlertIcon(alert.alertType)}
                  </div>
                  <div className='flex-1'>
                    <div className='mb-1 flex items-center gap-2'>
                      <p className='font-medium'>{alert.name}</p>
                      <Badge variant='secondary' className='text-xs'>
                        {alert.productCode}
                      </Badge>
                    </div>
                    <p className='text-muted-foreground text-sm'>
                      Batch: {alert.batchNumber} • {alert.locationName} • Qty:{' '}
                      {alert.quantity} {alert.unit}
                    </p>
                    <p className='mt-1 text-sm'>{alert.message}</p>
                    {alert.expiryDate && (
                      <p className='text-muted-foreground mt-1 text-xs'>
                        Expires:{' '}
                        {new Date(alert.expiryDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant={getAlertBadgeVariant(alert.alertType)}>
                  {alert.alertType.replace('_', ' ')}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
// Pending Deliveries Card Component
function PendingDeliveriesCard({
  pendingItems
}: {
  pendingItems: ShopSummary[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Deliveries by Shop</CardTitle>
        <CardDescription>
          Detailed breakdown of items awaiting delivery
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {pendingItems.length === 0 ? (
            <div className='text-muted-foreground py-8 text-center'>
              <Package className='mx-auto mb-4 h-12 w-12 opacity-50' />
              <p>No pending deliveries</p>
            </div>
          ) : (
            pendingItems.map((shop) => (
              <div
                key={shop.shopId}
                className='hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors'
              >
                <div className='flex items-center space-x-4'>
                  <div className='bg-primary/10 rounded-full p-2'>
                    <ShoppingCart className='text-primary h-4 w-4' />
                  </div>
                  <div>
                    <p className='font-medium'>{shop.shopName}</p>
                    <p className='text-muted-foreground text-sm'>
                      {shop.shopCode}
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-4'>
                  <Badge
                    variant={
                      shop.pendingCount > 10
                        ? 'destructive'
                        : shop.pendingCount > 5
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {shop.pendingCount} items
                  </Badge>
                  <div className='w-20'>
                    <Progress
                      value={Math.min((shop.pendingCount / 20) * 100, 100)}
                      className='h-2'
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Inventory Card Component
// Inventory Card Component - FIXED with guaranteed unique keys
function InventoryCard({
  title,
  data,
  type,
  totalProducts
}: {
  title: string;
  data: StockSummary[];
  type: 'shop' | 'store';
  totalProducts: number;
}) {
  const getLocationName = (item: StockSummary) => {
    return type === 'shop' ? item.shopName : item.storeName;
  };

  const getLocationCode = (item: StockSummary) => {
    return type === 'shop' ? item.shopCode : undefined;
  };

  const getLocationId = (item: StockSummary) => {
    return type === 'shop' ? item.shopId : item.storeId;
  };

  // Generate unique keys for each item
// Generate unique keys for each item - WITHOUT Math.random
const getUniqueKey = (item: StockSummary, index: number) => {
  const locationId = getLocationId(item) || 'unknown';
  // Remove Math.random() - use only stable identifiers
  return `${locationId}-${item.productId}-${item.batchId}-${type}-${index}`;
};

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          {title}
          <Badge variant='outline'>{totalProducts} products</Badge>
        </CardTitle>
        <CardDescription>
          Current inventory status with expiry and stock alerts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid gap-4 md:grid-cols-2'>
          {data.map((item, index) => (
            <Card
              key={getUniqueKey(item, index)}
              className='relative overflow-hidden'
            >
              <CardHeader className='pb-3'>
                <CardTitle className='flex items-center justify-between text-base'>
                  <div className='flex items-center gap-2'>
                    {item.productName}
                    {item.hasExpiryAlert && (
                      <Calendar className='h-4 w-4 text-orange-500' />
                    )}
                    {item.hasLowStockAlert && (
                      <AlertTriangle className='h-4 w-4 text-red-500' />
                    )}
                  </div>
                  <Badge variant='secondary' className='text-xs'>
                    {item.productCode}
                  </Badge>
                </CardTitle>
                <div className='text-muted-foreground text-sm'>
                  {getLocationName(item)}
                  {getLocationCode(item) && ` • ${getLocationCode(item)}`}
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-muted-foreground text-sm'>
                      Quantity
                    </span>
                    <span
                      className={`font-bold ${
                        item.hasLowStockAlert
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {item.quantity} {item.unit}
                    </span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-muted-foreground text-sm'>Batch</span>
                    <span className='text-sm'>{item.batchNumber}</span>
                  </div>

                  {item.expiryDate && (
                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground text-sm'>
                        Expiry
                      </span>
                      <span
                        className={`text-sm ${
                          item.hasExpiryAlert
                            ? 'text-orange-600'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {new Date(item.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className='mt-2 flex gap-2'>
                    {item.hasLowStockAlert && (
                      <Badge variant='destructive' className='text-xs'>
                        Low Stock
                      </Badge>
                    )}
                    {item.hasExpiryAlert && (
                      <Badge variant='outline' className='text-xs'>
                        Expiring Soon
                      </Badge>
                    )}
                    {!item.hasLowStockAlert && !item.hasExpiryAlert && (
                      <Badge variant='secondary' className='text-xs'>
                        Good
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Overview Card Component
function OverviewCard({ summary }: { summary: DashboardSummary }) {
  return (
    <div className='grid gap-6 md:grid-cols-2'>
      <Card>
        <CardHeader>
          <CardTitle>Inventory Summary</CardTitle>
          <CardDescription>
            Overview of products across all locations
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <span>Total Shops</span>
            <Badge variant='outline'>{summary.userShopsCount}</Badge>
          </div>
          <div className='flex items-center justify-between'>
            <span>Total Stores</span>
            <Badge variant='outline'>{summary.userStoresCount}</Badge>
          </div>
          <div className='flex items-center justify-between'>
            <span>Products in Shops</span>
            <Badge variant='outline'>
              {summary.summary.totalProductsInShops}
            </Badge>
          </div>
          <div className='flex items-center justify-between'>
            <span>Products in Stores</span>
            <Badge variant='outline'>
              {summary.summary.totalProductsInStores}
            </Badge>
          </div>
          <div className='flex items-center justify-between'>
            <span>Unique Products</span>
            <Badge variant='secondary'>
              {summary.summary.totalUniqueProducts}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alert Summary</CardTitle>
          <CardDescription>Current issues needing attention</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <span className='flex items-center gap-2'>
              <AlertTriangle className='h-4 w-4 text-red-500' />
              Critical Alerts
            </span>
            <Badge variant='destructive'>
              {summary.summary.criticalAlerts}
            </Badge>
          </div>
          <div className='flex items-center justify-between'>
            <span className='flex items-center gap-2'>
              <Calendar className='h-4 w-4 text-orange-500' />
              Expired Products
            </span>
            <Badge variant='outline'>
              {summary.stockAlerts.expiredProducts.length}
            </Badge>
          </div>
          <div className='flex items-center justify-between'>
            <span className='flex items-center gap-2'>
              <Package className='h-4 w-4 text-orange-500' />
              Low Stock Items
            </span>
            <Badge variant='outline'>
              {summary.stockAlerts.lowStockProducts.length}
            </Badge>
          </div>
          <div className='flex items-center justify-between'>
            <span className='flex items-center gap-2'>
              <Calendar className='h-4 w-4 text-blue-500' />
              Expiring Soon
            </span>
            <Badge variant='outline'>
              {summary.stockAlerts.expiringSoonProducts.length}
            </Badge>
          </div>
          <div className='flex items-center justify-between'>
            <span>Total Alerts</span>
            <Badge variant='secondary'>{summary.stockAlerts.totalAlerts}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Skeleton Loading Component
function DashboardSkeleton() {
  return (
    <div className='space-y-6 p-6'>
      {/* Header Skeleton */}
      <div className='space-y-2'>
        <Skeleton className='h-8 w-64' />
        <Skeleton className='h-4 w-96' />
      </div>

      {/* Metrics Skeleton */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-4 w-4 rounded-full' />
            </CardHeader>
            <CardContent>
              <Skeleton className='mb-1 h-7 w-12' />
              <Skeleton className='h-3 w-24' />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className='space-y-4'>
        <Skeleton className='h-10 w-full max-w-md' />
        <Skeleton className='h-96 rounded-lg' />
      </div>
    </div>
  );
}
