/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { IconTrendingUp } from '@tabler/icons-react';
import { Label, Pie, PieChart } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

const COLORS = [
  'var(--primary)',
  'var(--primary-light)',
  'var(--primary-lighter)',
  'var(--primary-dark)',
  'var(--primary-darker)'
];

export function StatusOverviewPieChart() {
  const [chartData, setChartData] = React.useState<
    { status: string; count: number; fill: string }[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const { charts } = await InventoryDashboardApi.getDashboard();
        const statusData = charts.statusOverview || [];
        const formattedData = statusData.map((item: any, index: number) => ({
          status: item.status,
          count: item.count,
          fill: COLORS[index % COLORS.length]
        }));
        setChartData(formattedData);
      } catch  {
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      count: { label: 'Count' }
    };
    chartData.forEach((item) => {
      config[item.status] = {
        label: item.status,
        color: item.fill
      };
    });
    return config;
  }, [chartData]);

  const totalCount = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0);
  }, [chartData]);

  const topStatus = React.useMemo(() => {
    return chartData.reduce(
      (max, item) => (item.count > max.count ? item : max),
      chartData[0] || { status: '', count: 0 }
    );
  }, [chartData]);

  if (isLoading) return <div>Loading...</div>;
  if (!chartData.length) return <div>No data available</div>;

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Status Overview</CardTitle>
        <CardDescription>
          <span className='hidden @[540px]/card:block'>
            Unit status distribution
          </span>
          <span className='@[540px]/card:hidden'>Status breakdown</span>
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square h-62.5'
        >
          <PieChart>
            <defs>
              {chartData.map((item, index) => (
                <linearGradient
                  key={item.status}
                  id={`fill${item.status}`}
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'
                >
                  <stop
                    offset='0%'
                    stopColor={item.fill}
                    stopOpacity={1 - (index % COLORS.length) * 0.15}
                  />
                  <stop
                    offset='100%'
                    stopColor={item.fill}
                    stopOpacity={0.8 - (index % COLORS.length) * 0.15}
                  />
                </linearGradient>
              ))}
            </defs>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData.map((item) => ({
                ...item,
                fill: `url(#fill${item.status})`
              }))}
              dataKey='count'
              nameKey='status'
              innerRadius={60}
              strokeWidth={2}
              stroke='var(--background)'
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-3xl font-bold'
                        >
                          {totalCount.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground text-sm'
                        >
                          Total
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col gap-2 text-sm'>
        <div className='flex items-center gap-2 leading-none font-medium'>
          {topStatus.status} leads with{' '}
          {((topStatus.count / totalCount) * 100).toFixed(1) || 0}%
          <IconTrendingUp className='h-4 w-4' />
        </div>
        <div className='text-muted-foreground leading-none'>
          Based on latest unit status data
        </div>
      </CardFooter>
    </Card>
  );
}
