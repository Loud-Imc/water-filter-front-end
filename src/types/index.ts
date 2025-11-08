// User types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  status: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED';
  roleId: string;
  regionId?: string | null;
  createdAt: string;
  role: Role;
  region?: Region;
  createdById?: string;
}

// Role types
export interface Role {
  id: string;
  name: string;
  parentRole?: string;
  permissions: Record<string, boolean>;
  immutable: boolean;
}

// Region types
// ✅ Updated Region Interface
export interface Region {
  id: string;
  name: string;
  state?: string;      // Optional: "Kerala"
  district?: string;   // Optional: "Kottayam"
  city?: string;       // Optional: "Pala"
  pincode?: string;    // Optional: "686575"
}

// ✅ Add India Places Types
export interface StateData {
  stateName: string;
}

export interface DistrictData {
  districtName: string;
}

export interface CityData {
  name: string;
  pincode: string;
  district: string;
  state: string;
}


// Customer types
// Update the Customer interface
export interface Customer {
  id: string;
  name: string;
  address: string;
  primaryPhone: string;        // ✅ Changed from 'contact'
  phoneNumbers: string[];      // ✅ New: Additional phones
  email?: string;
  regionId: string;
  region?: Region;
  latitude?: number;           // ✅ New: For Google Maps
  longitude?: number;          // ✅ New: For Google Maps
  googleMapsUrl?: string;      // ✅ New: Google Maps link
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  name: string;
  address: string;
  primaryPhone: string;
  phoneNumbers?: string[];
  email?: string;
  regionId: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}


// Service Request types
export type RequestType = 'SERVICE' | 'INSTALLATION' | 'COMPLAINT'| 'ENQUIRY' | 'RE_INSTALLATION' ;
export type RequestStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'WORK_COMPLETED'
  | 'COMPLETED'
  | 'REJECTED';

export interface ServiceRequest {
  id: string;
  type: RequestType;
  description: string;
  status: RequestStatus;
  requestedById: string;
  approvedById?: string;
  assignedToId?: string;
  regionId: string;
  customerId: string;
  salesApproved: boolean;
  createdAt: string;
  requestedBy: User;
  approvedBy?: User;
  assignedTo?: User;
  customer: Customer;
  region: Region;
  approvalHistory: ApprovalHistory[];
  workLogs?: WorkLog[];
  workMedia?: WorkMedia[];
}

export interface ApprovalHistory {
  id: string;
  requestId: string;
  approverId: string;
  approverRole: string;
  status: 'APPROVED' | 'REJECTED';
  comments?: string;
  approvedAt: string;
  approver: User;
}

export interface WorkLog {
  id: string;
  requestId: string;
  technicianId: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
}

export interface WorkMedia {
  id: string;
  requestId: string;
  fileUrl: string;
  uploadedAt: string;
}

// Notification types
export interface Notification {
  id: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  status: 'sent' | 'delivered' | 'read';
  createdAt: string;
  sender: Partial<User>;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  roleId: string;
  regionId?: string;
}


export interface AuthResponse {
  user: User;
  accessToken: string;
}

// Product/Inventory types
export interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  price: number;
  stock: number;
  hasWarranty: boolean;
  warrantyMonths?: number;
  warrantyYears?: number;
  createdAt: string;
  updatedAt: string;
  company?: string;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  sku?: string;
  price: number;
  stock: number;
  hasWarranty?: boolean;
  warrantyMonths?: number;
  warrantyYears?: number;
  company?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface StockUpdateDto {
  quantityChange: number;
  reason: string;
}

