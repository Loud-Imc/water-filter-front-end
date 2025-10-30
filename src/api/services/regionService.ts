import { axiosInstance } from '../axios';
import { API_ENDPOINTS } from '../endponts'; 
import {type Region } from '../../types';

export const regionService = {
  async getAllRegions(): Promise<Region[]> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.REGIONS.BASE);
    return data;
  },

  async getRegionById(id: string): Promise<Region> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.REGIONS.BY_ID(id));
    return data;
  },

  async createRegion(regionData: Partial<Region>): Promise<Region> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.REGIONS.BASE, regionData);
    return data;
  },

  async updateRegion(id: string, regionData: Partial<Region>): Promise<Region> {
    const { data } = await axiosInstance.put(API_ENDPOINTS.REGIONS.BY_ID(id), regionData);
    return data;
  },

  async deleteRegion(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.REGIONS.BY_ID(id));
  },

    searchRegions: async (query: string) => {
    const response = await axiosInstance.get('/regions/search', {
      params: { query, limit: 50 },
    });
    return response.data;
  },
};
