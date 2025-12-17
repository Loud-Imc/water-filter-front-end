import { axiosInstance } from '../axios';
import { API_ENDPOINTS } from '../endponts';
import type { Product, CreateProductDto, UpdateProductDto, StockUpdateDto } from '../../types';

export const productService = {
  async getAllProducts(): Promise<Product[]> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.BASE);
    return data;
  },

  async getProductById(id: string): Promise<Product> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.BY_ID(id));
    return data;
  },

  async getLowStockProducts(): Promise<Product[]> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.LOW_STOCK);
    return data;
  },

  async createProduct(productData: CreateProductDto): Promise<Product> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.PRODUCTS.BASE, productData);
    return data;
  },

  async updateProduct(id: string, productData: UpdateProductDto): Promise<Product> {
    const { data } = await axiosInstance.put(API_ENDPOINTS.PRODUCTS.BY_ID(id), productData);
    return data;
  },

  async deleteProduct(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.PRODUCTS.BY_ID(id));
  },

  async updateStock(id: string, stockData: StockUpdateDto): Promise<{ newStock: number; message: string }> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.PRODUCTS.UPDATE_STOCK(id), stockData);
    return data;
  },

  async getLowStockCount(): Promise<number> {
    const { data } = await axiosInstance.get(
      API_ENDPOINTS.PRODUCTS.LOW_STOCK_COUNT,
    );
    return data.count;
  },

  async getFilteredProducts(filters: {
    company?: string;
    minPrice?: number;
    maxPrice?: number;
    minStock?: number;
    maxStock?: number;
    searchTerm?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters.company) params.append('company', filters.company);
    if (filters.minPrice !== undefined) params.append('minPrice', String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.append('maxPrice', String(filters.maxPrice));
    if (filters.minStock !== undefined) params.append('minStock', String(filters.minStock));
    if (filters.maxStock !== undefined) params.append('maxStock', String(filters.maxStock));
    if (filters.searchTerm) params.append('search', filters.searchTerm);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    console.log('filtered data :', filters);
    const { data } = await axiosInstance.get(
      `${API_ENDPOINTS.PRODUCTS.BY_FILTER}?${params.toString()}`,
    );
    return data;
  },

  // ✅ NEW: Technician stock management for products
  async getTechnicianStock(productId: string): Promise<any[]> {
    const { data } = await axiosInstance.get(`/products/${productId}/technician-stock`);
    return data;
  },

  async transferToTechnician(
    productId: string,
    technicianId: string,
    quantity: number
  ): Promise<any> {
    const { data } = await axiosInstance.post(
      `/products/${productId}/transfer-to-technician`,
      { technicianId, quantity }
    );
    return data;
  },

  async returnFromTechnician(
    productId: string,
    technicianId: string,
    quantity: number
  ): Promise<any> {
    const { data } = await axiosInstance.post(
      `/products/${productId}/return-from-technician`,
      { technicianId, quantity }
    );
    return data;
  },

};
