import { axiosInstance } from '../axios';
import { API_ENDPOINTS } from '../endponts';
import type { SparePart, CreateSparePartDto, UpdateSparePartDto, TechnicianStock } from '../../types';

export const sparePartsService = {
  async getAll(groupId?: string): Promise<SparePart[]> {
    const params = groupId ? `?groupId=${groupId}` : '';
    const { data } = await axiosInstance.get(`${API_ENDPOINTS.SPARE_PARTS.BASE}${params}`);
    return data;
  },

  async getById(id: string): Promise<SparePart> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.SPARE_PARTS.BY_ID(id));
    return data;
  },

  async getLowStockSpareParts(): Promise<SparePart[]> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.SPARE_PARTS.LOW_STOCK);
    return data;
  },

  async getLowStockCount(): Promise<number> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.SPARE_PARTS.LOW_STOCK_COUNT);
    return data.count;
  },

  async getByGroup(groupId: string): Promise<SparePart[]> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.SPARE_PARTS.BY_GROUP(groupId));
    return data;
  },

  async getFilteredSpareParts(filters: {
    groupId?: string;
    company?: string;
    minPrice?: number;
    maxPrice?: number;
    minStock?: number;
    maxStock?: number;
    searchTerm?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<SparePart[]> {
    const params = new URLSearchParams();
    if (filters.groupId) params.append('groupId', filters.groupId);
    if (filters.company) params.append('company', filters.company);
    if (filters.minPrice !== undefined) params.append('minPrice', String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.append('maxPrice', String(filters.maxPrice));
    if (filters.minStock !== undefined) params.append('minStock', String(filters.minStock));
    if (filters.maxStock !== undefined) params.append('maxStock', String(filters.maxStock));
    if (filters.searchTerm) params.append('search', filters.searchTerm);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const { data } = await axiosInstance.get(
      `${API_ENDPOINTS.SPARE_PARTS.FILTERED}?${params.toString()}`
    );
    return data;
  },

  async create(sparePartData: CreateSparePartDto): Promise<SparePart> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.SPARE_PARTS.BASE, sparePartData);
    return data;
  },

  async update(id: string, sparePartData: UpdateSparePartDto): Promise<SparePart> {
    const { data } = await axiosInstance.put(API_ENDPOINTS.SPARE_PARTS.BY_ID(id), sparePartData);
    return data;
  },

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.SPARE_PARTS.BY_ID(id));
  },

  async updateStock(id: string, stockData: { quantityChange: number; reason: string }): Promise<{ newStock: number; message: string }> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.SPARE_PARTS.UPDATE_STOCK(id), stockData);
    return data;
  },

  async getTechnicianStock(id: string): Promise<TechnicianStock[]> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.SPARE_PARTS.TECHNICIAN_STOCK(id));
    return data;
  },

  async transferToTechnician(id: string, technicianId: string, quantity: number): Promise<any> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.SPARE_PARTS.TRANSFER_TO_TECHNICIAN(id), {
      technicianId,
      quantity,
    });
    return data;
  },
};
