export const PERMISSIONS = {
  // Users
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',

  // Customers
  CUSTOMERS_VIEW: 'customers.view',
  CUSTOMERS_CREATE: 'customers.create',
  CUSTOMERS_EDIT: 'customers.edit',
  CUSTOMERS_DELETE: 'customers.delete',

  // Services
  SERVICES_VIEW: 'services.view',
  SERVICES_CREATE: 'services.create',
  SERVICES_EDIT: 'services.edit',
  SERVICES_DELETE: 'services.delete',
  SERVICES_APPROVE: 'services.approve',
  SERVICES_ASSIGN: 'services.assign',

  // Regions
  REGIONS_VIEW: 'regions.view',
  REGIONS_CREATE: 'regions.create',

  // Reports
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',

  // Dashboard
  DASHBOARD_VIEW: 'dashboard.view',

  // Products

  // Products
  PRODUCTS_VIEW: 'products.view',
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_UPDATE: 'products.update',
  PRODUCTS_DELETE: 'products.delete',
  
  // ✅ NEW: Spare Parts
  SPARE_PARTS_VIEW: 'spare_parts.view',
  SPARE_PARTS_CREATE: 'spare_parts.create',
  SPARE_PARTS_UPDATE: 'spare_parts.update',
  SPARE_PARTS_DELETE: 'spare_parts.delete',
  
  // ✅ NEW: Categories & Groups
  CATEGORIES_VIEW: 'categories.view',
  CATEGORIES_MANAGE: 'categories.manage',
  GROUPS_VIEW: 'groups.view',
  GROUPS_MANAGE: 'groups.manage',
  
  // ✅ NEW: Assembly
  ASSEMBLY_VIEW: 'assembly.view',
  ASSEMBLY_CREATE: 'assembly.create',
  ASSEMBLY_EXECUTE: 'assembly.execute',
  ASSEMBLY_DELETE: 'assembly.delete',
  
  // ✅ NEW: Stock
  STOCK_VIEW: 'stock.view',
  STOCK_UPDATE: 'stock.update',
  STOCK_TRANSFER: 'stock.transfer',
} as const;
