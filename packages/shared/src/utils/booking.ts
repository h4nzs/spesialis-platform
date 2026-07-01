import type { OrderStatus } from '@specialist/types';
import {
  ORDER_STATUS_TRANSITIONS,
  CANCELLABLE_BY_CUSTOMER,
  canTransition,
  isOrderFinal,
  ACTIVE_ORDER_STATUSES,
  FINAL_ORDER_STATUSES,
} from '../constants.ts';

export type StatusChangeResult =
  | { valid: true; from: OrderStatus; to: OrderStatus }
  | { valid: false; from: OrderStatus; to: OrderStatus; reason: string };

/**
 * Validasi perubahan status order.
 * Mengembalikan objek dengan detail apakah transisi valid atau tidak.
 */
export function validateStatusChange(
  currentStatus: OrderStatus,
  newStatus: OrderStatus,
): StatusChangeResult {
  if (currentStatus === newStatus) {
    return { valid: false, from: currentStatus, to: newStatus, reason: 'Status sudah sama' };
  }

  if (isOrderFinal(currentStatus)) {
    return {
      valid: false,
      from: currentStatus,
      to: newStatus,
      reason: 'Order sudah dalam status final',
    };
  }

  if (!canTransition(currentStatus, newStatus)) {
    const allowed = ORDER_STATUS_TRANSITIONS[currentStatus];
    return {
      valid: false,
      from: currentStatus,
      to: newStatus,
      reason: `Tidak bisa transisi dari ${currentStatus} ke ${newStatus}. Status yang diizinkan: ${(allowed ?? []).join(', ')}`,
    };
  }

  return { valid: true, from: currentStatus, to: newStatus };
}

/**
 * Cek apakah customer bisa cancel booking pada status tertentu.
 */
export function canCustomerCancel(status: OrderStatus): boolean {
  return CANCELLABLE_BY_CUSTOMER.includes(status);
}

/**
 * Dapatkan daftar status yang mungkin selanjutnya untuk status saat ini.
 */
export function getNextStatuses(status: OrderStatus): OrderStatus[] {
  return ORDER_STATUS_TRANSITIONS[status] ?? [];
}

/**
 * Dapatkan label yang user-friendly untuk status order.
 *
 * @example
 *   getStatusLabel('Pending Confirmation') // 'Menunggu Konfirmasi'
 *   getStatusLabel('Partner Assigned') // 'Partner Ditugaskan'
 */
export function getStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    Draft: 'Draft',
    'Pending Confirmation': 'Menunggu Konfirmasi',
    Confirmed: 'Dikonfirmasi',
    'Waiting Assignment': 'Menunggu Partner',
    'Partner Assigned': 'Partner Ditugaskan',
    'Partner Accepted': 'Partner Menerima',
    'On The Way': 'Dalam Perjalanan',
    Working: 'Sedang Dikerjakan',
    Completed: 'Selesai',
    'Waiting Payment': 'Menunggu Pembayaran',
    Paid: 'Lunas',
    Closed: 'Ditutup',
    Cancelled: 'Dibatalkan',
    Rejected: 'Ditolak',
    Expired: 'Kadaluwarsa',
  };
  return labels[status] ?? status;
}

/**
 * Dapatkan warna status untuk badge/tag.
 */
export function getStatusColor(
  status: OrderStatus,
): 'default' | 'warning' | 'success' | 'danger' | 'info' {
  const colors: Record<OrderStatus, 'default' | 'warning' | 'success' | 'danger' | 'info'> = {
    Draft: 'default',
    'Pending Confirmation': 'warning',
    Confirmed: 'info',
    'Waiting Assignment': 'warning',
    'Partner Assigned': 'info',
    'Partner Accepted': 'info',
    'On The Way': 'info',
    Working: 'info',
    Completed: 'success',
    'Waiting Payment': 'warning',
    Paid: 'success',
    Closed: 'default',
    Cancelled: 'danger',
    Rejected: 'danger',
    Expired: 'danger',
  };
  return colors[status] ?? 'default';
}

export { ACTIVE_ORDER_STATUSES, FINAL_ORDER_STATUSES, ORDER_STATUS_TRANSITIONS };
