import { axiosInstance } from '../axios';
import { TechnicianStock } from '../../types';

export const technicianStockService = {
  // Get current user's (technician's) stock
  getMyStock: async (): Promise<TechnicianStock[]> => {
    const response = await axiosInstance.get('/technicians/my-stock');
    return response.data;
  },

  // Get specific technician's stock (for admins)
  getTechnicianStock: async (technicianId: string): Promise<TechnicianStock[]> => {
    const response = await axiosInstance.get(`/technicians/${technicianId}`);
    return response.data;
  },
};
