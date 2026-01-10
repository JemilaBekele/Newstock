import { IEmployee } from './employee';
import { IProduct, IProductBatch } from './Product';
import { IShop } from './shop';
import { IUnitOfMeasure } from './UnitOfMeasure';
import { ISell, ItemSaleStatus } from './Sell';

export enum SellStockCorrectionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PARTIAL = 'PARTIAL'
}

export interface ISellStockCorrection {
  id: string;
isChecked: boolean;

  sellId?: string;
  sell?: ISell;

  status: SellStockCorrectionStatus;

  reference?: string;
  notes?: string;

  total: number;
  createdById?: string;
  createdBy?: IEmployee;

  updatedById?: string;
  updatedBy?: IEmployee;

  createdAt: string;
  updatedAt: string;

  items?: ISellStockCorrectionItem[];
}

export interface ISellStockCorrectionItem {
  id: string;

  correctionId: string;
  correction?: ISellStockCorrection;

  productId: string;
  product?: IProduct;

  shopId?: string;
  shop?: IShop;

  unitOfMeasureId: string;
  unitOfMeasure?: IUnitOfMeasure;
  itemSaleStatus: ItemSaleStatus;

  quantity: number; // positive or negative
  unitPrice: number;
  totalPrice: number;

  createdAt: string;
  updatedAt: string;

  batches?: ISellStockCorrectionBatch[];
}

export interface ISellStockCorrectionBatch {
  id: string;

  correctionItemId: string;
  correctionItem?: ISellStockCorrectionItem;

  batchId: string;
  batch?: IProductBatch;

  quantity: number; // qty from this batch
}
