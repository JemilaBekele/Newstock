import { getSellById } from '@/service/Sell';
import { getProductsnew } from '@/service/Product'; // make sure this exists
import SalesForm from './form';
import { ISell } from '@/models/Sell';
import { IProduct } from '@/models/Product'; // adjust if needed

type SalesViewPageProps = {
  sellId: string; // renamed from supplierId
};

export default async function UserSalesViewPage({
  sellId
}: SalesViewPageProps) {
  let sell: ISell | null = null;
  let pageTitle = 'Create New Sell';

  // Fetch sell data if editing
  if (sellId !== 'new') {
    const data = await getSellById(sellId);
    sell = data as ISell;
    pageTitle = 'Edit Sell';
  }

  // Fetch products for the form
  const products: IProduct[] = await getProductsnew();

  return (
    <SalesForm initialData={sell} pageTitle={pageTitle} products={products} />
  );
}
