import { axiosInstance } from '../axios';
import { API_ENDPOINTS } from '../endponts';
import type { Supplier, CreateSupplierDto, UpdateSupplierDto } from '../../types';

export const supplierService = {
  async getAll(): Promise<Supplier[]> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.SUPPLIERS.BASE);
    return data;
  },

  async getById(id: string): Promise<Supplier> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.SUPPLIERS.BY_ID(id));
    return data;
  },

  async create(supplierData: CreateSupplierDto): Promise<Supplier> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.SUPPLIERS.BASE, supplierData);
    return data;
  },

  async update(id: string, supplierData: UpdateSupplierDto): Promise<Supplier> {
    const { data } = await axiosInstance.put(API_ENDPOINTS.SUPPLIERS.BY_ID(id), supplierData);
    return data;
  },

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.SUPPLIERS.BY_ID(id));
  },
};
