export type NotificationChannel = 'Email' | 'WhatsApp' | 'Push' | 'In App';

export type NotificationType = string;

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  isRead: boolean;
  sentAt: string | null;
  createdAt: string;
}
