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

// Define colors for dynamic categories
const COLORS = [
  'var(--primary)',
  'var(--primary-light)',
  'var(--primary-lighter)',
  'var(--primary-dark)',
  'var(--primary-darker)'
];

export function PieGraph() {
  const [chartData, setChartData] = React.useState<
    { category: string; totalQuantity: number; fill: string }[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const { charts } = await InventoryDashboardApi.getDashboard();
        const stockData = charts.stockByCategory || [];

        const formattedData = stockData.map((item: any, index: number) => ({
          category: item.category,
          totalQuantity: Number(item.totalQuantity) || 0, // convert string to number
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

  const totalQuantity = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.totalQuantity, 0);
  }, [chartData]);

  const topCategory = React.useMemo(() => {
    return chartData.reduce(
      (max, item) => (item.totalQuantity > max.totalQuantity ? item : max),
      chartData[0] || { category: '', totalQuantity: 0 }
    );
  }, [chartData]);

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      totalQuantity: { label: 'Total Quantity' }
    };
    chartData.forEach((item) => {
      config[item.category] = {
        label: item.category,
        color: item.fill
      };
    });
    return config;
  }, [chartData]);

  if (isLoading) return <div>Loading...</div>;
  if (!chartData.length) return <div>No data available</div>;

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Pie Chart - Stock by Category</CardTitle>
        <CardDescription>
          <span className='hidden @[540px]/card:block'>
            Total stock quantity by category
          </span>
          <span className='@[540px]/card:hidden'>Stock distribution</span>
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
                  key={item.category}
                  id={`fill${item.category}`}
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
                fill: `url(#fill${item.category})`
              }))}
              dataKey='totalQuantity'
              nameKey='category'
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
                          {totalQuantity.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground text-sm'
                        >
                          Total Quantity
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
          {topCategory.category} leads with{' '}
          {((topCategory.totalQuantity / totalQuantity) * 100).toFixed(1) || 0}%
          <IconTrendingUp className='h-4 w-4' />
        </div>
        <div className='text-muted-foreground leading-none'>
          Based on latest stock data
        </div>
      </CardFooter>
    </Card>
  );
}
