import { axiosInstance } from '../axios';
import { API_ENDPOINTS } from '../endponts';
import type { AssemblyHistory } from '../../types';

export const assembliesService = {
  async getAll(filters?: {
    productId?: string;
    bomTemplateId?: string;
    assembledBy?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<AssemblyHistory[]> {
    const params = new URLSearchParams();
    if (filters?.productId) params.append('productId', filters.productId);
    if (filters?.bomTemplateId) params.append('bomTemplateId', filters.bomTemplateId);
    if (filters?.assembledBy) params.append('assembledBy', filters.assembledBy);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.limit) params.append('limit', String(filters.limit));

    const { data } = await axiosInstance.get(
      `${API_ENDPOINTS.ASSEMBLIES.BASE}?${params.toString()}`
    );
    return data;
  },

  async getById(id: string): Promise<AssemblyHistory> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.ASSEMBLIES.BY_ID(id));
    return data;
  },

  async getStats(filters?: { startDate?: string; endDate?: string }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const { data } = await axiosInstance.get(
      `${API_ENDPOINTS.ASSEMBLIES.STATS}?${params.toString()}`
    );
    return data;
  },

  async getByProduct(productId: string): Promise<AssemblyHistory[]> {
    const { data } = await axiosInstance.get(
      `${API_ENDPOINTS.ASSEMBLIES.BY_PRODUCT}?productId=${productId}`
    );
    return data;
  },

  async getByAssembler(userId: string): Promise<AssemblyHistory[]> {
    const { data } = await axiosInstance.get(
      `${API_ENDPOINTS.ASSEMBLIES.BY_ASSEMBLER}?userId=${userId}`
    );
    return data;
  },

  async getRecent(limit = 10): Promise<AssemblyHistory[]> {
    const { data } = await axiosInstance.get(
      `${API_ENDPOINTS.ASSEMBLIES.RECENT}?limit=${limit}`
    );
    return data;
  },

  async getCostBreakdown(id: string): Promise<any> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.ASSEMBLIES.COST_BREAKDOWN(id));
    return data;
  },
};
