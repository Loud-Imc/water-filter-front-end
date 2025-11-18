import { axiosInstance } from '../axios';
import { API_ENDPOINTS } from '../endponts';
import type {
  BOMTemplate,
  CreateBOMTemplateDto,
  UpdateBOMTemplateDto,
  AddBOMItemDto,
  ExecuteAssemblyDto,
  AssemblyHistory,
} from '../../types';

export const bomTemplatesService = {
  async getAll(): Promise<BOMTemplate[]> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.BOM_TEMPLATES.BASE);
    return data;
  },

  async getById(id: string): Promise<BOMTemplate> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.BOM_TEMPLATES.BY_ID(id));
    return data;
  },

  async getByProduct(productId: string): Promise<BOMTemplate> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.BOM_TEMPLATES.BY_PRODUCT(productId));
    return data;
  },

  async create(templateData: CreateBOMTemplateDto): Promise<BOMTemplate> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.BOM_TEMPLATES.BASE, templateData);
    return data;
  },

  async update(id: string, templateData: UpdateBOMTemplateDto): Promise<BOMTemplate> {
    const { data } = await axiosInstance.put(API_ENDPOINTS.BOM_TEMPLATES.BY_ID(id), templateData);
    return data;
  },

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.BOM_TEMPLATES.BY_ID(id));
  },

  async toggleStatus(id: string): Promise<BOMTemplate> {
    const { data } = await axiosInstance.put(API_ENDPOINTS.BOM_TEMPLATES.TOGGLE_STATUS(id));
    return data;
  },

  // BOM Items
  async addItem(templateId: string, itemData: AddBOMItemDto): Promise<any> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.BOM_TEMPLATES.ITEMS(templateId), itemData);
    return data;
  },

  async updateItem(
    templateId: string,
    itemId: string,
    itemData: { quantity?: number; isOptional?: boolean; notes?: string }
  ): Promise<any> {
    const { data } = await axiosInstance.put(
      API_ENDPOINTS.BOM_TEMPLATES.ITEM(templateId, itemId),
      itemData
    );
    return data;
  },

  async removeItem(templateId: string, itemId: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.BOM_TEMPLATES.ITEM(templateId, itemId));
  },

  // Assembly Execution
  async executeAssembly(templateId: string, assemblyData: ExecuteAssemblyDto): Promise<any> {
    const { data } = await axiosInstance.post(
      API_ENDPOINTS.BOM_TEMPLATES.EXECUTE(templateId),
      assemblyData
    );
    return data;
  },

  async getAssemblyHistory(templateId: string): Promise<AssemblyHistory[]> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.BOM_TEMPLATES.ASSEMBLY_HISTORY(templateId));
    return data;
  },
};
