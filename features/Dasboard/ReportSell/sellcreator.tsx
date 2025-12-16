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
  ShoppingCart,
  Package,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getSalesCreatorDashboardSummaryApi } from '@/service/Report';

// Types
interface RecentSale {
  id: string;
  invoiceNo: string;
  customerName: string;
  customerPhone?: string;
  grandTotal: number;
  netTotal: number;
  saleDate: string;
  shopNames: string[];
  totalItems: number;
}

interface SalesCreatorDashboardSummary {
  userInfo: {
    id: string;
    name: string;
    email: string;
  };
  salesOverview: {
    totalSales: number;
    approved: number;
    delivered: number;
    cancelled: number;
    notApproved: number;
    partiallyDelivered: number;
  };
  recentActivity: {
    last30Days: {
      approved: number;
      delivered: number;
      cancelled: number;
    };
    revenue: {
      grandTotal: number;
      netTotal: number;
    };
  };
  recentApprovedSales: RecentSale[];
}

// Main Dashboard Component
export default function SalesCreatorDashboard() {
  const [summary, setSummary] = useState<SalesCreatorDashboardSummary | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getSalesCreatorDashboardSummaryApi();

      setSummary(data);
    } catch  {
      const errorMessage =
        'Failed to load sales dashboard data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <SalesDashboardSkeleton />;
  }

  if (error) {
    return (
      <div className='flex min-h-96 items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='pt-6 text-center'>
            <div className='mb-4 text-red-500'>
              <ShoppingCart className='mx-auto h-12 w-12' />
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
        <Card className='w-full max-w-md'>
          <CardContent className='pt-6 text-center'>
            <div className='text-muted-foreground mb-4'>
              <ShoppingCart className='mx-auto h-12 w-12' />
            </div>
            <h3 className='mb-2 text-lg font-semibold'>No Data Available</h3>
            <p className='text-muted-foreground mb-4'>
              No sales data found for your account
            </p>
            <button
              onClick={loadDashboardData}
              className='bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2'
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Sales Dashboard</h1>
          <p className='text-muted-foreground'>
            Welcome back, {summary.userInfo.name}
          </p>
        </div>
        <Badge variant='secondary' className='text-sm'>
          Sales Creator
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <MetricCard
          title='Total Sales'
          value={summary.salesOverview.totalSales.toString()}
          description='All time sales created'
          icon={<ShoppingCart className='h-4 w-4' />}
          color='blue'
        />
        <MetricCard
          title='Approved Sales'
          value={summary.salesOverview.approved.toString()}
          description='Successfully approved'
          icon={<CheckCircle className='h-4 w-4' />}
          color='green'
        />
        <MetricCard
          title='Delivered'
          value={summary.salesOverview.delivered.toString()}
          description='Completed deliveries'
          icon={<Package className='h-4 w-4' />}
          color='purple'
        />
      </div>

      {/* Detailed Views */}
      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='recent'>Recent Approved</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <SalesStatusCard summary={summary} />
            <RecentActivityCard summary={summary} />
          </div>
        </TabsContent>

        <TabsContent value='recent'>
          <RecentSalesCard sales={summary.recentApprovedSales} />
        </TabsContent>

        <TabsContent value='analytics'>
          <SalesAnalyticsCard summary={summary} />
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
  color: 'blue' | 'green' | 'orange' | 'purple';
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
      'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950'
  };

  const iconColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600'
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

// Sales Status Card Component
function SalesStatusCard({
  summary
}: {
  summary: SalesCreatorDashboardSummary;
}) {
  const total = summary.salesOverview.totalSales;
  const statuses = [
    {
      label: 'Approved',
      value: summary.salesOverview.approved,
      color: 'bg-green-500'
    },
    {
      label: 'Delivered',
      value: summary.salesOverview.delivered,
      color: 'bg-purple-500'
    },
    {
      label: 'Partially Delivered',
      value: summary.salesOverview.partiallyDelivered,
      color: 'bg-blue-500'
    },
    {
      label: 'Not Approved',
      value: summary.salesOverview.notApproved,
      color: 'bg-yellow-500'
    },
    {
      label: 'Cancelled',
      value: summary.salesOverview.cancelled,
      color: 'bg-red-500'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Status Distribution</CardTitle>
        <CardDescription>Breakdown of all your sales by status</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {statuses.map((status) => (
          <div key={status.label} className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span className='flex items-center gap-2'>
                <div className={`h-3 w-3 rounded-full ${status.color}`} />
                {status.label}
              </span>
              <span>
                {status.value} (
                {total > 0 ? ((status.value / total) * 100).toFixed(1) : 0}%)
              </span>
            </div>
            <Progress
              value={total > 0 ? (status.value / total) * 100 : 0}
              className='h-2'
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Recent Activity Card Component
function RecentActivityCard({
  summary
}: {
  summary: SalesCreatorDashboardSummary;
}) {
  const recent = summary.recentActivity.last30Days;
  const totalRecent = recent.approved + recent.delivered + recent.cancelled;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity (30 Days)</CardTitle>
        <CardDescription>Your sales performance this month</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='grid grid-cols-3 gap-4 text-center'>
          <div>
            <div className='text-2xl font-bold text-green-600'>
              {recent.approved}
            </div>
            <div className='text-muted-foreground text-sm'>Approved</div>
          </div>
          <div>
            <div className='text-2xl font-bold text-purple-600'>
              {recent.delivered}
            </div>
            <div className='text-muted-foreground text-sm'>Delivered</div>
          </div>
          <div>
            <div className='text-2xl font-bold text-red-600'>
              {recent.cancelled}
            </div>
            <div className='text-muted-foreground text-sm'>Cancelled</div>
          </div>
        </div>

        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium'>Success Rate</span>
            <Badge variant='secondary'>
              {totalRecent > 0
                ? (
                    ((recent.approved + recent.delivered) / totalRecent) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </Badge>
          </div>
          <Progress
            value={
              totalRecent > 0
                ? ((recent.approved + recent.delivered) / totalRecent) * 100
                : 0
            }
            className='h-2'
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Recent Sales Card Component
function RecentSalesCard({ sales }: { sales: RecentSale[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Approved Sales</CardTitle>
        <CardDescription>Latest approved sales transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {sales.length === 0 ? (
            <div className='text-muted-foreground py-8 text-center'>
              <CheckCircle className='mx-auto mb-4 h-12 w-12 opacity-50' />
              <p>No approved sales yet</p>
            </div>
          ) : (
            sales.map((sale) => (
              <div
                key={sale.id}
                className='hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors'
              >
                <div className='flex flex-1 items-start space-x-4'>
                  <div className='rounded-full bg-green-100 p-2'>
                    <CheckCircle className='h-4 w-4 text-green-600' />
                  </div>
                  <div className='flex-1'>
                    <div className='mb-1 flex items-center gap-2'>
                      <p className='font-medium'>{sale.invoiceNo}</p>
                      <Badge variant='outline' className='text-xs'>
                        ${sale.netTotal.toLocaleString()}
                      </Badge>
                    </div>
                    <p className='text-muted-foreground text-sm'>
                      {sale.customerName} • {sale.totalItems} items
                      {sale.customerPhone && ` • ${sale.customerPhone}`}
                    </p>
                    <p className='text-muted-foreground text-xs'>
                      {sale.shopNames.join(', ')} •{' '}
                      {new Date(sale.saleDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className='text-right'>
                  <Badge variant='secondary' className='mb-1'>
                    Approved
                  </Badge>
                  <p className='text-muted-foreground text-xs'>
                    {new Date(sale.saleDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Sales Analytics Card Component
function SalesAnalyticsCard({
  summary
}: {
  summary: SalesCreatorDashboardSummary;
}) {
  const completionRate =
    summary.salesOverview.totalSales > 0
      ? ((summary.salesOverview.delivered + summary.salesOverview.approved) /
          summary.salesOverview.totalSales) *
        100
      : 0;

  const cancellationRate =
    summary.salesOverview.totalSales > 0
      ? (summary.salesOverview.cancelled / summary.salesOverview.totalSales) *
        100
      : 0;

  const averageRevenue =
    summary.salesOverview.totalSales > 0
      ? summary.recentActivity.revenue.netTotal /
        summary.salesOverview.totalSales
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Analytics</CardTitle>
        <CardDescription>Performance metrics and insights</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='grid grid-cols-2 gap-6'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <TrendingUp className='h-4 w-4 text-green-600' />
              <span className='text-sm font-medium'>Completion Rate</span>
            </div>
            <div className='text-2xl font-bold'>
              {completionRate.toFixed(1)}%
            </div>
            <Progress value={completionRate} className='h-2' />
          </div>

          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <XCircle className='h-4 w-4 text-red-600' />
              <span className='text-sm font-medium'>Cancellation Rate</span>
            </div>
            <div className='text-2xl font-bold'>
              {cancellationRate.toFixed(1)}%
            </div>
            <Progress
              value={cancellationRate}
              className='h-2 [&>div]:bg-red-500'
            />
          </div>
        </div>

        <div className='grid grid-cols-3 gap-4 border-t pt-4'>
          <div className='text-center'>
            <div className='text-lg font-bold'>
              {summary.salesOverview.approved}
            </div>
            <div className='text-muted-foreground text-sm'>
              Awaiting Delivery
            </div>
          </div>
          <div className='text-center'>
            <div className='text-lg font-bold'>
              {summary.salesOverview.partiallyDelivered}
            </div>
            <div className='text-muted-foreground text-sm'>
              Partial Delivery
            </div>
          </div>
          <div className='text-center'>
            <div className='text-lg font-bold'>
              {summary.salesOverview.notApproved}
            </div>
            <div className='text-muted-foreground text-sm'>
              Pending Approval
            </div>
          </div>
        </div>

        <div className='border-t pt-4'>
          <h4 className='mb-3 text-sm font-medium'>Performance Summary</h4>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span>Total Sales Created:</span>
              <span className='font-medium'>
                {summary.salesOverview.totalSales}
              </span>
            </div>
            <div className='flex justify-between'>
              <span>Successful Deliveries:</span>
              <span className='font-medium text-green-600'>
                {summary.salesOverview.delivered}
              </span>
            </div>
            <div className='flex justify-between'>
              <span>Average Revenue per Sale:</span>
              <span className='font-medium'>${averageRevenue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton Loading Component
function SalesDashboardSkeleton() {
  return (
    <div className='space-y-6 p-6'>
      {/* Header Skeleton */}
      <div className='flex items-center justify-between'>
        <div className='space-y-2'>
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-4 w-96' />
        </div>
        <Skeleton className='h-6 w-24' />
      </div>

      {/* Metrics Skeleton */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {[...Array(4)].map((_, i) => (
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
        <Skeleton className='h-10 w-48' />
        <div className='grid gap-4 md:grid-cols-2'>
          <Skeleton className='h-80 rounded-lg' />
          <Skeleton className='h-80 rounded-lg' />
        </div>
      </div>
    </div>
  );
}
