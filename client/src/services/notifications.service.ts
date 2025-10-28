import { api } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import type { Notification } from '../common/types/user.types';
import type { PaginatedResponse, PaginationParams, ApiResponse } from '../common/types/api.types';

export const notificationsService = {
  async getNotifications(params: PaginationParams): Promise<PaginatedResponse<Notification>> {
    const response = await api.get<PaginatedResponse<Notification>>(
      API_ENDPOINTS.notifications.list,
      { params }
    );
    return response.data;
  },

  async markAsRead(id: string): Promise<Notification> {
    const response = await api.patch<ApiResponse<Notification>>(
      API_ENDPOINTS.notifications.markAsRead(id)
    );
    return response.data.data!;
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get<PaginatedResponse<Notification>>(
      API_ENDPOINTS.notifications.list,
      { params: { page: 1, limit: 100 } }
    );
    return response.data.data.filter((n) => !n.read).length;
  },
};

