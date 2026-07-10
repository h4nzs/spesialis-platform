import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Context } from 'hono';

// Mock DB dependencies
vi.mock('../lib/db.ts', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => [
            { key: 'perm_seo_meta', value: 'admin,super_admin,content_manager' },
          ]),
        })),
        limit: vi.fn(),
      })),
    })),
  },
  systemSettings: {},
}));

vi.mock('../lib/response.ts', () => ({
  forbidden: vi.fn().mockReturnValue('forbidden-response'),
}));

import { forbidden } from '../lib/response.ts';

function mockC(userRole?: string): Context {
  const state: Record<string, unknown> = { userRole };
  return {
    get: vi.fn((k: string) => state[k]),
    set: vi.fn(),
    status: vi.fn(),
    json: vi.fn(),
    req: { header: vi.fn(), param: vi.fn(), query: vi.fn() },
  } as any;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('requirePermission', () => {
  it('allows user with matching role', async () => {
    const c = mockC('admin');
    const next = vi.fn();

    const { requirePermission } = await import('./seo-permissions.ts');
    const middleware = requirePermission('seo.meta');
    await middleware(c, next);

    expect(next).toHaveBeenCalled();
    expect(forbidden).not.toHaveBeenCalled();
  });

  it('allows content_manager for seo.meta', async () => {
    const c = mockC('content_manager');
    const next = vi.fn();

    const { requirePermission } = await import('./seo-permissions.ts');
    const middleware = requirePermission('seo.meta');
    await middleware(c, next);

    expect(next).toHaveBeenCalled();
  });

  it('blocks user with non-matching role', async () => {
    const c = mockC('customer');
    const next = vi.fn();

    const { requirePermission } = await import('./seo-permissions.ts');
    const middleware = requirePermission('seo.redirects');
    await middleware(c, next);

    expect(forbidden).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('blocks dispatcher from accessing seo.indexnow', async () => {
    const c = mockC('dispatcher');
    const next = vi.fn();

    const { requirePermission } = await import('./seo-permissions.ts');
    const middleware = requirePermission('seo.indexnow');
    await middleware(c, next);

    expect(forbidden).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('blocks when no user role set', async () => {
    const c = mockC(undefined);
    const next = vi.fn();

    const { requirePermission } = await import('./seo-permissions.ts');
    const middleware = requirePermission('seo.meta');
    await middleware(c, next);

    expect(forbidden).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('blocks for unknown permission key', async () => {
    const c = mockC('super_admin');
    const next = vi.fn();

    const { requirePermission } = await import('./seo-permissions.ts');
    const middleware = requirePermission('seo.unknown_feature');
    await middleware(c, next);

    expect(forbidden).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('allows super_admin for all SEO permissions', async () => {
    const { requirePermission } = await import('./seo-permissions.ts');
    const seoPermissions = [
      'seo.meta',
      'seo.bulk',
      'seo.audit',
      'seo.redirects',
      'seo.404_monitor',
      'seo.indexnow',
      'seo.schema',
      'seo.sitemap_settings',
    ];

    for (const perm of seoPermissions) {
      const c = mockC('super_admin');
      const next = vi.fn();
      const middleware = requirePermission(perm);
      await middleware(c, next);
      expect(next).toHaveBeenCalled();
      vi.clearAllMocks();
    }
  });

  it('falls back to defaults when DB returns no rows', async () => {
    // Override the DB mock to return empty
    const dbMock = await import('../lib/db.ts');
    vi.mocked(dbMock.db.select).mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => []),
        })),
      })),
    } as any);

    const c = mockC('content_manager');
    const next = vi.fn();

    const { requirePermission } = await import('./seo-permissions.ts');
    const middleware = requirePermission('seo.meta');
    await middleware(c, next);

    // content_manager should have access via defaults
    expect(next).toHaveBeenCalled();
  });
});
