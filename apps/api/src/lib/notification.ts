import { inArray } from 'drizzle-orm';
import { db, notifications, users } from './db.ts';

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

export async function notifyAdmins(type: string, title: string, message: string) {
  const adminList = await db
    .select({ id: users.id })
    .from(users)
    .where(inArray(users.role, ['admin', 'super_admin', 'dispatcher']));
  for (const admin of adminList) {
    await createNotification({ userId: admin.id, type, title, message });
  }
}
