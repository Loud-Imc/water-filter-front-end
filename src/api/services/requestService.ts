import { axiosInstance } from "../axios";
import { API_ENDPOINTS } from "../endponts";
import { type TechnicianWithWorkload, type ServiceRequest } from "../../types";

export const requestService = {
  // Get all service requests
  async getAllRequests(): Promise<ServiceRequest[]> {
    const { data } = await axiosInstance.get(
      API_ENDPOINTS.SERVICE_REQUESTS.BASE
    );
    return data;
  },

  // Get request by ID
  async getRequestById(id: string): Promise<ServiceRequest> {
    const { data } = await axiosInstance.get(
      API_ENDPOINTS.SERVICE_REQUESTS.BY_ID(id)
    );
    return data;
  },

  // ✅ Get technicians with workload
  getTechniciansWithWorkload: async (
    regionId?: string
  ): Promise<TechnicianWithWorkload[]> => {
    const params = regionId ? { regionId } : {};
    const response = await axiosInstance.get(
      "/service-requests/technicians/workload",
      { params }
    );
    return response.data;
  },

  // ✅ Create with priority and direct assignment
  createRequest: async (requestData: {
    type: string;
    description: string;
    customerId: string;
    regionId: string;
    priority?: string;
    assignedToId: string;
    adminNotes?: string;
  }): Promise<ServiceRequest> => {
    const { data } = await axiosInstance.post(
      API_ENDPOINTS.SERVICE_REQUESTS.BASE,
      requestData
    );
    return data;
  },

  // Update service request
  async updateRequest(
    id: string,
    requestData: Partial<ServiceRequest>
  ): Promise<ServiceRequest> {
    const { data } = await axiosInstance.patch(
      API_ENDPOINTS.SERVICE_REQUESTS.BY_ID(id),
      requestData
    );
    return data;
  },

  // Sales approve
  async salesApprove(id: string, comments?: string): Promise<ServiceRequest> {
    const { data } = await axiosInstance.post(
      API_ENDPOINTS.SERVICE_REQUESTS.SALES_APPROVE(id),
      { comments }
    );
    return data;
  },

  // Service approve
  async serviceApprove(id: string, comments?: string): Promise<ServiceRequest> {
    const { data } = await axiosInstance.post(
      API_ENDPOINTS.SERVICE_REQUESTS.SERVICE_APPROVE(id),
      { comments }
    );
    return data;
  },

  // Reject request
  async rejectRequest(id: string, comments: string): Promise<ServiceRequest> {
    const { data } = await axiosInstance.post(
      API_ENDPOINTS.SERVICE_REQUESTS.REJECT(id),
      { comments }
    );
    return data;
  },

  // Auto assign technician
  async autoAssign(id: string): Promise<ServiceRequest> {
    const { data } = await axiosInstance.post(
      API_ENDPOINTS.SERVICE_REQUESTS.AUTO_ASSIGN(id)
    );
    return data;
  },

  // Manual assign technician
  async manualAssign(
    id: string,
    technicianId: string
  ): Promise<ServiceRequest> {
    const { data } = await axiosInstance.post(
      API_ENDPOINTS.SERVICE_REQUESTS.MANUAL_ASSIGN(id),
      { technicianId }
    );
    return data;
  },

  // Reassign technician
  async reassignTechnician(
    id: string,
    newTechnicianId: string,
    reason: string
  ): Promise<ServiceRequest> {
    const { data } = await axiosInstance.post(
      API_ENDPOINTS.SERVICE_REQUESTS.REASSIGN_TECHNICIAN(id),
      {
        newTechnicianId,
        reason,
      }
    );
    return data;
  },

  // Get reassignment history
  async getReassignmentHistory(id: string): Promise<any[]> {
    const { data } = await axiosInstance.get(
      API_ENDPOINTS.SERVICE_REQUESTS.REASSIGNMENT_HISTORY(id)
    );
    return data;
  },

  // Get technician tasks
  async getMyTasks(): Promise<ServiceRequest[]> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.TECHNICIAN.MY_TASKS);
    return data;
  },

  // Get task history
  async getTaskHistory(): Promise<ServiceRequest[]> {
    const { data } = await axiosInstance.get(
      API_ENDPOINTS.TECHNICIAN.TASK_HISTORY
    );
    return data;
  },

  // Get task details
  async getTaskDetails(id: string): Promise<ServiceRequest> {
    const { data } = await axiosInstance.get(
      API_ENDPOINTS.TECHNICIAN.TASK_DETAILS(id)
    );
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
    const { data } = await axiosInstance.post(API_ENDPOINTS.WORKFLOW.START, {
      requestId,
    });
    return data;
  },

  // Stop work
  async stopWork(requestId: string, notes?: string): Promise<any> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.WORKFLOW.STOP, {
      requestId,
      notes,
    });
    return data;
  },

  // Upload work media
  async uploadWorkMedia(requestId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await axiosInstance.post(
      API_ENDPOINTS.UPLOADS.WORK_MEDIA(requestId),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return data;
  },

  // Acknowledge completion
  async acknowledgeCompletion(
    id: string,
    comments?: string
  ): Promise<ServiceRequest> {
    const { data } = await axiosInstance.patch(
      `${API_ENDPOINTS.SERVICE_REQUESTS.BASE}/${id}/acknowledge`,
      {
        comments,
      }
    );
    return data;
  },

  // Add used products
  async addUsedProducts(
    requestId: string,
    usedProducts: Array<{
      productId: string;
      quantityUsed: number;
      notes?: string;
    }>
  ): Promise<any> {
    const { data } = await axiosInstance.post(
      API_ENDPOINTS.SERVICE_REQUESTS.ADD_USED_PRODUCTS(requestId),
      {
        usedProducts,
      }
    );
    return data;
  },

  // Get used products
  async getUsedProducts(requestId: string): Promise<any[]> {
    const { data } = await axiosInstance.get(
      API_ENDPOINTS.SERVICE_REQUESTS.GET_USED_PRODUCTS(requestId)
    );
    return data;
  },
};
