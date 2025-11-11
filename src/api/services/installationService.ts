import { axiosInstance } from '../axios';
import type { Installation, CreateInstallationDto, UpdateInstallationDto } from '../../types';

export const installationService = {
  // Get all installations
  getAllInstallations: async (isActive?: boolean): Promise<Installation[]> => {
    const params = isActive !== undefined ? { isActive } : {};
    const { data } = await axiosInstance.get('/installations', { params });
    return data;
  },

  // Search installations
  searchInstallations: async (
    query: string,
    customerId?: string,
    regionId?: string,
    limit: number = 20
  ): Promise<Installation[]> => {
    const params: any = { query, limit };
    if (customerId) params.customerId = customerId;
    if (regionId) params.regionId = regionId;
    
    const { data } = await axiosInstance.get('/installations/search', { params });
    return data;
  },

  // Get single installation
  getInstallationById: async (id: string): Promise<Installation> => {
    const { data } = await axiosInstance.get(`/installations/${id}`);
    return data;
  },

  // Get installations by customer
  getByCustomer: async (customerId: string): Promise<Installation[]> => {
    const { data } = await axiosInstance.get(`/installations/customer/${customerId}`);
    return data;
  },

  // Get installations by region
  getByRegion: async (regionId: string): Promise<Installation[]> => {
    const { data } = await axiosInstance.get(`/installations/region/${regionId}`);
    return data;
  },

  // Get installation history
  getInstallationHistory: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.get(`/installations/${id}/history`);
    return data;
  },

  // Create installation
  createInstallation: async (installationData: CreateInstallationDto): Promise<Installation> => {
    const { data } = await axiosInstance.post('/installations', installationData);
    return data;
  },

  // Update installation
  updateInstallation: async (
    id: string,
    installationData: UpdateInstallationDto
  ): Promise<Installation> => {
    const { data } = await axiosInstance.put(`/installations/${id}`, installationData);
    return data;
  },

  // Delete installation
  deleteInstallation: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/installations/${id}`);
  },

  // Deactivate installation
  deactivateInstallation: async (id: string): Promise<Installation> => {
    const { data } = await axiosInstance.put(`/installations/${id}/deactivate`);
    return data;
  },

  // Set as primary installation
  setPrimary: async (id: string): Promise<Installation> => {
    const { data } = await axiosInstance.put(`/installations/${id}/set-primary`);
    return data;
  },
};
