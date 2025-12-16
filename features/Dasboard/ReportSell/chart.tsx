'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getTotalSold, getSellTrendApi } from '@/service/Report';

interface TotalSoldResponse {
  success: boolean;
  totalSold: number;
  startDate?: string;
  endDate?: string;
}

interface SellTrend {
  month: string;
  total: number;
}

export default function TotalSalesChart() {
  const [chartData, setChartData] = useState<SellTrend[]>([]);
  const [totalSold, setTotalSold] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const fetchData = async (start?: string, end?: string) => {
    try {
      setLoading(true);

      // Fetch total sold data with date range
      const dateParams = {
        ...(start && { startDate: start }),
        ...(end && { endDate: end })
      };

      const totalSoldResponse: TotalSoldResponse =
        await getTotalSold(dateParams);
      setTotalSold(totalSoldResponse.totalSold);

      // Fetch trend data
      const trendData: SellTrend[] = await getSellTrendApi();
      setChartData(trendData);
    } catch  {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDateFilter = () => {
    fetchData(startDate, endDate);
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    fetchData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateGrowth = () => {
    if (chartData.length < 2) return 0;

    const currentMonth = chartData[chartData.length - 1]?.total || 0;
    const previousMonth = chartData[chartData.length - 2]?.total || 0;

    if (previousMonth === 0) return 0;

    return ((currentMonth - previousMonth) / previousMonth) * 100;
  };

  const growth = calculateGrowth();
  const isPositiveGrowth = growth >= 0;

  return (
    <Card className='mx-auto w-full'>
      <CardHeader className='pb-4'>
        <div className='flex flex-col items-start justify-between gap-4 md:flex-row md:items-center'>
          <div>
            <CardTitle className='text-2xl font-bold'>Sales Overview</CardTitle>
            <CardDescription>
              Total sales performance and trends
              {startDate && endDate && (
                <span className='mt-1 block text-sm'>
                  Period: {new Date(startDate).toLocaleDateString()} -{' '}
                  {new Date(endDate).toLocaleDateString()}
                </span>
              )}
            </CardDescription>
          </div>

          <div className='flex w-full flex-col gap-2 sm:flex-row md:w-auto'>
            <div className='flex gap-2'>
              <div className='grid gap-1'>
                <Label htmlFor='start-date' className='text-xs'>
                  Start Date
                </Label>
                <Input
                  id='start-date'
                  type='date'
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className='w-full'
                />
              </div>
              <div className='grid gap-1'>
                <Label htmlFor='end-date' className='text-xs'>
                  End Date
                </Label>
                <Input
                  id='end-date'
                  type='date'
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className='w-full'
                />
              </div>
            </div>
            <div className='mt-2 flex gap-2 sm:mt-6'>
              <Button
                onClick={handleDateFilter}
                size='sm'
                className='flex items-center gap-1'
                disabled={loading}
              >
                <Calendar className='h-4 w-4' />
                Apply
              </Button>
              <Button
                onClick={handleClearFilter}
                variant='outline'
                size='sm'
                disabled={loading}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-6'>
        {/* Total Sales Summary */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <Card className='bg-muted/50'>
            <CardContent className='p-4'>
              <div className='text-muted-foreground text-sm font-medium'>
                Total Sold
              </div>
              <div className='text-2xl font-bold'>
                {loading ? 'Loading...' : formatCurrency(totalSold)}
              </div>
            </CardContent>
          </Card>

          <Card className='bg-muted/50'>
            <CardContent className='p-4'>
              <div className='text-muted-foreground text-sm font-medium'>
                Average Monthly
              </div>
              <div className='text-2xl font-bold'>
                {loading
                  ? 'Loading...'
                  : formatCurrency(totalSold / Math.max(chartData.length, 1))}
              </div>
            </CardContent>
          </Card>

          <Card className='bg-muted/50'>
            <CardContent className='p-4'>
              <div className='text-muted-foreground text-sm font-medium'>
                Growth
              </div>
              <div
                className={`flex items-center text-2xl font-bold ${
                  isPositiveGrowth ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {loading ? 'Loading...' : `${growth.toFixed(1)}%`}
                <TrendingUp
                  className={`ml-1 h-4 w-4 ${!isPositiveGrowth ? 'rotate-180' : ''}`}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales Trend Chart */}
        {/* <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Sales Trend</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="h-[250px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Loading chart data...</p>
              </div>
            ) : chartData.length > 0 ? (
              <div className="h-[250px] w-full">
                <ChartContainer config={chartConfig}>
                  <AreaChart
                    accessibilityLayer
                    data={chartData}
                    margin={{ left: 12, right: 12, top: 10, bottom: 10 }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    <Area
                      dataKey="total"
                      type="monotone"
                      fill="var(--color-total)"
                      fillOpacity={0.2}
                      stroke="var(--color-total)"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "var(--color-total)" }}
                      activeDot={{ r: 5, fill: "var(--color-total)" }}
                    />
                  </AreaChart>
                </ChartContainer>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No data available</p>
              </div>
            )}
          </CardContent>
        </Card> */}
      </CardContent>

      <CardFooter className='border-t pt-4'>
        <div className='flex w-full items-center justify-between text-sm'>
          <div className='text-muted-foreground'>
            Last updated: {new Date().toLocaleDateString()}
          </div>
          <div
            className={`flex items-center gap-2 ${isPositiveGrowth ? 'text-green-600' : 'text-red-600'}`}
          >
            <TrendingUp
              className={`h-4 w-4 ${!isPositiveGrowth ? 'rotate-180' : ''}`}
            />
            {isPositiveGrowth ? 'Positive' : 'Negative'} trend this period
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
