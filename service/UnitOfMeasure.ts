import { IncomingMessage } from 'http';
import { axiosWithAuth } from './cli';
import { api } from './api';
import { IUnitOfMeasure } from '@/models/UnitOfMeasure';

export interface GetParams {
  page?: number;
  limit?: number;
}

// Response for getAll
interface UnitsResponse {
  success: boolean;
  count: number;
  units: IUnitOfMeasure[];
}

// Get all UnitsOfMeasure (paginated)
export const getAllUnitsOfMeasure = async ({
  page = 1,
  limit = 10
}: GetParams = {}) => {
  try {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    const url = `/units-of-measure?${query}`;
    const response = await api.get<UnitsResponse>(url);
    const units = response.data.units;

    return {
      units: units,
      totalCount: response.data.count ?? units.length,
      success: response.data.success
    };
  } catch (error) {
    throw error;
  }
};

// Get UnitsOfMeasure (SSR-safe)
export const getUnitsOfMeasure = async (req?: IncomingMessage) => {
  try {
    const axiosInstance = axiosWithAuth(req);
    const response = await axiosInstance.get(`/units-of-measure`);
    return response.data.units as IUnitOfMeasure[];
  } catch (error) {
    throw error;
  }
};

// Get UnitOfMeasure by ID
export const getUnitOfMeasureById = async (
  id: string,
  req?: IncomingMessage
) => {
  try {
    const axiosInstance = req ? axiosWithAuth(req) : api;
    const response = await axiosInstance.get(`/units-of-measure/${id}`);
    return response.data.unit as IUnitOfMeasure;
  } catch (error) {
    throw error;
  }
};

// Create UnitOfMeasure
export const createUnitOfMeasure = async (
  data: Partial<IUnitOfMeasure> | FormData,
  req?: IncomingMessage
) => {
  try {
    const axiosInstance = axiosWithAuth(req);
    const config =
      data instanceof FormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {};

    const response = await axiosInstance.post(
      `/units-of-measure`,
      data,
      config
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update UnitOfMeasure
export const updateUnitOfMeasure = async (
  id: string,
  data: Partial<IUnitOfMeasure> | FormData,
  req?: IncomingMessage
) => {
  try {
    const axiosInstance = axiosWithAuth(req);
    const config =
      data instanceof FormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {};

    const response = await axiosInstance.put(
      `/units-of-measure/${id}`,
      data,
      config
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete UnitOfMeasure
export const deleteUnitOfMeasure = async (
  id: string,
  req?: IncomingMessage
) => {
  try {
    const axiosInstance = axiosWithAuth(req);
    const response = await axiosInstance.delete(`/units-of-measure/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
