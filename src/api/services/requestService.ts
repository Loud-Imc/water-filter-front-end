import { axiosInstance } from "../axios";
import { API_ENDPOINTS } from "../endponts";
import { type TechnicianWithWorkload, type ServiceRequest } from "../../types";

interface UsedItem {
  type: "product" | "sparePart";
  id: string; // productId or sparePartId
  quantityUsed: number;
  notes?: string;
}
export const requestService = {
  // Get all service requests
// In requestService.ts or wherever your API calls are
async getAllRequests(page: number = 1, limit: number = 10, status?: string, userId?: string) {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (status && status !== 'ALL') {
    params.append('status', status);
  }
  if (userId) {
    params.append('userId', userId);
  }

  const response = await axiosInstance.get(`/service-requests?${params.toString()}`);
  return response.data;
},


  //   async addUsedItems(requestId: string, usedItems: UsedItem[]): Promise<any> {
  //   const { data } = await axiosInstance.post(
  //     API_ENDPOINTS.SERVICE_REQUESTS.ADD_USED_PRODUCTS(requestId),
  //     { usedItems }
  //   );
  //   return data;
  // },

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
  // async addUsedProducts(
  //   requestId: string,
  //   usedProducts: Array<{
  //     productId: string;
  //     quantityUsed: number;
  //     notes?: string;
  //   }>
  // ): Promise<any> {
  //   const { data } = await axiosInstance.post(
  //     API_ENDPOINTS.SERVICE_REQUESTS.ADD_USED_PRODUCTS(requestId),
  //     {
  //       usedProducts,
  //     }
  //   );
  //   return data;
  // },

  async addUsedItems(requestId: string, usedItems: UsedItem[]): Promise<any> {
    const { data } = await axiosInstance.post(
      API_ENDPOINTS.SERVICE_REQUESTS.ADD_USED_PRODUCTS(requestId),
      { usedItems }
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

  async getUsedSpareParts(requestId: string): Promise<any[]> {
    const { data } = await axiosInstance.get(
      API_ENDPOINTS.SERVICE_REQUESTS.GET_USED_SPARE_PARTS(requestId)
    );
    return data;
  },

  async getCustomerServiceHistory(serviceRequestId: string) {
    const { data } = await axiosInstance.get(
      API_ENDPOINTS.SERVICE_REQUESTS.CUSTOMER_SERVICE_HISTORY(serviceRequestId)
    );
    return data;
  },

  async importInstallationData(formData: FormData): Promise<{
    success: boolean;
    summary: {
      regions: number;
      technicians: number;
      products: number;
      customers: number;
      installations: number;
      serviceRequests: number;
    };
    errors: string[];
  }> {
    const { data } = await axiosInstance.post(
      "/service-requests/import/installation",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  async importProductsData(formData: FormData): Promise<{
    success: boolean;
    summary: {
      categoriesCreated: number;
      productsCreated: number;
      productsUpdated: number;
    };
    errors: string[];
  }> {
    const { data } = await axiosInstance.post(
      "/service-requests/import/products",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },
  async importSparePartsData(formData: FormData): Promise<{
    success: boolean;
    summary: {
      sparePartsCreated: number;
      sparePartsUpdated: number;
    };
    errors: string[];
  }> {
    const { data } = await axiosInstance.post(
      "/service-requests/import/spare-parts",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  async importTechniciansData(formData: FormData): Promise<{
    success: boolean;
    summary: {
      techniciansCreated: number;
      techniciansUpdated: number;
    };
    errors: string[];
  }> {
    const { data } = await axiosInstance.post(
      "/service-requests/import/technicians",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  async importServiceRequestsData(formData: FormData): Promise<{
    success: boolean;
    summary: {
      serviceRequestsCreated: number;
      serviceRequestsUpdated: number;
    };
    errors: string[];
  }> {
    const { data } = await axiosInstance.post(
      "/service-requests/import/service-requests",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },
};
