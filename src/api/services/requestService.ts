import { axiosInstance } from '../axios';
import { API_ENDPOINTS } from '../endponts'; 
import {type  ServiceRequest } from '../../types';

export const requestService = {
  // Get all service requests
  async getAllRequests(): Promise<ServiceRequest[]> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.SERVICE_REQUESTS.BASE);
    return data;
  },

  // Get request by ID
  async getRequestById(id: string): Promise<ServiceRequest> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.SERVICE_REQUESTS.BY_ID(id));
    return data;
  },

  // Create service request
  async createRequest(requestData: Partial<ServiceRequest>): Promise<ServiceRequest> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.SERVICE_REQUESTS.BASE, requestData);
    return data;
  },

  // Update service request
  async updateRequest(id: string, requestData: Partial<ServiceRequest>): Promise<ServiceRequest> {
    const { data } = await axiosInstance.patch(API_ENDPOINTS.SERVICE_REQUESTS.BY_ID(id), requestData);
    return data;
  },

  // Sales approve
  async salesApprove(id: string, comments?: string): Promise<ServiceRequest> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.SERVICE_REQUESTS.SALES_APPROVE(id), {
      comments,
    });
    return data;
  },

  // Service approve
  async serviceApprove(id: string, comments?: string): Promise<ServiceRequest> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.SERVICE_REQUESTS.SERVICE_APPROVE(id), {
      comments,
    });
    return data;
  },

  // Reject request
  async rejectRequest(id: string, comments: string): Promise<ServiceRequest> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.SERVICE_REQUESTS.REJECT(id), {
      comments,
    });
    return data;
  },

  // Auto assign technician
  async autoAssign(id: string): Promise<ServiceRequest> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.SERVICE_REQUESTS.AUTO_ASSIGN(id));
    return data;
  },

  // Manual assign technician
  async manualAssign(id: string, technicianId: string): Promise<ServiceRequest> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.SERVICE_REQUESTS.MANUAL_ASSIGN(id), {
      technicianId,
    });
    return data;
  },

  // Get technician tasks
  async getMyTasks(): Promise<ServiceRequest[]> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.TECHNICIAN.MY_TASKS);
    return data;
  },

  // Get task history
  async getTaskHistory(): Promise<ServiceRequest[]> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.TECHNICIAN.TASK_HISTORY);
    return data;
  },

  // Get task details
  async getTaskDetails(id: string): Promise<ServiceRequest> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.TECHNICIAN.TASK_DETAILS(id));
    return data;
  },

  // Get technician stats
  async getMyStats(): Promise<{
    assigned: number;
    inProgress: number;
    completed: number;
    totalWorkTime: number;
  }> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.TECHNICIAN.MY_STATS);
    return data;
  },

  // Start work
  async startWork(requestId: string): Promise<any> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.WORKFLOW.START, { requestId });
    return data;
  },

  // Stop work
  async stopWork(requestId: string, notes?: string): Promise<any> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.WORKFLOW.STOP, { requestId, notes });
    return data;
  },

  // Upload work media
  async uploadWorkMedia(requestId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await axiosInstance.post(API_ENDPOINTS.UPLOADS.WORK_MEDIA(requestId), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  async acknowledgeCompletion(id: string, comments?: string): Promise<ServiceRequest> {
  const { data } = await axiosInstance.patch(
    `${API_ENDPOINTS.SERVICE_REQUESTS.BASE}/${id}/acknowledge`,
    { comments }
  );
  return data;
}

};
