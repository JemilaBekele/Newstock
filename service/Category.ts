import { IncomingMessage } from 'http';
import { axiosWithAuth } from './cli';
import { api } from './api';
import { ICategory, ISubCategory } from '@/models/Category';

// Generic Pagination Params
export interface GetParams {
  page?: number;
  limit?: number;
}

// ========================= CATEGORIES ========================= //

// Get all categories
interface CategoriesResponse {
  success: boolean;
  count: number;
  categories: ICategory[];
}

export const getAllCategories = async ({
  page = 1,
  limit = 10
}: GetParams = {}) => {
  try {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    const url = `categories?${query}`;
    const response = await api.get<CategoriesResponse>(url);
    const categories = response.data.categories;

    return {
      categories,
      totalCount: response.data.count ?? categories.length,
      success: response.data.success
    };
  } catch (error) {
    throw error;
  }
};

export const getCategories = async (req?: IncomingMessage) => {
  try {
    const axiosInstance = axiosWithAuth(req);
    const response = await axiosInstance.get(`/categories`);
    return response.data.categories as ICategory[];
  } catch (error) {
    throw error;
  }
};
export const getCategoriesapi = async () => {
  try {
    const response = await api.get(`/categories`);
    return response.data.categories as ICategory[];
  } catch (error) {
    throw error;
  }
};

export const getCategoryById = async (id: string, req?: IncomingMessage) => {
  try {
    const axiosInstance = req ? axiosWithAuth(req) : api;
    const response = await axiosInstance.get(`/categories/${id}`);
    return response.data.category as ICategory;
  } catch (error) {
    throw error;
  }
};

export const createCategory = async (
  data: Partial<ICategory>,
  req?: IncomingMessage
) => {
  try {
    const axiosInstance = axiosWithAuth(req);
    const response = await axiosInstance.post(`/categories`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateCategory = async (
  id: string,
  data: Partial<ICategory>,
  req?: IncomingMessage
) => {
  try {
    const axiosInstance = axiosWithAuth(req);
    const response = await axiosInstance.put(`/categories/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteCategory = async (id: string, req?: IncomingMessage) => {
  try {
    const axiosInstance = axiosWithAuth(req);
    const response = await axiosInstance.delete(`/categories/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ========================= SUBCATEGORIES ========================= //

export const getSubCategoryById = async (id: string, req?: IncomingMessage) => {
  try {
    const axiosInstance = req ? axiosWithAuth(req) : api;
    const response = await axiosInstance.get(`/subcategories/${id}`);
    return response.data.subCategory as ISubCategory;
  } catch (error) {
    throw error;
  }
};

export const getSubCategories = async (req?: IncomingMessage) => {
  try {
    const axiosInstance = axiosWithAuth(req);
    const response = await axiosInstance.get(`/subcategories/veiw/all/find`);
    return response.data.subcategories as ISubCategory[];
  } catch (error) {
    throw error;
  }
};
export const getSubCategoriesapi = async () => {
  try {
    const response = await api.get(`/subcategories/veiw/all/find`);
    return response.data.subcategories as ISubCategory[];
  } catch (error) {
    throw error;
  }
};

export const createSubCategory = async (
  data: Partial<ISubCategory>,
  req?: IncomingMessage
) => {
  try {
    const axiosInstance = axiosWithAuth(req);
    const response = await axiosInstance.post(`/subcategories`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateSubCategory = async (
  id: string,
  data: Partial<ISubCategory>,
  req?: IncomingMessage
) => {
  try {
    const axiosInstance = axiosWithAuth(req);
    const response = await axiosInstance.put(`/subcategories/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteSubCategory = async (id: string, req?: IncomingMessage) => {
  try {
    const axiosInstance = axiosWithAuth(req);
    const response = await axiosInstance.delete(`/subcategories/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

interface SubCategoriesResponse {
  success: boolean;
  count: number;
  subcategories: ISubCategory[];
}

export const getSubCategoriesByCategory = async ({
  page = 1,
  limit = 10
}: { page?: number; limit?: number } = {}) => {
  try {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    const url = `subcategories/veiw/all/find?${query}`;
    const response = await api.get<SubCategoriesResponse>(url);
    const subcategories = response.data.subcategories;
    return {
      subcategories,
      totalCount: response.data.count ?? subcategories.length,
      success: response.data.success
    };
  } catch (error) {
    throw error;
  }
};
