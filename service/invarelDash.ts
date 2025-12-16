import { IncomingMessage } from 'http';
import { axiosWithAuth } from './cli';

export const InventoryDashboardApi = {
  // 📊 Get comprehensive inventory dashboard data
  getDashboard: async (req?: IncomingMessage) => {
    const axiosInstance = axiosWithAuth(req);
    const response = await axiosInstance.get('/inventory-dashboard/dashboard');
    return response.data;
  },

  // ⏳ Get batch expiration details
  getExpiringBatches: async (
    options?: { withinDays?: number },
    req?: IncomingMessage
  ) => {
    const axiosInstance = axiosWithAuth(req);
    const query = new URLSearchParams();

    if (options?.withinDays) {
      query.append('withinDays', options.withinDays.toString());
    }

    const url = `/inventory-dashboard/expiring-batches${
      query.toString() ? `?${query.toString()}` : ''
    }`;

    const response = await axiosInstance.get(url);
    return response.data;
  },

  // 🏬 Get stock summary by location (stores + shops)
  getStockSummaryByLocation: async (req?: IncomingMessage) => {
    const axiosInstance = axiosWithAuth(req);
    const response = await axiosInstance.get(
      '/inventory-dashboard/location-summary'
    );
    return response.data;
  }
};
