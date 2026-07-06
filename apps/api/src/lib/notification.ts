import { inArray } from 'drizzle-orm';
import { db, notifications, users } from './db.ts';
import { sendNotificationEmail } from './email.ts';
import { sendWhatsApp } from './whatsapp.ts';

export async function createNotification(params: {
  userId: string;
  type: string;
  title: string;
  message: string;
  channel?: 'Email' | 'WhatsApp' | 'Push' | 'In App';
  email?: string;
  fullName?: string;
  phone?: string;
}) {
  const channel = params.channel ?? 'In App';

  await db.insert(notifications).values({
    userId: params.userId,
    type: params.type,
    channel,
    title: params.title,
    message: params.message,
    sentAt: new Date(),
  });

  if (channel === 'Email' && params.email && params.fullName) {
    sendNotificationEmail(params.email, params.fullName, params.title, params.message);
  }

  if (channel === 'WhatsApp' && params.phone && params.message) {
    sendWhatsApp(params.phone, params.message);
  }
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
