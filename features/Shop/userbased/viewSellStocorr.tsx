import { ISell } from '@/models/Sell';
import {
  ISellStockCorrection,
  SellStockCorrectionStatus
} from '@/models/SellStockCorrection';
import { getSellById } from '@/service/SellStockCorrection';
import SellCorrectionForm from './SellStockCorre';
import { toast } from 'sonner';

type TSellViewPageProps = {
  sellId: string;
};

export default async function SellViewPage({ sellId }: TSellViewPageProps) {
  let sell: ISell | null = null;
  let initialData: ISellStockCorrection | null = null;

  if (sellId !== 'new') {
    try {
      sell = await getSellById(sellId);

      // Transform sell data into initialData for ISellStockCorrection
      // Using the enhanced sell data with batch availability
      initialData = {
        id: '', // Will be generated when creating
        sellId: sellId,
        status: 'PENDING' as SellStockCorrectionStatus,
        reference: sell?.invoiceNo,
        total: 0, // Will be calculated based on items
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items:
          sell?.items?.map((item) => {
            // Calculate total price for this item
            const totalPrice =
              Number(item.unitPrice) * Math.abs(Number(item.quantity));

            return {
              id: '', // Will be generated when creating
              correctionId: '', // Will be set when creating correction
              productId: item.productId?.toString() || '',
              shopId: item.shopId?.toString(),
              unitOfMeasureId: item.unitOfMeasureId?.toString() || '',
              quantity: 0, // Start with 0 adjustment
              unitPrice: Number(item.unitPrice),
              totalPrice: totalPrice,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              batches:
                item.batches?.map((sellBatch) => ({
                  id: '', // Will be generated when creating
                  correctionItemId: '', // Will be set when creating correction item
                  batchId: sellBatch.batchId?.toString() || '',
                  quantity: 0 // Start with 0 adjustment
                })) || []
            };
          }) || []
      } as ISellStockCorrection;
    } catch (error) {
      toast.error(error as string);
    }
  }

  return (
    <SellCorrectionForm
      sellId={sellId}
      initialData={initialData}
      sellData={sell}
    />
  );
}
