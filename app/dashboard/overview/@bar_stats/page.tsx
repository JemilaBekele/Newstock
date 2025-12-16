import { SellTrendChart } from '@/features/overview/bar-graph';
import { delay } from '@/lib/delay';

export default async function BarStats() {
  await delay(1000);

  return <SellTrendChart />;
}
