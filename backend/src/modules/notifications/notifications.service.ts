// Notifications business logic
import { BadRequestError, } from '../../common/exceptions/BadRequestError';
import { NotFoundError } from '../../common/exceptions/NotFoundError';
import { enqueueNotification } from './notifications.queue';
import { CreateNotificationDto, NotificationRecord, PaginatedNotifications } from './notifications.types';
import { NotificationsRepository, PrismaNotificationsRepository } from './notifications.repository';

export class NotificationsService {
  constructor(private readonly repo: NotificationsRepository = new PrismaNotificationsRepository()) {}

  async notify(payload: CreateNotificationDto): Promise<NotificationRecord> {
    if (!payload.userId || !payload.title || !payload.message || !payload.type) {
      throw new BadRequestError('Missing required notification fields');
    }

    const record = await this.repo.create({
      userId: payload.userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      read: false
    });

    await enqueueNotification(payload);

    return {
      id: record.id,
      userId: record.userId,
      type: record.type as any,
      title: record.title,
      message: record.message,
      read: record.read,
      sentAt: record.sentAt
    };
  }

  async list(userId: string, page: number = 1, limit: number = 10): Promise<PaginatedNotifications> {
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      this.repo.listByUser(userId, skip, limit),
      this.repo.countByUser(userId)
    ]);

    const notifications: NotificationRecord[] = rows.map(r => ({
      id: r.id,
      userId: r.userId,
      type: r.type as any,
      title: r.title,
      message: r.message,
      read: r.read,
      sentAt: r.sentAt
    }));

    return { notifications, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const notif = await this.repo.findById(notificationId);
    if (!notif || notif.userId !== userId) {
      throw new NotFoundError('Notification not found');
    }

    await this.repo.markRead(notificationId);
  }
}

