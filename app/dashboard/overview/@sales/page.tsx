import { SellStatusChart } from '@/features/Dasboard/main/chart';
import { delay } from '@/lib/delay';

export default async function Sales() {
  await delay(3000);
  return <SellStatusChart />;
}
