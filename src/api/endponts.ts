export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
  },
  USERS: {
    BASE: "/users",
    BY_ID: (id: string) => `/users/${id}`,
    SUBORDINATES: "/users/my-subordinates",
    HIERARCHY: "/users/my-hierarchy",
    ASSIGNABLE_ROLES: "/users/assignable-roles",
  },
  ROLES: {
    BASE: "/roles",
    BY_ID: (id: string) => `/roles/${id}`,
  },
  REGIONS: {
    BASE: "/regions",
    BY_ID: (id: string) => `/regions/${id}`,
  },
  CUSTOMERS: {
    BASE: "/customers",
    BY_ID: (id: string) => `/customers/${id}`,
    UPDATE_LOCATION: (id: string) => `/customers/update-location/${id}`,
  },
  SERVICE_REQUESTS: {
    BASE: "/service-requests",
    BY_ID: (id: string) => `/service-requests/${id}`,
    SALES_APPROVE: (id: string) => `/service-requests/${id}/sales-approve`,
    SERVICE_APPROVE: (id: string) => `/service-requests/${id}/service-approve`,
    REJECT: (id: string) => `/service-requests/${id}/reject`,
    AUTO_ASSIGN: (id: string) => `/service-requests/${id}/auto-assign`,
    MANUAL_ASSIGN: (id: string) => `/service-requests/${id}/manual-assign`,
    REASSIGN_TECHNICIAN: (id: string) =>
      `/service-requests/${id}/reassign-technician`,
    REASSIGNMENT_HISTORY: (id: string) =>
      `/service-requests/${id}/reassignment-history`,
    ADD_USED_PRODUCTS: (id: string) => `/service-requests/${id}/used-products`,
    GET_USED_PRODUCTS: (id: string) => `/service-requests/${id}/used-products`,
  },
  TECHNICIAN: {
    MY_TASKS: "/technicians/my-tasks",
    TASK_HISTORY: "/technicians/task-history",
    TASK_DETAILS: (id: string) => `/technicians/tasks/${id}`,
    MY_STATS: "/technicians/my-stats",
  },
  WORKFLOW: {
    START: "/technician-workflow/start",
    STOP: "/technician-workflow/stop",
  },
  NOTIFICATIONS: {
    BASE: "/notifications",
    UNREAD_COUNT: "/notifications/unread-count",
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_DELIVERED: (id: string) => `/notifications/${id}/delivered`,
    MARK_MULTIPLE_READ: "/notifications/mark-multiple-read",
  },
  UPLOADS: {
    WORK_MEDIA: (requestId: string) => `/uploads/work-media/${requestId}`,
  },
  PRODUCTS: {
    BASE: "/products",
    BY_ID: (id: string) => `/products/${id}`,
    LOW_STOCK: "/products/low-stock",
    UPDATE_STOCK: (id: string) => `/products/${id}/stock`,
    BY_FILTER: '/products/filtered', 
    LOW_STOCK_COUNT: '/products/low-stock-count', 
  },

  SYSTEM_SETTINGS: {  
  BASE: '/system-settings',
  GET_LOW_STOCK_THRESHOLD: '/system-settings/low-stock-threshold',
  SET_LOW_STOCK_THRESHOLD: '/system-settings/low-stock-threshold',
},
};
