import { axiosInstance } from '../axios';
import { API_ENDPOINTS } from '../endponts';

export const settingsService = {
  async getLowStockThreshold(): Promise<number> {
    const { data } = await axiosInstance.get(
      API_ENDPOINTS.SYSTEM_SETTINGS.GET_LOW_STOCK_THRESHOLD,
    );
    return data.threshold;
  },

  async setLowStockThreshold(threshold: number): Promise<void> {
    await axiosInstance.put(
      API_ENDPOINTS.SYSTEM_SETTINGS.SET_LOW_STOCK_THRESHOLD,
      { threshold },
    );
  },
};
