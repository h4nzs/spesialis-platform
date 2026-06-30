import type {
  OrderStatus,
  UserRole,
  UserStatus,
  PaymentMethod,
  PaymentStatus,
  AssignmentStatus,
  ComplaintStatus,
  PartnerAvailability,
  PartnerVerificationStatus,
  CompanyStatus,
} from '@specialist/types';

// ─── Order Status ────────────────────────────────────────────────
export const ORDER_STATUSES: Record<OrderStatus, OrderStatus> = {
  Draft: 'Draft',
  'Pending Confirmation': 'Pending Confirmation',
  Confirmed: 'Confirmed',
  'Waiting Assignment': 'Waiting Assignment',
  'Partner Assigned': 'Partner Assigned',
  'Partner Accepted': 'Partner Accepted',
  'On The Way': 'On The Way',
  Working: 'Working',
  Completed: 'Completed',
  'Waiting Payment': 'Waiting Payment',
  Paid: 'Paid',
  Closed: 'Closed',
  Cancelled: 'Cancelled',
  Rejected: 'Rejected',
  Expired: 'Expired',
} as const;

/** Status pemesanan yang dianggap "active" (belum selesai/dibatalkan) */
export const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  'Pending Confirmation',
  'Confirmed',
  'Waiting Assignment',
  'Partner Assigned',
  'Partner Accepted',
  'On The Way',
  'Working',
  'Waiting Payment',
];

/** Status pemesanan yang dianggap final (selesai) */
export const FINAL_ORDER_STATUSES: OrderStatus[] = [
  'Paid',
  'Closed',
  'Cancelled',
  'Rejected',
  'Expired',
];

/** Status transisi yang valid untuk setiap status */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  Draft: ['Pending Confirmation'],
  'Pending Confirmation': ['Confirmed', 'Cancelled'],
  Confirmed: ['Waiting Assignment', 'Cancelled'],
  'Waiting Assignment': ['Partner Assigned', 'Cancelled'],
  'Partner Assigned': ['Partner Accepted', 'Waiting Assignment', 'Cancelled'],
  'Partner Accepted': ['Working', 'Cancelled'],
  'On The Way': ['Working', 'Cancelled'],
  Working: ['Completed'],
  Completed: ['Waiting Payment'],
  'Waiting Payment': ['Paid'],
  Paid: ['Closed'],
  Closed: [],
  Cancelled: [],
  Rejected: [],
  Expired: [],
};

/** Daftar status yang memperbolehkan customer untuk cancel */
export const CANCELLABLE_BY_CUSTOMER: OrderStatus[] = [
  'Pending Confirmation',
  'Confirmed',
  'Waiting Assignment',
];

/**
 * Cek apakah transisi status valid.
 */
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Cek apakah order masih dalam status aktif.
 */
export function isOrderActive(status: OrderStatus): boolean {
  return ACTIVE_ORDER_STATUSES.includes(status);
}

/**
 * Cek apakah order sudah mencapai status final.
 */
export function isOrderFinal(status: OrderStatus): boolean {
  return FINAL_ORDER_STATUSES.includes(status);
}

// ─── User Roles ──────────────────────────────────────────────────
export const ROLES: Record<UserRole, UserRole> = {
  customer: 'customer',
  partner: 'partner',
  corporate: 'corporate',
  dispatcher: 'dispatcher',
  finance: 'finance',
  content_manager: 'content_manager',
  admin: 'admin',
  super_admin: 'super_admin',
} as const;

export const ADMIN_ROLES: UserRole[] = ['admin', 'super_admin'];
export const STAFF_ROLES: UserRole[] = [
  'admin',
  'super_admin',
  'dispatcher',
  'finance',
  'content_manager',
];

/**
 * Cek apakah role termasuk admin.
 */
export function isAdminRole(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role);
}

/**
 * Cek apakah role termasuk staff internal.
 */
export function isStaffRole(role: UserRole): boolean {
  return STAFF_ROLES.includes(role);
}

// ─── User Status ─────────────────────────────────────────────────
export const USER_STATUSES: Record<UserStatus, UserStatus> = {
  pending: 'pending',
  active: 'active',
  blocked: 'blocked',
  suspended: 'suspended',
  deleted: 'deleted',
} as const;

// ─── Payment ─────────────────────────────────────────────────────
export const PAYMENT_METHODS: Record<PaymentMethod, PaymentMethod> = {
  Cash: 'Cash',
  Transfer: 'Transfer',
  QRIS: 'QRIS',
  'E-Wallet': 'E-Wallet',
  Other: 'Other',
} as const;

export const PAYMENT_STATUSES: Record<PaymentStatus, PaymentStatus> = {
  Waiting: 'Waiting',
  'Pending Verification': 'Pending Verification',
  Paid: 'Paid',
  Failed: 'Failed',
  Refunded: 'Refunded',
} as const;

// ─── Assignment ──────────────────────────────────────────────────
export const ASSIGNMENT_STATUSES: Record<AssignmentStatus, AssignmentStatus> = {
  Assigned: 'Assigned',
  Accepted: 'Accepted',
  Rejected: 'Rejected',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
} as const;

// ─── Complaint ───────────────────────────────────────────────────
export const COMPLAINT_STATUSES: Record<ComplaintStatus, ComplaintStatus> = {
  Open: 'Open',
  Investigating: 'Investigating',
  Resolved: 'Resolved',
  Closed: 'Closed',
} as const;

// ─── Partner ─────────────────────────────────────────────────────
export const PARTNER_AVAILABILITY: Record<PartnerAvailability, PartnerAvailability> = {
  Available: 'Available',
  Busy: 'Busy',
  Vacation: 'Vacation',
  Offline: 'Offline',
} as const;

export const PARTNER_VERIFICATION_STATUSES: Record<
  PartnerVerificationStatus,
  PartnerVerificationStatus
> = {
  Pending: 'Pending',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Suspended: 'Suspended',
} as const;

// ─── Company ─────────────────────────────────────────────────────
export const COMPANY_STATUSES: Record<CompanyStatus, CompanyStatus> = {
  Pending: 'Pending',
  Verified: 'Verified',
  Rejected: 'Rejected',
  Suspended: 'Suspended',
} as const;

// ─── Notification Channels ──────────────────────────────────────
export const NOTIFICATION_CHANNELS = ['Email', 'WhatsApp', 'Push', 'In App'] as const;

// ─── Other Constants ─────────────────────────────────────────────
export const BOOKING_NUMBER_PREFIX = 'SP';
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf'] as const;
export const ID_PROVINCES = [
  'Aceh',
  'Bali',
  'Banten',
  'Bengkulu',
  'DI Yogyakarta',
  'DKI Jakarta',
  'Gorontalo',
  'Jambi',
  'Jawa Barat',
  'Jawa Tengah',
  'Jawa Timur',
  'Kalimantan Barat',
  'Kalimantan Selatan',
  'Kalimantan Tengah',
  'Kalimantan Timur',
  'Kalimantan Utara',
  'Kepulauan Bangka Belitung',
  'Kepulauan Riau',
  'Lampung',
  'Maluku',
  'Maluku Utara',
  'Nusa Tenggara Barat',
  'Nusa Tenggara Timur',
  'Papua',
  'Papua Barat',
  'Papua Barat Daya',
  'Papua Pegunungan',
  'Papua Selatan',
  'Papua Tengah',
  'Riau',
  'Sulawesi Barat',
  'Sulawesi Selatan',
  'Sulawesi Tengah',
  'Sulawesi Tenggara',
  'Sulawesi Utara',
  'Sumatera Barat',
  'Sumatera Selatan',
  'Sumatera Utara',
] as const;
