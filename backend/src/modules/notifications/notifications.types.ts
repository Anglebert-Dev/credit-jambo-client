export type NotificationType = 'email' | 'sms' | 'in_app';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  sentAt: Date;
}

export interface PaginatedNotifications {
  notifications: NotificationRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

