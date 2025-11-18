import { axiosInstance } from '../axios';
import { API_ENDPOINTS } from '../endponts';
import type { ProductCategory, CreateProductCategoryDto, UpdateProductCategoryDto } from '../../types';

export const productCategoriesService = {
  async getAll(includeInactive = false): Promise<ProductCategory[]> {
    const params = includeInactive ? '?includeInactive=true' : '';
    const { data } = await axiosInstance.get(`${API_ENDPOINTS.PRODUCT_CATEGORIES.BASE}${params}`);
    return data;
  },

  async getById(id: string): Promise<ProductCategory> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.PRODUCT_CATEGORIES.BY_ID(id));
    return data;
  },

  async getProducts(id: string): Promise<any[]> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.PRODUCT_CATEGORIES.PRODUCTS(id));
    return data;
  },

  async create(categoryData: CreateProductCategoryDto): Promise<ProductCategory> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.PRODUCT_CATEGORIES.BASE, categoryData);
    return data;
  },

  async update(id: string, categoryData: UpdateProductCategoryDto): Promise<ProductCategory> {
    const { data } = await axiosInstance.put(API_ENDPOINTS.PRODUCT_CATEGORIES.BY_ID(id), categoryData);
    return data;
  },

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.PRODUCT_CATEGORIES.BY_ID(id));
  },

  async toggleStatus(id: string): Promise<ProductCategory> {
    const { data } = await axiosInstance.put(API_ENDPOINTS.PRODUCT_CATEGORIES.TOGGLE_STATUS(id));
    return data;
  },
};
