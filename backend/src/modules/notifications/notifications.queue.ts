import { Queue, Worker, JobsOptions } from 'bullmq';
import { CreateNotificationDto } from './notifications.types';
import IORedis from 'ioredis';

const connection = new IORedis({
  host: process.env.REDIS_HOST ,
  port: parseInt(process.env.REDIS_PORT ?? '6379'),
  maxRetriesPerRequest: null,
});

export const NOTIFICATIONS_QUEUE = 'notifications';

export const notificationsQueue = new Queue<CreateNotificationDto>(NOTIFICATIONS_QUEUE, {
  connection
});


async function sendEmail(toUserId: string, title: string, message: string): Promise<void> {
  console.log(`[Email -> user:${toUserId}] ${title}: ${message}`);
}

export const notificationsWorker = new Worker<CreateNotificationDto>(
  NOTIFICATIONS_QUEUE,
  async job => {
    const { userId, type, title, message } = job.data;

    if (type === 'email') {
      await sendEmail(userId, title, message);
    }

  },
  { connection }
);

export async function enqueueNotification(payload: CreateNotificationDto, opts?: JobsOptions) {
  await notificationsQueue.add('notify', payload, opts);
}

