import { describe, it, expect } from 'vitest';
import { createCorporateInquirySchema, updateCorporateInquirySchema } from './corporate-inquiry.ts';

const validInquiry = {
  companyName: 'PT Maju Sejahtera',
  email: 'info@maju.com',
  phone: '02112345678',
};

describe('createCorporateInquirySchema', () => {
  it('accepts valid inquiry (minimal)', () => {
    const result = createCorporateInquirySchema.safeParse(validInquiry);
    expect(result.success).toBe(true);
  });

  it('accepts with all optional fields', () => {
    const result = createCorporateInquirySchema.safeParse({
      ...validInquiry,
      legalName: 'PT Maju Sejahtera Tbk',
      industry: 'Teknologi',
      employeeCount: 500,
      notes: 'Tertarik dengan layanan maintenance',
    });
    expect(result.success).toBe(true);
  });

  it('coerces string employeeCount to number', () => {
    const result = createCorporateInquirySchema.safeParse({
      ...validInquiry,
      employeeCount: '250',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty companyName', () => {
    const result = createCorporateInquirySchema.safeParse({ ...validInquiry, companyName: '' });
    expect(result.success).toBe(false);
  });

  it('rejects companyName exceeding 255 chars', () => {
    const result = createCorporateInquirySchema.safeParse({
      ...validInquiry,
      companyName: 'x'.repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = createCorporateInquirySchema.safeParse({ ...validInquiry, email: 'not-email' });
    expect(result.success).toBe(false);
  });

  it('rejects empty email', () => {
    const result = createCorporateInquirySchema.safeParse({ ...validInquiry, email: '' });
    expect(result.success).toBe(false);
  });

  it('rejects empty phone', () => {
    const result = createCorporateInquirySchema.safeParse({ ...validInquiry, phone: '' });
    expect(result.success).toBe(false);
  });

  it('rejects phone exceeding 50 chars', () => {
    const result = createCorporateInquirySchema.safeParse({
      ...validInquiry,
      phone: '0'.repeat(51),
    });
    expect(result.success).toBe(false);
  });

  it('rejects legalName exceeding 255 chars', () => {
    const result = createCorporateInquirySchema.safeParse({
      ...validInquiry,
      legalName: 'x'.repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it('rejects industry exceeding 255 chars', () => {
    const result = createCorporateInquirySchema.safeParse({
      ...validInquiry,
      industry: 'x'.repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it('rejects employeeCount = 0', () => {
    const result = createCorporateInquirySchema.safeParse({
      ...validInquiry,
      employeeCount: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects employeeCount negative', () => {
    const result = createCorporateInquirySchema.safeParse({
      ...validInquiry,
      employeeCount: -5,
    });
    expect(result.success).toBe(false);
  });

  it('rejects notes exceeding 1000 chars', () => {
    const result = createCorporateInquirySchema.safeParse({
      ...validInquiry,
      notes: 'x'.repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing companyName', () => {
    const { companyName: _c, ...noName } = validInquiry;
    const result = createCorporateInquirySchema.safeParse(noName);
    expect(result.success).toBe(false);
  });
});

describe('updateCorporateInquirySchema', () => {
  it('accepts valid status update', () => {
    const result = updateCorporateInquirySchema.safeParse({ status: 'Pending' });
    expect(result.success).toBe(true);
  });

  it('accepts all valid statuses', () => {
    for (const s of ['Pending', 'Contacted', 'Negotiation', 'Converted', 'Closed']) {
      const result = updateCorporateInquirySchema.safeParse({ status: s });
      expect(result.success).toBe(true);
    }
  });

  it('accepts with notes', () => {
    const result = updateCorporateInquirySchema.safeParse({
      status: 'Negotiation',
      notes: 'Sudah dihubungi oleh sales',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid status', () => {
    const result = updateCorporateInquirySchema.safeParse({ status: 'Invalid' });
    expect(result.success).toBe(false);
  });

  it('rejects empty status', () => {
    const result = updateCorporateInquirySchema.safeParse({ status: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing status', () => {
    const result = updateCorporateInquirySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects notes exceeding 1000 chars', () => {
    const result = updateCorporateInquirySchema.safeParse({
      status: 'Contacted',
      notes: 'x'.repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});
