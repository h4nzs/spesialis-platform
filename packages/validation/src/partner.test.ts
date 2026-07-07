import { describe, it, expect } from 'vitest';
import {
  registerPartnerSchema,
  updateAvailabilitySchema,
  verifyPartnerSchema,
  addSkillSchema,
  partnerRegistrationSchema,
} from './partner.ts';

describe('registerPartnerSchema', () => {
  it('accepts valid partner registration', () => {
    const result = registerPartnerSchema.safeParse({
      fullName: 'Partner Satu',
      phone: '08123456789',
      ktpNumber: '3171010101000001',
      password: 'rahasia123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects short password', () => {
    const result = registerPartnerSchema.safeParse({
      fullName: 'Partner Satu',
      phone: '08123456789',
      ktpNumber: '3171010101000001',
      password: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing password', () => {
    const result = registerPartnerSchema.safeParse({
      fullName: 'Partner Satu',
      phone: '08123456789',
      ktpNumber: '3171010101000001',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateAvailabilitySchema', () => {
  it('accepts valid availability', () => {
    const result = updateAvailabilitySchema.safeParse({ availability: 'Available' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid availability', () => {
    const result = updateAvailabilitySchema.safeParse({ availability: 'Unknown' });
    expect(result.success).toBe(false);
  });

  it('accepts all valid values', () => {
    for (const val of ['Available', 'Busy', 'Vacation', 'Offline'] as const) {
      const result = updateAvailabilitySchema.safeParse({ availability: val });
      expect(result.success).toBe(true);
    }
  });
});

describe('verifyPartnerSchema', () => {
  it('accepts approve', () => {
    const result = verifyPartnerSchema.safeParse({ verificationStatus: 'Approved' });
    expect(result.success).toBe(true);
  });

  it('accepts reject', () => {
    const result = verifyPartnerSchema.safeParse({ verificationStatus: 'Rejected' });
    expect(result.success).toBe(true);
  });

  it('rejects unknown status', () => {
    const result = verifyPartnerSchema.safeParse({ verificationStatus: 'Pending' });
    expect(result.success).toBe(false);
  });
});

describe('addSkillSchema', () => {
  it('accepts valid skill', () => {
    const result = addSkillSchema.safeParse({
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
  });

  it('accepts skill with proficiency', () => {
    const result = addSkillSchema.safeParse({
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      proficiency: 'Expert',
    });
    expect(result.success).toBe(true);
  });
});

describe('partnerRegistrationSchema', () => {
  it('accepts valid partner registration with password', () => {
    const result = partnerRegistrationSchema.safeParse({
      email: 'partner@example.com',
      phone: '08123456789',
      password: 'Password1',
      fullName: 'Partner Satu',
      ktpNumber: '3171010101000001',
    });
    expect(result.success).toBe(true);
  });
});
