import { axiosInstance } from '../axios';
import { API_ENDPOINTS } from '../endponts';
import type { Invoice, CreateInvoiceDto, StockLedgerEntry } from '../../types';

export const invoiceService = {
  async getAll(params?: { type?: string; supplierId?: string; customerId?: string; startDate?: string; endDate?: string; productId?: string; sparePartId?: string }): Promise<Invoice[]> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.INVOICES.BASE, { params });
    return data;
  },

  async getById(id: string): Promise<Invoice> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.INVOICES.BY_ID(id));
    return data;
  },

  async create(invoiceData: CreateInvoiceDto): Promise<Invoice> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.INVOICES.BASE, invoiceData);
    return data;
  },

  async generateFromServiceRequest(serviceRequestId: string): Promise<Invoice> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.INVOICES.FROM_SERVICE_REQUEST(serviceRequestId));
    return data;
  },

  async getStockLedger(params?: {
    itemType?: 'PRODUCT' | 'SPARE_PART';
    itemId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<StockLedgerEntry[]> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.STOCK_LEDGER.BASE, { params });
    return data;
  },
};
