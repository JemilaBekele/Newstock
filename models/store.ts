import { IBranch } from './Branch';
import { IEmployee } from './employee';
import { IProductBatch } from './Product';
import { IShop } from './shop';
import { IUnitOfMeasure } from './UnitOfMeasure';

export interface IStore {
  id: string;
  name: string;
  branchId: string;
  branch?: IBranch;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Enum mirrors
export type StockStatus =
  | 'Available'
  | 'Reserved'
  | 'Sold'
  | 'Damaged'
  | 'Returned';
export type StockMovementType =
  | 'IN'
  | 'OUT'
  | 'TRANSFER'
  | 'ADJUSTMENT'
  | 'RETERN';

// StoreStock
export interface IStoreStock {
  id: string;
  storeId: string;
  store?: IStore;
  batchId: number;
  batch?: IProductBatch;
  quantity: number;
  status: StockStatus;
  branch?: IBranch;
  createdAt: string; // ISO date
  updatedAt: string;
  unitOfMeasureId: string; // foreign key
  unitOfMeasure?: IUnitOfMeasure; // ISO date
}

// ShopStock
export interface IShopStock {
  id: string;
  shopId: string;
  shop?: IShop;
  batchId: number;
  batch?: IProductBatch;
  quantity: number;
  status: StockStatus;
  createdAt: string; // ISO date
  updatedAt: string;
  unitOfMeasureId: string;
  // foreign key
  unitOfMeasure?: IUnitOfMeasure; // ISO date
}

// StockLedger
export interface IStockLedger {
  id: string;
  batchId: number;
  batch?: IProductBatch;
  unitOfMeasureId: string; // foreign key
  unitOfMeasure?: IUnitOfMeasure;
  storeId?: string;
  store?: IStore;

  shopId?: string;
  shop?: IShop;

  movementType: StockMovementType;
  quantity: number;

  reference?: string;
  userId?: string;
  user?: IEmployee;

  notes?: string;
  movementDate: string; // ISO date
  createdAt: string;
  updatedAt: string;
}
