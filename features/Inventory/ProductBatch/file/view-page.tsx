import { getProductBatchById } from '@/service/productBatchService';
import ProductBatchForm from './form';
import { IProductBatch } from '@/models/Product';

type TProductBatchViewPageProps = {
  batchId: string;
};

export default async function ProductBatchViewPage({
  batchId
}: TProductBatchViewPageProps) {
  let productBatch: IProductBatch | null = null;
  let pageTitle = 'Create New Product Batch';

  if (batchId !== 'new') {
    const data = await getProductBatchById(batchId);
    productBatch = data as IProductBatch;
    pageTitle = 'Edit Product Batch';
  }

  return <ProductBatchForm initialData={productBatch} pageTitle={pageTitle} />;
}
