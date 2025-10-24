import { axiosInstance } from '../axios';
import { API_ENDPOINTS } from '../endponts'; 
import {type Role } from '../../types';

export const roleService = {
  async getAllRoles(): Promise<Role[]> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.ROLES.BASE);
    return data;
  },

  async getRoleById(id: string): Promise<Role> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.ROLES.BY_ID(id));
    return data;
  },

  async createRole(roleData: Partial<Role>): Promise<Role> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.ROLES.BASE, roleData);
    return data;
  },

  async updateRole(id: string, roleData: Partial<Role>): Promise<Role> {
    const { data } = await axiosInstance.put(API_ENDPOINTS.ROLES.BY_ID(id), roleData);
    return data;
  },

  async deleteRole(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.ROLES.BY_ID(id));
  },
};
