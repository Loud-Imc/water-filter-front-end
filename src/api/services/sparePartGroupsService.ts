import { axiosInstance } from '../axios';
import { API_ENDPOINTS } from '../endponts';
import type { SparePartGroup, CreateSparePartGroupDto, UpdateSparePartGroupDto } from '../../types';

export const sparePartGroupsService = {
  async getAll(includeInactive = false): Promise<SparePartGroup[]> {
    const params = includeInactive ? '?includeInactive=true' : '';
    const { data } = await axiosInstance.get(`${API_ENDPOINTS.SPARE_PART_GROUPS.BASE}${params}`);
    return data;
  },

  async getById(id: string): Promise<SparePartGroup> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.SPARE_PART_GROUPS.BY_ID(id));
    return data;
  },

  async getSpareParts(id: string): Promise<any[]> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.SPARE_PART_GROUPS.SPARE_PARTS(id));
    return data;
  },

  async create(groupData: CreateSparePartGroupDto): Promise<SparePartGroup> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.SPARE_PART_GROUPS.BASE, groupData);
    return data;
  },

  async update(id: string, groupData: UpdateSparePartGroupDto): Promise<SparePartGroup> {
    const { data } = await axiosInstance.put(API_ENDPOINTS.SPARE_PART_GROUPS.BY_ID(id), groupData);
    return data;
  },

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.SPARE_PART_GROUPS.BY_ID(id));
  },

  async toggleStatus(id: string): Promise<SparePartGroup> {
    const { data } = await axiosInstance.put(API_ENDPOINTS.SPARE_PART_GROUPS.TOGGLE_STATUS(id));
    return data;
  },
};
