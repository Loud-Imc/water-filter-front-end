export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  USERS: {
    BASE: '/users',
    SUBORDINATES: '/users/my-subordinates',
    HIERARCHY: '/users/my-hierarchy',
    ASSIGNABLE_ROLES: '/users/assignable-roles',
  },
  ROLES: '/roles',
  REGIONS: '/regions',
  CUSTOMERS: '/customers',
  SERVICE_REQUESTS: {
    BASE: '/service-requests',
    SALES_APPROVE: (id: string) => `/service-requests/${id}/sales-approve`,
    SERVICE_APPROVE: (id: string) => `/service-requests/${id}/service-approve`,
    REJECT: (id: string) => `/service-requests/${id}/reject`,
    AUTO_ASSIGN: (id: string) => `/service-requests/${id}/auto-assign`,
    MANUAL_ASSIGN: (id: string) => `/service-requests/${id}/manual-assign`,
  },
  TECHNICIAN: {
    MY_TASKS: '/technicians/my-tasks',
    TASK_HISTORY: '/technicians/task-history',
    TASK_DETAILS: (id: string) => `/technicians/tasks/${id}`,
    MY_STATS: '/technicians/my-stats',
  },
  WORKFLOW: {
    START: '/technician-workflow/start',
    STOP: '/technician-workflow/stop',
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_DELIVERED: (id: string) => `/notifications/${id}/delivered`,
    MARK_MULTIPLE_READ: '/notifications/mark-multiple-read',
  },
  UPLOADS: {
    WORK_MEDIA: (requestId: string) => `/uploads/work-media/${requestId}`,
  },
};

export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  SERVICE_ADMIN: 'Service Admin',
  SALES_ADMIN: 'Sales Admin',
  SERVICE_MANAGER: 'Service Manager',
  SALES_MANAGER: 'Sales Manager',
  SERVICE_TEAM_LEAD: 'Service Team Lead',
  SALES_TEAM_LEAD: 'Sales Team Lead',
  TECHNICIAN: 'Technician',
  SALESMAN: 'Salesman',
};

export const REQUEST_TYPES = {
  SERVICE: 'Service',
  INSTALLATION: 'Installation',
  COMPLAINT: 'Complaint',
  ENQUIRY: 'Enquiry',
  RE_INSTALLATION: 'Re-Installation',
};

export const REQUEST_STATUS_COLORS = {
  DRAFT: '#9e9e9e',
  PENDING_APPROVAL: '#ff9800',
  APPROVED: '#4caf50',
  ASSIGNED: '#2196f3',
  IN_PROGRESS: '#03a9f4',
  WORK_COMPLETED: '#8bc34a',
  COMPLETED: '#4caf50',
  REJECTED: '#f44336',
};
