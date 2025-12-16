import { ICategory } from './Category';
import { IShop } from './shop';
import { IShopStock } from './store';
import { IUnitOfMeasure } from './UnitOfMeasure';

export interface IAdditionalPrice {
  id: string;
  label?: string;
  price: number;
  batchId: string;
  shopId: string;
  shop?: IShop;
  createdAt: string;
  updatedAt: string;
}
export interface IProduct {
  id: string;
  imageUrl?: string;

  productCode: string;
  generic?: string;
  name: string;
  description?: string;
  unitOfMeasureId: string; // foreign key
  unitOfMeasure?: IUnitOfMeasure;
  unit: string;

  sellPrice: number;

  categoryId: string;
  subCategoryId?: string;

  isActive: boolean;
  additionalPrices?: IAdditionalPrice[];
  batches?: IProductBatch[];
  createdAt: string;
  updatedAt: string;
  stockSummary: IStockSummary;
  category: ICategory;
  subCategory?: ICategory;
  overallTotals: IOverallTotals;
  AdditionalPrice: IAdditionalPrice[];
  // Added overallTotals property
}
export interface IProductBatch {
  id: string;
  batchNumber: string;
  expiryDate?: string;
  productId: string;
  // ISO date string
  price?: number;
  stock?: number;
  warningQuantity?: number;
  availableQuantity?: number;
  storeId?: string;
  ShopStock: IShopStock[];
  createdAt: string;
  updatedAt: string;
  product?: IProduct;
}

export interface IStockSummary {
  shopStocks: {
    [shopName: string]: {
      quantity: number;
      branchId?: string;
      branchName?: string;
    };
  };
  storeStocks: {
    [storeName: string]: {
      quantity: number;
      branchId?: string;
      branchName?: string;
    };
  };
  totalShopStock: number;
  totalStoreStock: number;
  totalStock: number;
}

export interface IOverallTotals {
  totalShopStock: number;
  totalStoreStock: number;
  totalAllStock: number;
  shopTotals: { [shopName: string]: number };
  storeTotals: { [storeName: string]: number };
}
