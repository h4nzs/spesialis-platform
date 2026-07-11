import type { UserRole } from '@ahlipanggilan/types';
import { isAdminRole, isStaffRole, ADMIN_ROLES, ROLES } from '../constants.ts';

/**
 * Permission definition — mapping role ke akses fitur.
 * Setiap entri berisi daftar role yang diizinkan.
 */
export type PermissionMap = Record<string, UserRole[]>;

// ─── Default Permission Map ─────────────────────────────────────
// Sesuai dengan permission-matrix.md
export const DEFAULT_PERMISSIONS: PermissionMap = {
  // Booking
  'booking.create': ['customer', 'admin', 'super_admin'],
  'booking.view_own': ['customer', 'partner', 'corporate'],
  'booking.view_all': ['admin', 'super_admin', 'dispatcher'],
  'booking.confirm': ['admin', 'super_admin'],
  'booking.assign': ['admin', 'super_admin', 'dispatcher'],
  'booking.cancel': ['customer', 'admin', 'super_admin', 'dispatcher'],
  'booking.start_work': ['partner'],
  'booking.complete': ['partner'],

  // Payment
  'payment.create': ['customer'],
  'payment.verify': ['admin', 'super_admin', 'finance'],
  'payment.view_own': ['customer', 'partner'],
  'payment.view_all': ['admin', 'super_admin', 'finance'],

  // Partner
  'partner.register': ['partner'],
  'partner.verify': ['admin', 'super_admin'],
  'partner.view_all': ['admin', 'super_admin', 'dispatcher'],
  'partner.manage_skills': ['partner'],

  // Company / Corporate
  'company.create': ['corporate'],
  'company.verify': ['admin', 'super_admin'],
  'company.manage': ['corporate', 'admin', 'super_admin'],

  // Review
  'review.create': ['customer'],
  'review.view_all': ['admin', 'super_admin'],

  // Complaint
  'complaint.create': ['customer'],
  'complaint.resolve': ['admin', 'super_admin'],
  'complaint.view_all': ['admin', 'super_admin'],

  // CMS
  'cms.manage': ['admin', 'super_admin', 'content_manager'],

  // SEO & Indexing
  'seo.meta': ['admin', 'super_admin', 'content_manager'],
  'seo.bulk': ['admin', 'super_admin'],
  'seo.audit': ['admin', 'super_admin', 'content_manager'],
  'seo.redirects': ['admin', 'super_admin'],
  'seo.404_monitor': ['admin', 'super_admin', 'content_manager'],
  'seo.indexnow': ['admin', 'super_admin'],
  'seo.schema': ['admin', 'super_admin', 'content_manager'],
  'seo.sitemap_settings': ['admin', 'super_admin'],

  // Admin
  'admin.dashboard': ['admin', 'super_admin', 'dispatcher', 'finance'],
  'admin.users': ['admin', 'super_admin'],
  'admin.settings': ['admin', 'super_admin'],
  'admin.audit_logs': ['admin', 'super_admin'],
  'admin.role_manager': ['admin', 'super_admin'],
};

// ─── Permission Check Functions ──────────────────────────────────

/**
 * Cek apakah role punya akses ke permission tertentu.
 */
export function hasPermission(
  role: UserRole,
  permission: string,
  permissions?: PermissionMap,
): boolean {
  const map = permissions ?? DEFAULT_PERMISSIONS;
  const allowedRoles = map[permission];
  if (!allowedRoles) return false;
  return allowedRoles.includes(role);
}

/**
 * Cek apakah role memiliki akses ke minimal satu dari daftar permission.
 */
export function hasAnyPermission(
  role: UserRole,
  permissionList: string[],
  permissions?: PermissionMap,
): boolean {
  return permissionList.some((p) => hasPermission(role, p, permissions));
}

/**
 * Cek apakah role memiliki akses ke semua permission dalam daftar.
 */
export function hasAllPermissions(
  role: UserRole,
  permissionList: string[],
  permissions?: PermissionMap,
): boolean {
  return permissionList.every((p) => hasPermission(role, p, permissions));
}

/**
 * Dapatkan semua permission yang dimiliki oleh role.
 */
export function getPermissionsForRole(role: UserRole, permissions?: PermissionMap): string[] {
  const map = permissions ?? DEFAULT_PERMISSIONS;
  return Object.entries(map)
    .filter(([_, roles]) => roles.includes(role))
    .map(([permission]) => permission);
}

/**
 * Dapatkan role hierarchy (semakin tinggi index, semakin tinggi privilege).
 * Super admin adalah yang tertinggi.
 */
export function getRoleHierarchy(role: UserRole): number {
  const hierarchy: UserRole[] = [
    'customer',
    'partner',
    'corporate',
    'content_manager',
    'dispatcher',
    'finance',
    'admin',
    'super_admin',
  ];
  return hierarchy.indexOf(role);
}

/**
 * Bandingkan dua role. Return positive jika role1 > role2, negative jika <, 0 jika sama.
 */
export function compareRoles(role1: UserRole, role2: UserRole): number {
  return getRoleHierarchy(role1) - getRoleHierarchy(role2);
}

/**
 * Cek apakah role bisa mengelola role target (misal: admin bisa manage customer).
 * Admin & super admin bisa manage semua role di bawahnya.
 */
export function canManageRole(manager: UserRole, target: UserRole): boolean {
  if (isAdminRole(manager)) return true;
  if (isStaffRole(manager) && !isStaffRole(target)) return true;
  return compareRoles(manager, target) > 0;
}

/**
 * SEO feature permission keys — digunakan untuk referensi di middleware & UI.
 */
export const SEO_PERMISSION_KEYS: {
  key: string;
  label: string;
  description: string;
}[] = [
  {
    key: 'seo.meta',
    label: 'SEO Editor',
    description: 'Edit meta title, description, dan pengaturan SEO per halaman',
  },
  { key: 'seo.bulk', label: 'Bulk SEO', description: 'Edit meta SEO secara massal' },
  {
    key: 'seo.audit',
    label: 'SEO Audit',
    description: 'Menjalankan audit SEO dan melihat hasilnya',
  },
  { key: 'seo.redirects', label: 'Redirect Manager', description: 'Mengelola redirect URL' },
  { key: 'seo.404_monitor', label: '404 Monitor', description: 'Melihat dan mengelola error 404' },
  {
    key: 'seo.indexnow',
    label: 'IndexNow',
    description: 'Mengatur key IndexNow dan melihat log ping',
  },
  {
    key: 'seo.schema',
    label: 'Schema Builder',
    description: 'Membuat dan mengedit schema markup JSON-LD',
  },
  {
    key: 'seo.sitemap_settings',
    label: 'Sitemap Settings',
    description: 'Mengatur prioritas dan frekuensi sitemap',
  },
];

export { isAdminRole, isStaffRole, ADMIN_ROLES, ROLES };
