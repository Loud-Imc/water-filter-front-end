import { axiosInstance } from '../axios';
import { API_ENDPOINTS } from '../endponts';
import {type Customer } from '../../types';

export const customerService = {
  async getAllCustomers(): Promise<Customer[]> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.CUSTOMERS.BASE);
    return data;
  },

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
