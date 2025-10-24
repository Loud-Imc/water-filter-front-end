import { axiosInstance } from '../axios';
import { API_ENDPOINTS } from '../endponts'; 
import { type Notification } from '../../types';

export const notificationService = {
  // Get all notifications
  async getNotifications(): Promise<Notification[]> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS.BASE);
    return data;
  },

  // Get unread count
  async getUnreadCount(): Promise<{ count: number }> {
    const { data } = await axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
    return data;
  },

  // Mark as read
  async markAsRead(id: string): Promise<Notification> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
    return data;
  },

  // Mark as delivered
  async markAsDelivered(id: string): Promise<Notification> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.NOTIFICATIONS.MARK_DELIVERED(id));
    return data;
  },

  // Mark multiple as read
  async markMultipleAsRead(notificationIds: string[]): Promise<void> {
    await axiosInstance.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_MULTIPLE_READ, {
      notificationIds,
    });
  },

  // Create notification (manual)
  async createNotification(toUserId: string, message: string): Promise<Notification> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.NOTIFICATIONS.BASE, {
      toUserId,
      message,
    });
    return data;
  },
};
