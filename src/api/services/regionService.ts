import { axiosInstance } from '../axios';
import { API_ENDPOINTS } from '../endponts';
import type { Region, StateData, DistrictData, CityData } from '../../types';

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

  async searchRegions(query: string) {
    const response = await axiosInstance.get('/regions/search', {
      params: { query, limit: 50 },
    });
    return response.data;
  },

  // ✅ NEW: India Places methods
  async getStates(): Promise<StateData[]> {
    const { data } = await axiosInstance.get('/regions/india-places/states');
    return data;
  },

  async getDistricts(state: string): Promise<DistrictData[]> {
    const { data } = await axiosInstance.get(`/regions/india-places/districts/${encodeURIComponent(state)}`);
    return data;
  },

  async getCities(state: string, district: string): Promise<CityData[]> {
    const { data } = await axiosInstance.get(
      `/regions/india-places/cities/${encodeURIComponent(state)}/${encodeURIComponent(district)}`
    );
    return data;
  },

  async getLocationByPincode(pincode: string): Promise<CityData[]> {
    const { data } = await axiosInstance.get(`/regions/india-places/pincode/${pincode}`);
    return data;
  },
};
