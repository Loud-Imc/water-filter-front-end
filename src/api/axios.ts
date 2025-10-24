import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // ✅ For HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach access token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    
    // ✅ Don't add token to login/register requests
    const isAuthEndpoint = 
      config.url?.includes('/auth/login') || 
      config.url?.includes('/auth/register');
    
    if (token && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ✅ Skip refresh for auth endpoints
    const isAuthEndpoint = 
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh');

    // If 401 and not already retried and not an auth endpoint
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        // ✅ Get userId from localStorage (saved during login)
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
          throw new Error('No user ID found');
        }

        // ✅ Send userId in body, cookie sent automatically
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { userId }, // ✅ Send userId
          { withCredentials: true } // ✅ Sends HttpOnly cookie
        );

        // ✅ Save new access token
        localStorage.setItem('accessToken', data.accessToken);
        
        // ✅ Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosInstance(originalRequest);
        
      } catch (refreshError) {
        // Refresh failed, logout user
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
