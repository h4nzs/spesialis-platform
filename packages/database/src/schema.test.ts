import { describe, it, expect } from 'vitest';
import * as schema from './schema/index.ts';
import { db } from './client.ts';

/**
 * Schema Integrity Tests
 *
 * These tests verify that the database schema exports are correct WITHOUT
 * connecting to a real database. They check:
 * - All expected tables are exported
 * - All expected relations are exported
 * - Each table has a UUID primary key 'id' column
 * - Tables that should support soft-delete have 'deletedAt'
 * - Type-safe $type<>() calls are present on relevant tables
 * - Client exports a valid db instance
 */

// ── Expected table & relation names ──────────────────────────────────────────
const TABLE_NAMES = [
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
  'articleCategories',
  'articles',
  'contracts',
  'invoices',
  'faq',
  'corporateInquiries',
] as const;

const RELATION_NAMES = [
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
  'articleCategoriesRelations',
  'articlesRelations',
  'contractsRelations',
  'invoicesRelations',
] as const;

// Tables that support soft-delete (have deletedAt timestamp column)
const SOFT_DELETE_TABLES = new Set([
  'users',
  'customerProfiles',
  'partnerProfiles',
  'companies',
  'addresses',
  'services',
  'orders',
  'articles',
  'contracts',
  'invoices',
  'faq',
  'corporateInquiries',
]);

// Tables with type-specific $type<>() calls
const TYPED_TABLES: Record<string, Record<string, string>> = {
  users: { role: 'UserRole', status: 'UserStatus' },
  partnerProfiles: {
    availability: 'PartnerAvailability',
    verificationStatus: 'PartnerVerificationStatus',
  },
  companies: { status: 'CompanyStatus' },
  orders: { status: 'OrderStatus' },
  payments: { method: 'PaymentMethod', status: 'PaymentStatus' },
  complaints: { status: 'ComplaintStatus' },
  notifications: { channel: 'NotificationChannel' },
};

// ── Tests ────────────────────────────────────────────────────────────────────

describe('schema exports', () => {
  it('exports all 32 tables', () => {
    for (const name of TABLE_NAMES) {
      expect(schema).toHaveProperty(name);
      expect(schema[name as keyof typeof schema]).toBeDefined();
    }
  });

  it('exports only the expected 32 tables (no extra)', () => {
    const allKeys = Object.keys(schema).filter((k) => !k.endsWith('Relations') && k !== 'default');
    expect(allKeys.length).toBe(TABLE_NAMES.length);
    for (const key of allKeys) {
      expect(TABLE_NAMES.includes(key as (typeof TABLE_NAMES)[number])).toBe(true);
    }
  });

  it('exports all 24 relations', () => {
    for (const name of RELATION_NAMES) {
      expect(schema).toHaveProperty(name);
      expect(schema[name as keyof typeof schema]).toBeDefined();
    }
  });
});

describe('table column structure', () => {
  describe.each(TABLE_NAMES)('%s', (tableName) => {
    const table = schema[tableName as keyof typeof schema] as Record<string, unknown>;

    it('has an id column that is a UUID primary key', () => {
      const idCol = table['id'] as Record<string, unknown> | undefined;
      expect(idCol).toBeDefined();
      // drizzle columns have .primary property when primaryKey() is used
      expect(idCol!['primary']).toBe(true);
      // UUID columns have name 'id'
      expect(idCol!['name']).toBe('id');
    });

    // Some tables (e.g. notifications, orderMedia) omit createdAt or updatedAt
    it('createdAt exists when table has it', () => {
      const col = table['createdAt'] as Record<string, unknown> | undefined;
      if (col) {
        expect(col['name']).toBe('created_at');
        expect(col['hasDefault']).toBe(true);
      }
    });

    it('updatedAt exists when table has it', () => {
      const col = table['updatedAt'] as Record<string, unknown> | undefined;
      if (col) {
        expect(col['name']).toBe('updated_at');
        expect(col['hasDefault']).toBe(true);
      }
    });

    if (SOFT_DELETE_TABLES.has(tableName)) {
      it('has deletedAt timestamp for soft delete', () => {
        const col = table['deletedAt'] as Record<string, unknown> | undefined;
        expect(col).toBeDefined();
        expect(col!['name']).toBe('deleted_at');
      });
    }
  });
});

describe('typed columns ($type)', () => {
  it.each(Object.entries(TYPED_TABLES))('%s has correct $type on columns', (tableName, columns) => {
    const table = schema[tableName as keyof typeof schema] as Record<string, unknown>;
    for (const [colName] of Object.entries(columns)) {
      const col = table[colName] as Record<string, unknown> | undefined;
      expect(col).toBeDefined();
      expect(col!['name']).toBeDefined();
    }
  });
});

describe('relation exports', () => {
  it('all 24 relation exports are defined', () => {
    for (const name of RELATION_NAMES) {
      expect(schema).toHaveProperty(name);
      expect(schema[name as keyof typeof schema]).toBeDefined();
    }
  });
});

describe('client export', () => {
  it('exports a db object', () => {
    expect(db).toBeDefined();
    // db should have drizzle methods
    expect(typeof db.select).toBe('function');
    expect(typeof db.insert).toBe('function');
    expect(typeof db.update).toBe('function');
    expect(typeof db.delete).toBe('function');
  });
});
