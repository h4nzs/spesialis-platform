import type { UserRole } from '@specialist/types';
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

  // Admin
  'admin.dashboard': ['admin', 'super_admin', 'dispatcher', 'finance'],
  'admin.users': ['admin', 'super_admin'],
  'admin.settings': ['admin', 'super_admin'],
  'admin.audit_logs': ['admin', 'super_admin'],
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

export { isAdminRole, isStaffRole, ADMIN_ROLES, ROLES };
