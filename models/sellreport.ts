export interface ReportPeriod {
  startDate: string;
  endDate: string;
}

export interface ProductInfo {
  id: string;
  name: string;
  category?: any;
  subCategory?: any;
  unitOfMeasure?: any;
}

export interface BatchReportItem {
  batchId: string;
  batchNumber?: string;
  product?: ProductInfo;
  quantity: number;
  revenue: number;
  expiryDate?: string;
  valueScore?: number; // only for topItemsByValue
}

export interface SellerReportItem {
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
  totalRevenue: number;
  totalOrders: number;
}

export interface SalesReportResponse {
  success: boolean;
  reportPeriod: ReportPeriod;
  filters: {
    shopId?: string;
    limit: number;
    slowMoveThreshold: number;
  };
  summary: {
    totalItemsAnalyzed: number;
    totalSellers: number;
  };
  reports: {
    topItemsByQuantity: BatchReportItem[];
    topItemsByRevenue: BatchReportItem[];
    topItemsByValue: BatchReportItem[];
    slowMovingItems: BatchReportItem[];
    topSellers: SellerReportItem[];
  };
}
