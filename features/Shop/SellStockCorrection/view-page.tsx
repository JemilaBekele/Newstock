// import { getSellStockCorrectionById } from '@/service/SellStockCorrection';
// import { getProducts } from '@/service/Product'; // make sure this exists
// import StockCorrectionForm from './form';
// import { ISellStockCorrection } from '@/models/SellStockCorrection';
// import { IProduct } from '@/models/Product'; // adjust if needed

// type StockCorrectionViewPageProps = {
//   correctionId: string; // renamed from sellId
// };

// export default async function StockCorrectionViewPage({ correctionId }: StockCorrectionViewPageProps) {
//   let correction: ISellStockCorrection | null = null;
//   let pageTitle = 'Create New Stock Correction';

//   // Fetch stock correction data if editing
//   if (correctionId !== 'new') {
//     correction = await getSellStockCorrectionById(correctionId);
//     pageTitle = 'Edit Stock Correction';
//   }

//   // Fetch products for the form
//   const products: IProduct[] = await getProducts();

//   return (
//     <StockCorrectionForm
//       initialData={correction}
//       pageTitle={pageTitle}
//       products={products}
//     />
//   );
// }
