import { db, notifications } from './db.ts';

export async function createNotification(params: {
  userId: string;
  type: string;
  title: string;
  message: string;
  channel?: 'Email' | 'WhatsApp' | 'Push' | 'In App';
}) {
  await db.insert(notifications).values({
    userId: params.userId,
    type: params.type,
    channel: params.channel ?? 'In App',
    title: params.title,
    message: params.message,
    sentAt: new Date(),
  });
}
