import { IBranch } from './Branch';
import { ICustomer } from './customer';
import { IEmployee } from './employee';
import { IShop } from './shop';
import { IUnitOfMeasure } from './UnitOfMeasure';
import { IProduct, IProductBatch } from './Product'; // Replaces IProductBatch
import { ISellStockCorrection } from './SellStockCorrection';

export enum SaleStatus {
  NOT_APPROVED = 'NOT_APPROVED',
  PARTIALLY_DELIVERED = 'PARTIALLY_DELIVERED',
  APPROVED = 'APPROVED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum ItemSaleStatus {
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED'
}

// ✅ Sell Model Interface
export interface ISell {
  id: string; // UUID
  invoiceNo: string;
  locked: boolean;
  saleStatus: SaleStatus; // Matches enum

  branchId?: string;
  branch?: IBranch;

  customerId?: string;
  customer?: ICustomer;

  totalProducts: number;
  subTotal: number;
  discount: number;
  vat: number;
  grandTotal: number;
  NetTotal: number;

  notes?: string;
  saleDate: string; // ISO string date

  createdById?: string;
  createdBy?: IEmployee;

  updatedById?: string;
  updatedBy?: IEmployee;

  createdAt: string;
  updatedAt: string;

  // Relations
  items?: ISellItem[];
  SellStockCorrection?: ISellStockCorrection[];
}

// ✅ SellItem Model Interface
export interface ISellItem {
  id: string;
  sellId: string;
  sell?: ISell;

  productId: string;
  product?: IProduct;

  shopId: string;
  shop?: IShop;

  unitOfMeasureId: string;
  unitOfMeasure?: IUnitOfMeasure;

  itemSaleStatus: ItemSaleStatus;

  quantity: number;
  unitPrice: number;
  totalPrice: number;

  createdAt: string;
  updatedAt: string;

  batches?: ISellItemBatch[];
}

// ✅ SellItemBatch Model Interface
export interface ISellItemBatch {
  id: string;
  sellItemId: string;
  sellItem?: ISellItem;

  batchId: string;
  batch?: IProductBatch;

  quantity: number;
}
