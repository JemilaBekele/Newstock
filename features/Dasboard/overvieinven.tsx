/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { InventoryDashboardApi } from '@/service/invarelDash';

export const description = 'A stacked bar chart for stock movements';

const chartConfig = {
  IN: {
    label: 'Stock In',
    color: 'var(--primary)' // Use your primary theme color
  },
  OUT: {
    label: 'Stock Out',
    color: 'var(--primary-dark)' // Use a darker variation
  }
} satisfies ChartConfig;

export function BarGraph() {
  const [chartData, setChartData] = React.useState<
    { month: string; IN: number; OUT: number }[]
  >([]);
  const [isClient, setIsClient] = React.useState(false);

  // Fetch and preprocess data
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const { charts } = await InventoryDashboardApi.getDashboard();
        const statusData = charts.movementTimeline || [];

        // Preprocess data to group by month (YYYY-MM)
        const processedData = statusData.reduce((acc: any, curr: any) => {
          // Extract YYYY-MM from ISO date string
          const month = curr.month.slice(0, 7); // e.g., "2025-07-01T00:00:00.000Z" -> "2025-07"
          const existing = acc.find((item: any) => item.month === month);
          if (existing) {
            existing[curr.movementType] = curr.quantity;
          } else {
            acc.push({
              month,
              [curr.movementType]: curr.quantity
            });
          }
          return acc;
        }, []);

        setChartData(processedData);
      } catch  {}
    };

    fetchData();
    setIsClient(true);
  }, []);

  // Calculate totals for IN and OUT
  const total = React.useMemo(
    () => ({
      IN: chartData.reduce((acc, curr) => acc + (curr.IN || 0), 0),
      OUT: chartData.reduce((acc, curr) => acc + (curr.OUT || 0), 0)
    }),
    [chartData]
  );

  if (!isClient) {
    return null;
  }

  return (
    <Card className='@container/card pt-3!'>
      <CardHeader className='flex flex-col items-stretch space-y-0 border-b p-0! sm:flex-row'>
        <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-0!'>
          <CardTitle>Stock Movement - Stacked Bar Chart</CardTitle>
          <CardDescription>
            <span className='hidden @[540px]/card:block'>
              Stock IN vs OUT by Month
            </span>
            <span className='@[540px]/card:hidden'>Stock Movements</span>
          </CardDescription>
        </div>
        <div className='flex'>
          {['IN', 'OUT'].map((key) => {
            const chart = key as keyof typeof chartConfig;
            if (!chart || total[key as keyof typeof total] === 0) return null;
            return (
              <div
                key={chart}
                className='flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-8 sm:py-6'
              >
                <span className='text-muted-foreground text-xs'>
                  {chartConfig[chart].label}
                </span>
                <span className='text-lg leading-none font-bold sm:text-3xl'>
                  {total[key as keyof typeof total]?.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-62.5 w-full'
        >
          <BarChart
            data={chartData}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='month'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric'
                })
              }
            />
            <YAxis />
            <ChartTooltip
              cursor={{ fill: 'var(--primary)', opacity: 0.1 }}
              content={
                <ChartTooltipContent
                  className='w-37.5'
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })
                  }
                />
              }
            />
            <Bar
              dataKey='IN'
              stackId='a'
              fill={chartConfig.IN.color}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey='OUT'
              stackId='a'
              fill={chartConfig.OUT.color}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
