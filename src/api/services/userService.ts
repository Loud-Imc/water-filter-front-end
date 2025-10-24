import { axiosInstance } from '../axios';
import { API_ENDPOINTS } from '../endponts'; 
import { User, Role } from '../../types';

export const userService = {
  // Get all users
  async getAllUsers(): Promise<User[]> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.USERS.BASE);
    return data;
  },

  // Get user by ID
  async getUserById(id: string): Promise<User> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.USERS.BY_ID(id));
    return data;
  },

  // Create user
  async createUser(userData: Partial<User>): Promise<User> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.USERS.BASE, userData);
    return data;
  },

  // Update user
  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const { data } = await axiosInstance.put(API_ENDPOINTS.USERS.BY_ID(id), userData);
    return data;
  },

  // Delete user
  async deleteUser(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.USERS.BY_ID(id));
  },

  // Get subordinates
  async getMySubordinates(): Promise<User[]> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.USERS.SUBORDINATES);
    return data;
  },

  // Get hierarchy
  async getMyHierarchy(): Promise<User[]> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.USERS.HIERARCHY);
    return data;
  },

  // Get assignable roles
  async getAssignableRoles(): Promise<Role[]> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.USERS.ASSIGNABLE_ROLES);
    return data;
  },
};
