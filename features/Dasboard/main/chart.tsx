'use client';

import { TrendingUp } from 'lucide-react';
import { Pie, PieChart, Cell } from 'recharts';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

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
import { getSellStatusChartApi } from '@/service/Report';

// 橙色调色板 - 从深到浅的橙色渐变
const ORANGE_PALETTE = [
  '#E85D04', // 深橙色 - 用于最高值
  '#F48C06', // 金色橙色
  '#FF6B35', // 亮橙色
  '#FF8C42', // 中等橙色
  '#FF9F1C', // 橙黄色
  '#FFA552', // 浅橙色
  '#FFB347', // 珊瑚橙
  '#FFC085', // 非常浅的橙色
  '#FFCC99', // 浅米色橙
  '#FFE5CC', // 极浅橙色
];

interface ChartDataItem {
  status: string;
  amount: number;
  fill: string;
  label: string;
  count: number;
  percentage: number;
}

interface SellStatusChartData {
  success: boolean;
  summary: {
    totalNetTotal: number;
    totalCount: number;
    data: ChartDataItem[];
  };
  chartData: ChartDataItem[];
  chartConfig: ChartConfig;
  totalAmount: number;
  totalTransactions: number;
}

export function SellStatusChart() {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [chartConfig, setChartConfig] = useState<ChartConfig>({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const data: SellStatusChartData = await getSellStatusChartApi();

        if (data.success) {
          const sortedData = [...data.chartData].sort((a, b) => b.amount - a.amount);
          
          const orangeChartData = sortedData.map((item, index) => ({
            ...item,
            fill: ORANGE_PALETTE[Math.min(index, ORANGE_PALETTE.length - 1)]
          }));

          setChartData(orangeChartData);
          
          const updatedConfig: ChartConfig = {};
          orangeChartData.forEach((item, index) => {
            updatedConfig[item.status] = {
              label: item.label,
              color: ORANGE_PALETTE[Math.min(index, ORANGE_PALETTE.length - 1)]
            };
          });
          setChartConfig(updatedConfig);
          
          setTotalAmount(data.totalAmount);
          setTotalTransactions(data.totalTransactions);
        }
      } catch  {
        toast.error(
          'Failed to load sales status chart data. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  if (loading) {
    return (
      <Card className='flex flex-col'>
        <CardHeader className='items-center pb-0'>
          <CardTitle>Sales Status Distribution</CardTitle>
          <CardDescription>Loading chart data...</CardDescription>
        </CardHeader>
        <CardContent className='flex-1 pb-0'>
          <div className='flex aspect-square max-h-62.5 items-center justify-center'>
            <div className='text-muted-foreground'>Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='flex flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Sales Status Distribution</CardTitle>
        <CardDescription>Breakdown by order status</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square max-h-62.5 pb-0'
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name) => [
                    `$${Number(value).toLocaleString()}`,
                    chartConfig[name as keyof ChartConfig]?.label || name
                  ]}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey='amount'
              nameKey='status'
              label={false} // Remove labels from the pie slices
              labelLine={false}
              strokeWidth={2}
              stroke="#FFF" // 保持白色描边
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill} // 
                  stroke="#FFF" // 
                  strokeWidth={2}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col gap-2 text-sm'>
        <div className='flex items-center gap-2 leading-none font-medium'>
          Total Sales: ${totalAmount.toLocaleString()}
          <TrendingUp className='h-4 w-4' />
        </div>
        <div className='text-muted-foreground leading-none'>
          {totalTransactions} transactions across{' '}
          {chartData.filter((item) => item.count > 0).length} status categories
        </div>

        {/* Status Legend - */}
        <div className='mt-4 grid w-full grid-cols-2 gap-2'>
          {chartData
            .filter((item) => item.count > 0)
            .map((item) => (
              <div
                key={item.status}
                className='flex items-center gap-2 text-xs'
              >
                <div
                  className='h-3 w-3 rounded-full'
                  style={{ backgroundColor: item.fill }} // legend
                />
                <span className='font-medium'>{item.label}:</span>
                <span className='text-muted-foreground'>({item.count})</span>
              </div>
            ))}
        </div>
      </CardFooter>
    </Card>
  );
}