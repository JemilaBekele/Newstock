import { IncomingMessage } from 'http';
import { axiosWithAuth } from './cli';

// Factory Reset
export const factoryReset = async (req?: IncomingMessage) => {
  try {
    const axiosInstance = axiosWithAuth(req);
    const response = await axiosInstance.post('/factory-reset');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Year End Reset
export const yearEndReset = async (req?: IncomingMessage) => {
  try {
    const axiosInstance = axiosWithAuth(req);
    const response = await axiosInstance.post('/year-end-reset');
    return response.data;
  } catch (error) {
    throw error;
  }
};
