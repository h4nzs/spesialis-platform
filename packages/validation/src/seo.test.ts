import { describe, it, expect } from 'vitest';
import { upsertSeoSchema } from './seo.ts';

const validUuid = '550e8400-e29b-41d4-a716-446655440000';

const validSeo = {
  entityType: 'Service' as const,
  entityId: validUuid,
  metaTitle: 'Cuci AC Standar',
  metaDescription: 'Layanan cuci AC standar untuk rumah dan kantor',
  canonicalUrl: 'https://ahlipanggilan.id/services/cuci-ac-standar',
  robots: 'index, follow',
  ogTitle: 'Cuci AC Standar - Ahli Panggilan',
  ogDescription: 'Layanan cuci AC standar dengan harga terjangkau',
  ogImage: 'https://ahlipanggilan.id/images/cuci-ac.jpg',
  twitterTitle: 'Cuci AC Standar - Ahli Panggilan',
  twitterDescription: 'Layanan cuci AC standar dengan harga terjangkau',
  twitterImage: 'https://ahlipanggilan.id/images/cuci-ac.jpg',
  schemaJson: { '@type': 'Service', name: 'Cuci AC Standar' },
};

describe('upsertSeoSchema', () => {
  it('accepts complete SEO data', () => {
    const result = upsertSeoSchema.safeParse(validSeo);
    expect(result.success).toBe(true);
  });

  it('accepts minimal SEO data (required fields only)', () => {
    const result = upsertSeoSchema.safeParse({
      entityType: 'Article',
      entityId: validUuid,
    });
    expect(result.success).toBe(true);
  });

  it('accepts null optional fields', () => {
    const result = upsertSeoSchema.safeParse({
      entityType: 'Landing Page',
      entityId: validUuid,
      metaTitle: null,
      metaDescription: null,
      canonicalUrl: null,
      robots: null,
      ogTitle: null,
      ogDescription: null,
      ogImage: null,
      twitterTitle: null,
      twitterDescription: null,
      twitterImage: null,
      schemaJson: null,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid entityType', () => {
    const result = upsertSeoSchema.safeParse({
      entityType: 'InvalidType',
      entityId: validUuid,
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing entityType', () => {
    const result = upsertSeoSchema.safeParse({ entityId: validUuid });
    expect(result.success).toBe(false);
  });

  it('rejects invalid entityId', () => {
    const result = upsertSeoSchema.safeParse({
      entityType: 'Service',
      entityId: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });

  it('rejects metaTitle exceeding 60 characters', () => {
    const result = upsertSeoSchema.safeParse({
      entityType: 'Service',
      entityId: validUuid,
      metaTitle: 'x'.repeat(61),
    });
    expect(result.success).toBe(false);
  });

  it('rejects metaDescription exceeding 160 characters', () => {
    const result = upsertSeoSchema.safeParse({
      entityType: 'Service',
      entityId: validUuid,
      metaDescription: 'x'.repeat(161),
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid canonicalUrl', () => {
    const result = upsertSeoSchema.safeParse({
      entityType: 'Service',
      entityId: validUuid,
      canonicalUrl: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });

  it('rejects ogTitle exceeding 100 characters', () => {
    const result = upsertSeoSchema.safeParse({
      entityType: 'Service',
      entityId: validUuid,
      ogTitle: 'x'.repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it('rejects ogDescription exceeding 300 characters', () => {
    const result = upsertSeoSchema.safeParse({
      entityType: 'Service',
      entityId: validUuid,
      ogDescription: 'x'.repeat(301),
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid ogImage URL', () => {
    const result = upsertSeoSchema.safeParse({
      entityType: 'Service',
      entityId: validUuid,
      ogImage: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });
});
