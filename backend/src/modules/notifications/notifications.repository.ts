import prisma from '../../config/database';
import { NotificationType } from './notifications.types';

export interface NotificationsRepository {
  create(data: { userId: string; type: NotificationType; title: string; message: string; read?: boolean }): Promise<any>;
  listByUser(userId: string, skip: number, take: number): Promise<any[]>;
  countByUser(userId: string): Promise<number>;
  findById(id: string): Promise<any | null>;
  markRead(id: string): Promise<any>;
}

export class PrismaNotificationsRepository implements NotificationsRepository {
  create(data: { userId: string; type: NotificationType; title: string; message: string; read?: boolean }) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        read: data.read ?? false
      }
    });
  }

  listByUser(userId: string, skip: number, take: number) {
    return prisma.notification.findMany({ where: { userId }, orderBy: { sentAt: 'desc' }, skip, take });
  }

  countByUser(userId: string) {
    return prisma.notification.count({ where: { userId } });
  }

  findById(id: string) {
    return prisma.notification.findUnique({ where: { id } });
  }

  markRead(id: string) {
    return prisma.notification.update({ where: { id }, data: { read: true } });
  }
}
