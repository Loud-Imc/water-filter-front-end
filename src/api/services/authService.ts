  import { axiosInstance } from '../axios';
  import { API_ENDPOINTS } from '../endponts'; 
  import type { LoginCredentials, RegisterData, AuthResponse } from '../../types';

  export const authService = {
    // Login
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
      const { data } = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      return data;
    },

    // Register
    async register(userData: RegisterData): Promise<AuthResponse> {
      const { data } = await axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      return data;
    },

    // Logout
    async logout(): Promise<void> {
      await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
      localStorage.removeItem('accessToken');
    },

    // Refresh token
    async refreshToken(): Promise<{ accessToken: string }> {
      const { data } = await axiosInstance.post(API_ENDPOINTS.AUTH.REFRESH);
      return data;
    },
  };
