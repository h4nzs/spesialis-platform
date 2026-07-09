import { eq, inArray } from 'drizzle-orm';
import { db, notifications, users } from './db.ts';
import { sendNewBookingToAdmin, sendNotificationEmail } from './email.ts';
import { sendWhatsApp } from './whatsapp.ts';

/**
 * Create a notification for a user.
 *
 * Always stores an in-app notification. Additionally sends:
 * - WhatsApp if the user has a phone number (looked up automatically)
 * - Email if `channel: 'Email'` is explicitly set and `email` + `fullName` are provided
 *
 * This ensures users get notified through multiple channels without
 * requiring every call site to manage channel logic.
 */
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
  // Look up user's phone from DB if not provided
  let phone = params.phone;
  if (!phone) {
    try {
      const [user] = await db
        .select({ phone: users.phone })
        .from(users)
        .where(eq(users.id, params.userId))
        .limit(1);
      if (user?.phone) phone = user.phone;
    } catch {
      // Non-critical — proceed without WhatsApp
    }
  }

  // Always store in-app notification
  await db.insert(notifications).values({
    userId: params.userId,
    type: params.type,
    channel: 'In App',
    title: params.title,
    message: params.message,
    sentAt: new Date(),
  });

  // Send WhatsApp if phone is available
  if (phone) {
    sendWhatsApp(phone, params.message);
  }

  // Send Email if explicitly requested
  if (params.channel === 'Email' && params.email && params.fullName) {
    sendNotificationEmail(params.email, params.fullName, params.title, params.message);
  }
}

export interface BookingDetail {
  bookingNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  bookingDate: string;
  bookingTime: string;
  notes: string | null;
  items: { name: string; qty: number }[];
}

export async function notifyAdmins(
  type: string,
  title: string,
  message: string,
  bookingDetail?: BookingDetail,
) {
  const adminList = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(inArray(users.role, ['admin', 'super_admin', 'dispatcher']));
  for (const admin of adminList) {
    await createNotification({ userId: admin.id, type, title, message });
    if (bookingDetail && admin.email) {
      sendNewBookingToAdmin(
        admin.email,
        '',
        bookingDetail.bookingNumber,
        bookingDetail.customerName,
        bookingDetail.customerPhone,
        bookingDetail.address,
        bookingDetail.bookingDate,
        bookingDetail.bookingTime,
        bookingDetail.notes,
        bookingDetail.items,
      );
    }
  }
}
