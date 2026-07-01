import { vi } from 'vitest';

export function setTestEnv() {
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-for-testing';
}

export function makeChain<T>(result: T) {
  const c: Record<string, unknown> = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    having: vi.fn().mockReturnThis(),
    then: (onfulfilled: (v: T) => unknown) => Promise.resolve(result).then(onfulfilled),
  };
  return c;
}

export function insertChain<T>(result: T) {
  return {
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue(result),
    }),
  };
}

export function updateChain<T>(result: T) {
  return {
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue(result),
      }),
    }),
  };
}

/** Build empty table mocks inside vi.hoisted() — use like `const { ...em } = buildEmptyTables()` */
export function buildEmptyTables() {
  const names = [
    'users',
    'customerProfiles',
    'partnerProfiles',
    'companies',
    'addresses',
    'serviceCategories',
    'services',
    'orders',
    'orderItems',
    'assignments',
    'payments',
    'reviews',
    'complaints',
    'notifications',
    'auditLogs',
    'media',
    'orderMedia',
    'seoMetadata',
    'systemSettings',
    'orderStatusHistory',
    'companyUsers',
    'branches',
    'refreshTokens',
    'passwordResets',
    'partnerSkills',
    'partnerDocuments',
    'usersRelations',
    'customerProfilesRelations',
    'partnerProfilesRelations',
    'companiesRelations',
    'companyUsersRelations',
    'branchesRelations',
    'serviceCategoriesRelations',
    'servicesRelations',
    'ordersRelations',
    'orderItemsRelations',
    'assignmentsRelations',
    'paymentsRelations',
    'reviewsRelations',
    'complaintsRelations',
    'notificationsRelations',
    'auditLogsRelations',
    'partnerSkillsRelations',
    'partnerDocumentsRelations',
    'mediaRelations',
    'orderMediaRelations',
  ];
  const exps: Record<string, unknown> = {};
  for (const n of names) exps[n] = {};
  return exps;
}

/** Build mock auth module inside vi.hoisted() — destructure into mock factory. */
export function buildMockAuth() {
  return {
    hashPassword: vi.fn().mockResolvedValue('hashed-password'),
    verifyPassword: vi.fn().mockResolvedValue(true),
    signAccessToken: vi.fn().mockResolvedValue('mock-access-token'),
    verifyAccessToken: vi
      .fn()
      .mockResolvedValue({ sub: 'test-user-id', role: 'customer' as const, exp: 9999999999 }),
    generateRefreshToken: vi.fn().mockReturnValue('mock-refresh-token'),
    hashToken: vi.fn().mockReturnValue('mock-hash-token'),
    getRefreshTokenExpiry: vi.fn().mockReturnValue(new Date(Date.now() + 7 * 86400000)),
  };
}

export function buildMockEmail() {
  return { sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined) };
}

export function buildMockAudit() {
  return { createAuditLog: vi.fn().mockResolvedValue(undefined) };
}

export function buildMockNotif() {
  return { createNotification: vi.fn().mockResolvedValue(undefined) };
}

export function buildMockRateLimit() {
  return { rateLimit: () => async (_c: unknown, next: () => unknown) => next() };
}

/** Mock auth middleware factory — returns { authMiddleware, requireRole } */
export function buildAuthMiddleware(authState: { userId: string; userRole: string }) {
  return {
    authMiddleware: async (c: any, next: any) => {
      if (!c.req.header('Authorization')) {
        c.status(401);
        return c.json({ success: false, code: 'UNAUTHORIZED', message: 'No token' });
      }
      c.set('userId', authState.userId);
      c.set('userRole', authState.userRole);
      await next();
    },
    requireRole:
      (...roles: string[]) =>
      async (c: any, next: any) => {
        if (!roles.includes(authState.userRole)) {
          c.status(403);
          return c.json({ success: false, code: 'FORBIDDEN', message: 'Forbidden' });
        }
        await next();
      },
  };
}

// Legacy exports kept for backward compat
export const TABLE_NAMES = [
  'users',
  'customerProfiles',
  'partnerProfiles',
  'companies',
  'addresses',
  'serviceCategories',
  'services',
  'orders',
  'orderItems',
  'assignments',
  'payments',
  'reviews',
  'complaints',
  'notifications',
  'auditLogs',
  'media',
  'orderMedia',
  'seoMetadata',
  'systemSettings',
  'orderStatusHistory',
  'companyUsers',
  'branches',
  'refreshTokens',
  'passwordResets',
  'partnerSkills',
  'partnerDocuments',
  'usersRelations',
  'customerProfilesRelations',
  'partnerProfilesRelations',
  'companiesRelations',
  'companyUsersRelations',
  'branchesRelations',
  'serviceCategoriesRelations',
  'servicesRelations',
  'ordersRelations',
  'orderItemsRelations',
  'assignmentsRelations',
  'paymentsRelations',
  'reviewsRelations',
  'complaintsRelations',
  'notificationsRelations',
  'auditLogsRelations',
  'partnerSkillsRelations',
  'partnerDocumentsRelations',
  'mediaRelations',
  'orderMediaRelations',
];

export const EMPTY_TABLES: Record<string, unknown> = {};
for (const n of TABLE_NAMES) EMPTY_TABLES[n] = {};

export const MOCK_AUTH_MODULE = buildMockAuth();
export const MOCK_EMAIL_MODULE = buildMockEmail();
export const MOCK_AUDIT_MODULE = buildMockAudit();
export const MOCK_NOTIF_MODULE = buildMockNotif();
export const MOCK_RATELIMIT_MODULE = buildMockRateLimit();
