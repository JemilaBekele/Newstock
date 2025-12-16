import { IncomingMessage } from 'http';
import { axiosWithAuth } from './cli';
import { api } from './api';
import { ITransfer } from '@/models/transfer';
import { PaginationParams } from './store';

interface TransfersResponse {
  success: boolean;
  count: number;
  transfers: ITransfer[];
}

// ✅ Get all transfers with pagination + filters transfers
export const getAllTransfers = async ({
  page = 1,
  limit = 10,
  startDate,
  endDate
}: PaginationParams = {}): Promise<{
  data: ITransfer[];
  totalCount: number;
  success?: boolean;
}> => {
  try {
    const axiosInstance = api;

    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (startDate) {
      query.append('startDate', startDate);
    }
    if (endDate) {
      query.append('endDate', endDate);
    }

    const url = `/transfers?${query}`;

    const response = await axiosInstance.get<TransfersResponse>(url);

    return {
      data: response.data.transfers,
      totalCount: response.data.count ?? response.data.transfers.length,
      success: response.data.success
    };
  } catch (error) {
    throw error;
  }
};

// ✅ Get transfers (simple version)
export const getTransfers = async (req?: IncomingMessage) => {
  try {
    const axiosInstance = axiosWithAuth(req);
    const response = await axiosInstance.get(`/transfers`);
    return response.data.transfers as ITransfer[];
  } catch (error) {
    throw error;
  }
};

// ✅ Get transfer by ID
export const getTransferById = async (id: string, req?: IncomingMessage) => {
  try {
    const axiosInstance = req ? axiosWithAuth(req) : api;
    const response = await axiosInstance.get(`/transfers/${id}`);
    return response.data.transfer as ITransfer;
  } catch (error) {
    throw error;
  }
};

export const getTransferId = async (id: string, req?: IncomingMessage) => {
  try {
    const axiosInstance = axiosWithAuth(req);
    const response = await axiosInstance.get(`/transfers/${id}`);
    return response.data.transfer as ITransfer;
  } catch (error) {
    throw error;
  }
};
// Get batches by transfer ID
export const getTransferBatches = async (
  transferId: string,
  req?: IncomingMessage
) => {
  try {
    const axiosInstance = axiosWithAuth(req);
    const response = await axiosInstance.get(`transfers/batches/${transferId}`);
    return response.data.batches; // array of batches
  } catch (error) {
    throw error;
  }
};
export const bulkUpdateAdditionalPrices = async (
  batchUpdates: any,
  req?: IncomingMessage
) => {
  try {
    const axiosInstance = axiosWithAuth(req);
    const response = await axiosInstance.put(
      '/transfers/batches/additional-prices',
      batchUpdates
    );
    return response.data; // contains totalProcessed and updated batches
  } catch (error) {
    throw error;
  }
};
// ✅ Get transfer by reference
export const getTransferByReference = async (
  reference: string,
  req?: IncomingMessage
) => {
  try {
    const axiosInstance = req ? axiosWithAuth(req) : api;
    const response = await axiosInstance.get(
      `/transfers/reference/${reference}`
    );
    return response.data.transfer as ITransfer;
  } catch (error) {
    throw error;
  }
};

// ✅ Create a transfer
export const createTransfer = async (data: any, req?: IncomingMessage) => {
  try {
    const axiosInstance = axiosWithAuth(req);
    const response = await axiosInstance.post(`/transfers`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ✅ Update a transfer
export const updateTransfer = async (
  id: string,
  data: any,
  req?: IncomingMessage
) => {
  try {
    const axiosInstance = axiosWithAuth(req);
    const response = await axiosInstance.put(`/transfers/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ✅ Complete a transfer
export const completeTransfer = async (id: string, req?: IncomingMessage) => {
  try {
    const axiosInstance = axiosWithAuth(req);
    const response = await axiosInstance.post(`/transfers/${id}/complete`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ✅ Cancel a transfer
export const cancelTransfer = async (id: string, req?: IncomingMessage) => {
  try {
    const axiosInstance = axiosWithAuth(req);
    const response = await axiosInstance.post(`/transfers/${id}/cancel`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ✅ Delete a transfer
export const deleteTransfer = async (id: string, req?: IncomingMessage) => {
  try {
    const axiosInstance = axiosWithAuth(req);
    const response = await axiosInstance.delete(`/transfers/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
