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
  SEO_PERMISSION_KEYS,
  DEFAULT_PERMISSIONS,
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

describe('SEO permissions', () => {
  describe('seo.meta', () => {
    it('allows admin, super_admin, content_manager', () => {
      expect(hasPermission('admin', 'seo.meta')).toBe(true);
      expect(hasPermission('super_admin', 'seo.meta')).toBe(true);
      expect(hasPermission('content_manager', 'seo.meta')).toBe(true);
    });

    it('denies customer, partner, corporate, dispatcher, finance', () => {
      expect(hasPermission('customer', 'seo.meta')).toBe(false);
      expect(hasPermission('partner', 'seo.meta')).toBe(false);
      expect(hasPermission('corporate', 'seo.meta')).toBe(false);
      expect(hasPermission('dispatcher', 'seo.meta')).toBe(false);
      expect(hasPermission('finance', 'seo.meta')).toBe(false);
    });
  });

  describe('seo.bulk', () => {
    it('allows only admin and super_admin', () => {
      expect(hasPermission('admin', 'seo.bulk')).toBe(true);
      expect(hasPermission('super_admin', 'seo.bulk')).toBe(true);
      expect(hasPermission('content_manager', 'seo.bulk')).toBe(false);
    });
  });

  describe('seo.redirects', () => {
    it('allows only admin and super_admin', () => {
      expect(hasPermission('admin', 'seo.redirects')).toBe(true);
      expect(hasPermission('super_admin', 'seo.redirects')).toBe(true);
      expect(hasPermission('content_manager', 'seo.redirects')).toBe(false);
    });
  });

  describe('seo.indexnow', () => {
    it('allows only admin and super_admin', () => {
      expect(hasPermission('admin', 'seo.indexnow')).toBe(true);
      expect(hasPermission('super_admin', 'seo.indexnow')).toBe(true);
      expect(hasPermission('content_manager', 'seo.indexnow')).toBe(false);
    });
  });

  describe('seo.audit', () => {
    it('allows admin, super_admin, content_manager', () => {
      expect(hasPermission('admin', 'seo.audit')).toBe(true);
      expect(hasPermission('super_admin', 'seo.audit')).toBe(true);
      expect(hasPermission('content_manager', 'seo.audit')).toBe(true);
    });
  });

  describe('seo.404_monitor', () => {
    it('allows admin, super_admin, content_manager', () => {
      expect(hasPermission('admin', 'seo.404_monitor')).toBe(true);
      expect(hasPermission('super_admin', 'seo.404_monitor')).toBe(true);
      expect(hasPermission('content_manager', 'seo.404_monitor')).toBe(true);
    });
  });

  describe('seo.schema', () => {
    it('allows admin, super_admin, content_manager', () => {
      expect(hasPermission('admin', 'seo.schema')).toBe(true);
      expect(hasPermission('super_admin', 'seo.schema')).toBe(true);
      expect(hasPermission('content_manager', 'seo.schema')).toBe(true);
    });
  });

  describe('seo.sitemap_settings', () => {
    it('allows only admin and super_admin', () => {
      expect(hasPermission('admin', 'seo.sitemap_settings')).toBe(true);
      expect(hasPermission('super_admin', 'seo.sitemap_settings')).toBe(true);
      expect(hasPermission('content_manager', 'seo.sitemap_settings')).toBe(false);
    });
  });
});

describe('SEO_PERMISSION_KEYS', () => {
  it('has 8 permission entries', () => {
    expect(SEO_PERMISSION_KEYS).toHaveLength(8);
  });

  it('each entry has key, label, and description', () => {
    for (const perm of SEO_PERMISSION_KEYS) {
      expect(perm.key).toBeTruthy();
      expect(perm.label).toBeTruthy();
      expect(perm.description).toBeTruthy();
    }
  });

  it('all keys exist in DEFAULT_PERMISSIONS', () => {
    for (const perm of SEO_PERMISSION_KEYS) {
      expect(DEFAULT_PERMISSIONS[perm.key]).toBeDefined();
    }
  });

  it('SEO keys are prefixed with seo.', () => {
    for (const perm of SEO_PERMISSION_KEYS) {
      expect(perm.key).toMatch(/^seo\./);
    }
  });
});
