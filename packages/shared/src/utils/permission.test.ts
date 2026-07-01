import { describe, it, expect } from 'vitest';
import type { UserRole } from '@specialist/types';
import type { PermissionMap } from './permission.ts';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getPermissionsForRole,
  getRoleHierarchy,
  compareRoles,
  canManageRole,
} from './permission.ts';

describe('hasPermission', () => {
  it('allows customer to create booking', () => {
    expect(hasPermission('customer', 'booking.create')).toBe(true);
  });

  it('allows admin to confirm booking', () => {
    expect(hasPermission('admin', 'booking.confirm')).toBe(true);
  });

  it('denies customer to confirm booking', () => {
    expect(hasPermission('customer', 'booking.confirm')).toBe(false);
  });

  it('denies unknown permission', () => {
    expect(hasPermission('admin', 'unknown.permission')).toBe(false);
  });

  it('uses custom permission map when provided', () => {
    const custom: PermissionMap = { 'custom.permission': ['admin' as UserRole] };
    expect(hasPermission('admin', 'custom.permission', custom)).toBe(true);
    expect(hasPermission('customer', 'custom.permission', custom)).toBe(false);
  });
});

describe('hasAnyPermission', () => {
  it('returns true when role has at least one', () => {
    expect(hasAnyPermission('admin', ['booking.confirm', 'booking.create'])).toBe(true);
  });

  it('returns false when role has none', () => {
    expect(hasAnyPermission('customer', ['booking.confirm', 'booking.assign'])).toBe(false);
  });
});

describe('hasAllPermissions', () => {
  it('returns true when role has all', () => {
    expect(hasAllPermissions('admin', ['booking.confirm', 'booking.assign'])).toBe(true);
  });

  it('returns false when role lacks one', () => {
    expect(hasAllPermissions('customer', ['booking.create', 'booking.confirm'])).toBe(false);
  });
});

describe('getPermissionsForRole', () => {
  it('returns permissions for customer', () => {
    const perms = getPermissionsForRole('customer');
    expect(perms).toContain('booking.create');
    expect(perms).toContain('booking.view_own');
    expect(perms).toContain('payment.create');
    expect(perms).toContain('review.create');
    expect(perms).toContain('complaint.create');
  });

  it('returns more permissions for admin', () => {
    const adminPerms = getPermissionsForRole('admin');
    const customerPerms = getPermissionsForRole('customer');
    expect(adminPerms.length).toBeGreaterThan(customerPerms.length);
  });
});

describe('getRoleHierarchy', () => {
  it('customer is lowest', () => {
    expect(getRoleHierarchy('customer')).toBe(0);
  });

  it('super_admin is highest', () => {
    expect(getRoleHierarchy('super_admin')).toBe(7);
  });
});

describe('compareRoles', () => {
  it('admin > customer', () => {
    expect(compareRoles('admin', 'customer')).toBeGreaterThan(0);
  });

  it('customer < admin', () => {
    expect(compareRoles('customer', 'admin')).toBeLessThan(0);
  });

  it('equal roles return 0', () => {
    expect(compareRoles('admin', 'admin')).toBe(0);
  });
});

describe('canManageRole', () => {
  it('admin can manage any role', () => {
    expect(canManageRole('admin', 'customer')).toBe(true);
    expect(canManageRole('admin', 'partner')).toBe(true);
  });

  it('dispatcher can manage non-staff roles', () => {
    expect(canManageRole('dispatcher', 'customer')).toBe(true);
    expect(canManageRole('dispatcher', 'partner')).toBe(true);
  });

  it('customer cannot manage others', () => {
    expect(canManageRole('customer', 'partner')).toBe(false);
  });
});
