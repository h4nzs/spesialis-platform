import type { Context, Next } from 'hono';
import type { UserRole } from '@ahlipanggilan/types';
import { eq } from 'drizzle-orm';
import { db, systemSettings } from '../lib/db.ts';
import type { PermissionMap } from '@ahlipanggilan/shared';
import { forbidden } from '../lib/response.ts';

const DEFAULT_SEO_PERMISSIONS: PermissionMap = {
  'seo.meta': ['admin', 'super_admin', 'content_manager'],
  'seo.bulk': ['admin', 'super_admin'],
  'seo.audit': ['admin', 'super_admin', 'content_manager'],
  'seo.redirects': ['admin', 'super_admin'],
  'seo.404_monitor': ['admin', 'super_admin', 'content_manager'],
  'seo.indexnow': ['admin', 'super_admin'],
  'seo.schema': ['admin', 'super_admin', 'content_manager'],
  'seo.sitemap_settings': ['admin', 'super_admin'],
};

/**
 * LRU-like cache for permission settings.
 * Small TTL to avoid hitting DB on every request.
 */
let cachedPermissions: PermissionMap = DEFAULT_SEO_PERMISSIONS;
let cacheTimestamp = 0;
const CACHE_TTL = 30_000; // 30 seconds

async function loadPermissions(): Promise<PermissionMap> {
  const now = Date.now();
  if (now - cacheTimestamp < CACHE_TTL) {
    return cachedPermissions;
  }

  try {
    const rows = await db
      .select({ key: systemSettings.key, value: systemSettings.value })
      .from(systemSettings)
      .where(eq(systemSettings.category, 'seo_permissions'));

    if (!rows.length) {
      cachedPermissions = DEFAULT_SEO_PERMISSIONS;
      cacheTimestamp = now;
      return cachedPermissions;
    }

    const merged: PermissionMap = { ...DEFAULT_SEO_PERMISSIONS };
    for (const row of rows) {
      // key is like "perm_seo_meta" → map to permission key "seo.meta"
      const permKey = row.key.replace(/^perm_/, '').replace(/_/g, '.');
      if (!row.value) {
        // Empty value = revoke all non-admin roles
        merged[permKey] = ['admin', 'super_admin'];
      } else {
        const roles = row.value.split(',').filter(Boolean) as UserRole[];
        if (roles.length > 0) {
          merged[permKey] = roles;
        }
      }
    }

    cachedPermissions = merged;
    cacheTimestamp = now;
    return cachedPermissions;
  } catch {
    return DEFAULT_SEO_PERMISSIONS;
  }
}

/**
 * Middleware that checks if the authenticated user's role has access
 * to a specific permission. Permissions are configured in system_settings
 * (category: 'seo_permissions') and fall back to DEFAULT_PERMISSIONS.
 *
 * Usage: router.use('*', requirePermission('seo.redirects'))
 */
export function requirePermission(permission: string) {
  return async (c: Context, next: Next) => {
    const userRole = c.get('userRole') as UserRole;
    if (!userRole) {
      return forbidden(c, 'Insufficient permissions');
    }

    const permissions = await loadPermissions();
    const allowedRoles = permissions[permission];

    if (!allowedRoles || !allowedRoles.includes(userRole)) {
      return forbidden(c, 'Insufficient permissions');
    }

    await next();
  };
}
