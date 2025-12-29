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
    SEARCH_TECHNICIANS: '/users/technicians/search',
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
    GET_USED_SPARE_PARTS: (id: string) => `/service-requests/${id}/used-spare-parts`,
    CUSTOMER_SERVICE_HISTORY: (id: string) => `/service-requests/${id}/customer-service-history`,
    UPDATE_DESCRIPTION: (id: string) => `/service-requests/${id}/description`,
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
    BY_CATEGORY: (categoryId: string) => `/products/by-category/${categoryId}`, // ✅ NEW
  },

  // ✅ NEW: Product Categories
  PRODUCT_CATEGORIES: {
    BASE: '/product-categories',
    BY_ID: (id: string) => `/product-categories/${id}`,
    PRODUCTS: (id: string) => `/product-categories/${id}/products`,
    TOGGLE_STATUS: (id: string) => `/product-categories/${id}/toggle-status`,
  },

  // ✅ NEW: Spare Part Groups
  SPARE_PART_GROUPS: {
    BASE: '/spare-part-groups',
    BY_ID: (id: string) => `/spare-part-groups/${id}`,
    SPARE_PARTS: (id: string) => `/spare-part-groups/${id}/spare-parts`,
    TOGGLE_STATUS: (id: string) => `/spare-part-groups/${id}/toggle-status`,
  },

  // ✅ NEW: Spare Parts
  SPARE_PARTS: {
    BASE: '/spare-parts',
    BY_ID: (id: string) => `/spare-parts/${id}`,
    LOW_STOCK: '/spare-parts/low-stock',
    LOW_STOCK_COUNT: '/spare-parts/low-stock-count',
    FILTERED: '/spare-parts/filtered',
    BY_GROUP: (groupId: string) => `/spare-parts/by-group/${groupId}`,
    TECHNICIAN_STOCK: (id: string) => `/spare-parts/${id}/technician-stock`,
    UPDATE_STOCK: (id: string) => `/spare-parts/${id}/stock`,
    TRANSFER_TO_TECHNICIAN: (id: string) => `/spare-parts/${id}/transfer-to-technician`,
  },

  // ✅ NEW: BOM Templates
  BOM_TEMPLATES: {
    BASE: '/bom-templates',
    BY_ID: (id: string) => `/bom-templates/${id}`,
    BY_PRODUCT: (productId: string) => `/bom-templates/by-product/${productId}`,
    TOGGLE_STATUS: (id: string) => `/bom-templates/${id}/toggle-status`,
    ITEMS: (id: string) => `/bom-templates/${id}/items`,
    ITEM: (templateId: string, itemId: string) => `/bom-templates/${templateId}/items/${itemId}`,
    EXECUTE: (id: string) => `/bom-templates/${id}/execute`,
    ASSEMBLY_HISTORY: (id: string) => `/bom-templates/${id}/assembly-history`,
  },

  // ✅ NEW: Assemblies
  ASSEMBLIES: {
    BASE: '/assemblies',
    BY_ID: (id: string) => `/assemblies/${id}`,
    STATS: '/assemblies/stats',
    BY_PRODUCT: '/assemblies/by-product',
    BY_ASSEMBLER: '/assemblies/by-assembler',
    RECENT: '/assemblies/recent',
    COST_BREAKDOWN: (id: string) => `/assemblies/${id}/cost-breakdown`,
  },

  SYSTEM_SETTINGS: {
    BASE: '/system-settings',
    GET_LOW_STOCK_THRESHOLD: '/products/low-stock-threshold',
    SET_LOW_STOCK_THRESHOLD: '/products/low-stock-threshold',
  },

  //   SYSTEM_SETTINGS: {  
  //   BASE: '/system-settings',
  //   GET_LOW_STOCK_THRESHOLD: '/system-settings/low-stock-threshold',
  //   SET_LOW_STOCK_THRESHOLD: '/system-settings/low-stock-threshold',
  // },
};
