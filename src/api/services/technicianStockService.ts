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

  // Get current user's (technician's) stock history
  getMyStockHistory: async () => {
    const response = await axiosInstance.get('/technicians/my-stock-history');
    return response.data;
  },

  // Get specific technician's stock history (for admins)
  getTechnicianStockHistory: async (technicianId: string) => {
    const response = await axiosInstance.get(`/technicians/${technicianId}/stock-history`);
    return response.data;
  },

  // Get all technician stock transactions (for admins)
  getAllStockTransactions: async () => {
    const response = await axiosInstance.get('/technicians/stock-transactions');
    return response.data;
  },

  // Get current stock summary for all technicians (for admins)
  getAllTechnicianStocks: async () => {
    const response = await axiosInstance.get('/technicians/all-stocks');
    return response.data;
  },
};
