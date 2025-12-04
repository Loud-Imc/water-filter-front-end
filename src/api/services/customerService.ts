import { axiosInstance } from '../axios';
import { API_ENDPOINTS } from '../endponts';
import {type Customer } from '../../types';

export const customerService = {
 // In customerService.ts
async getAllCustomers(page: number = 1, limit: number = 10, regionId?: string) {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (regionId) {
    params.append('regionId', regionId);
  }

  const response = await axiosInstance.get(`/customers?${params.toString()}`);
  return response.data;
}
,

  async getCustomerById(id: string): Promise<Customer> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.CUSTOMERS.BY_ID(id));
    return data;
  },

  async createCustomer(customerData: Partial<Customer>): Promise<Customer> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.CUSTOMERS.BASE, customerData);
    return data;
  },

  async updateCustomer(id: string, customerData: Partial<Customer>): Promise<Customer> {
    const { data } = await axiosInstance.put(API_ENDPOINTS.CUSTOMERS.BY_ID(id), customerData);
    return data;
  },

   async updateLocation(id: string, customerData: Partial<Customer>): Promise<Customer> {
    const { data } = await axiosInstance.put(API_ENDPOINTS.CUSTOMERS.UPDATE_LOCATION(id), customerData);
    return data;
  },

  async deleteCustomer(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.CUSTOMERS.BY_ID(id));
  },

    searchCustomers: async (query: string, regionId?: string) => {
    const params: any = { query, limit: 50 };
    if (regionId) params.regionId = regionId;
    const response = await axiosInstance.get('/customers/search', { params });
    return response.data;
  },

  
};
