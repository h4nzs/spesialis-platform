import { describe, it, expect } from 'vitest';
import { createCompanySchema, updateCompanySchema, verifyCompanySchema } from './company.ts';

const validCompany = {
  companyName: 'PT Maju Jaya',
  legalName: 'PT Maju Jaya Abadi',
  email: 'info@majujaya.com',
  phone: '6281234567890',
  password: 'rahasia123',
};

describe('createCompanySchema', () => {
  it('accepts valid company', () => {
    const result = createCompanySchema.safeParse(validCompany);
    expect(result.success).toBe(true);
  });

  it('accepts with all optional fields', () => {
    const result = createCompanySchema.safeParse({
      ...validCompany,
      website: 'https://majujaya.com',
      industry: 'Technology',
      employeeCount: 50,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const result = createCompanySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = createCompanySchema.safeParse({ ...validCompany, email: 'not-email' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid phone', () => {
    const result = createCompanySchema.safeParse({ ...validCompany, phone: 'abc' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid website URL', () => {
    const result = createCompanySchema.safeParse({ ...validCompany, website: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('rejects zero employee count', () => {
    const result = createCompanySchema.safeParse({ ...validCompany, employeeCount: 0 });
    expect(result.success).toBe(false);
  });
});

describe('updateCompanySchema', () => {
  it('accepts partial update', () => {
    const result = updateCompanySchema.safeParse({ companyName: 'PT Baru' });
    expect(result.success).toBe(true);
  });

  it('accepts website set to null', () => {
    const result = updateCompanySchema.safeParse({ website: null });
    expect(result.success).toBe(true);
  });
});

describe('verifyCompanySchema', () => {
  it('accepts Verified status', () => {
    const result = verifyCompanySchema.safeParse({ status: 'Verified' });
    expect(result.success).toBe(true);
  });

  it('accepts Rejected status with note', () => {
    const result = verifyCompanySchema.safeParse({
      status: 'Rejected',
      note: 'Dokumen tidak lengkap',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid status', () => {
    const result = verifyCompanySchema.safeParse({ status: 'Approved' });
    expect(result.success).toBe(false);
  });
});
