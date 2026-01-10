/* eslint-disable @typescript-eslint/no-explicit-any */
import { IncomingMessage } from 'http';
import { axiosWithAuth } from './cli';
import { api } from './api';
import { PaginationParams } from './store';
import { ISellStockCorrection } from '@/models/SellStockCorrection';
import { Console } from 'console';

// 🔹 API Response type
interface SellStockCorrectionResponse {
  success: boolean;
  count: number;
  sellStockCorrections: ISellStockCorrection[];
}

// ✅ Get all sell stock corrections with pagination + optional date filter
export const getAllSellStockCorrections = async ({
  page = 1,
  limit = 10,
  startDate,
  endDate
}: PaginationParams = {}): Promise<{
  data: ISellStockCorrection[];
  totalCount: number;
  success?: boolean;
}> => {
  try {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    if (startDate) query.append('startDate', startDate);
    if (endDate) query.append('endDate', endDate);

    const url = `/sell-stock-corrections?${query}`;
    const response = await api.get<SellStockCorrectionResponse>(url);

    return {
      data: response.data.sellStockCorrections,
      totalCount:
        response.data.count ?? response.data.sellStockCorrections.length,
      success: response.data.success
    };
  } catch (error) {
    throw error;
  }
};

// ✅ Get sell stock corrections (simple version)
export const getSellStockCorrections = async (req?: IncomingMessage) => {
  try {
    const axiosInstance = axiosWithAuth(req);
    const response = await axiosInstance.get(`/sell-stock-corrections`);
    return response.data.sellStockCorrections as ISellStockCorrection[];
  } catch (error) {
    throw error;
  }
};
export const getSellById = async (id: string, req?: IncomingMessage) => {
  try {
    const axiosInstance = req ? axiosWithAuth(req) : api;
    const response = await axiosInstance.get(
      `sell/stock/corrections/find/${id}`
    );
    return response.data.sell;
  } catch (error) {
    throw error;
  }
};
// ✅ Get sell stock correction by ID
export const getSellStockCorrectionById = async (
  id: string,
  req?: IncomingMessage
) => {
  try {
    const axiosInstance = req ? axiosWithAuth(req) : api;
    const response = await axiosInstance.get(`/sell-stock-corrections/${id}`);
    return response.data.sellStockCorrection as ISellStockCorrection;
  } catch (error) {
    throw error;
  }
};

// ✅ Get sell stock correction by reference
export const getSellStockCorrectionByReference = async (
  reference: string,
  req?: IncomingMessage
) => {
  try {
    const axiosInstance = req ? axiosWithAuth(req) : api;
    const response = await axiosInstance.get(
      `/sell-stock-corrections/reference/${reference}`
    );
    return response.data.sellStockCorrection as ISellStockCorrection;
  } catch (error) {
    throw error;
  }
};

// ✅ Get sell stock corrections by sell ID 
export const getSellStockCorrectionsBySellId = async (
  sellId: string,
  req?: IncomingMessage
) => {
  try {
    const axiosInstance = axiosWithAuth(req);
    const response = await axiosInstance.get(
      `/sells/${sellId}/stock-corrections`
    );
    return response.data.sellStockCorrections as ISellStockCorrection[];
  } catch (error) {
    throw error;
  }
};
export const getSellStockCorrectionsfilterSellId = async (
  sellId: string,
  req?: IncomingMessage
) => {
  try {
    const axiosInstance = axiosWithAuth(req);
    const response = await axiosInstance.get(
      `/sells/${sellId}/stock/corrections/filter/stock`
    );
    return response.data.sellStockCorrections as ISellStockCorrection[];
  } catch (error) {
    throw error;
  }
};

// ✅ Create sell stock correction
export const createSellStockCorrection = async (
  data: any,
  req?: IncomingMessage
) => {
  try {
    const axiosInstance = axiosWithAuth(req);
    const response = await axiosInstance.post(`/sell-stock-corrections`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ✅ Update sell stock correction
export const updateSellStockCorrection = async (
  id: string,
  data: any,
  req?: IncomingMessage
) => {
  try {
    const axiosInstance = axiosWithAuth(req);
    const response = await axiosInstance.put(
      `/sell-stock-corrections/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ✅ Approve sell stock correction
export const approveSellStockCorrection = async (
  id: string,
  deliveredItemIds: string[] = [],
  req?: IncomingMessage
) => {
  try {
    const axiosInstance = axiosWithAuth(req);
    const response = await axiosInstance.patch(
      `/sell-stock-corrections/${id}/approve`,
      { deliveredItemIds }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ✅ Reject sell stock correction
export const rejectSellStockCorrection = async (
  id: string,
  req?: IncomingMessage
) => {
  try {
    const axiosInstance = axiosWithAuth(req);
    const response = await axiosInstance.patch(
      `/sell-stock-corrections/${id}/reject`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const markAsCheckedSellStockCorrection = async (
  id: string,
  req?: IncomingMessage
) => {
  try {
    const axiosInstance = axiosWithAuth(req);
    const response = await axiosInstance.patch(
      `/sells/${id}/check/sellcorrection`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
// ✅ Delete sell stock correction
export const deleteSellStockCorrection = async (
  id: string,
  req?: IncomingMessage
) => {
  try {
    const axiosInstance = axiosWithAuth(req);
    const response = await axiosInstance.delete(
      `/sell-stock-corrections/${id}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
