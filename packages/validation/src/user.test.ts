import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
} from './user.ts';

const validUser = {
  email: 'user@example.com',
  phone: '08123456789',
  password: 'Password1',
  fullName: 'Test User',
};

describe('registerSchema', () => {
  it('accepts valid registration', () => {
    const result = registerSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it('rejects weak password (no uppercase)', () => {
    const result = registerSchema.safeParse({ ...validUser, password: 'password1' });
    expect(result.success).toBe(false);
  });

  it('rejects weak password (no digit)', () => {
    const result = registerSchema.safeParse({ ...validUser, password: 'Password' });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = registerSchema.safeParse({ ...validUser, password: 'Pass1' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({ ...validUser, email: 'not-email' });
    expect(result.success).toBe(false);
  });

  it('rejects empty fullName', () => {
    const result = registerSchema.safeParse({ ...validUser, fullName: '' });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepts valid login', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'Password1' });
    expect(result.success).toBe(true);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: '', password: 'Password1' });
    expect(result.success).toBe(false);
  });
});

describe('forgotPasswordSchema', () => {
  it('accepts valid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'user@example.com' });
    expect(result.success).toBe(true);
  });

  it('rejects empty email', () => {
    const result = forgotPasswordSchema.safeParse({ email: '' });
    expect(result.success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  it('accepts valid token and password', () => {
    const result = resetPasswordSchema.safeParse({ token: 'abc-123', password: 'NewPass1' });
    expect(result.success).toBe(true);
  });

  it('rejects weak new password', () => {
    const result = resetPasswordSchema.safeParse({ token: 'abc-123', password: 'weak' });
    expect(result.success).toBe(false);
  });
});

describe('updateProfileSchema', () => {
  it('accepts partial update with email only', () => {
    const result = updateProfileSchema.safeParse({ email: 'new@example.com' });
    expect(result.success).toBe(true);
  });

  it('accepts empty object (no updates)', () => {
    const result = updateProfileSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = updateProfileSchema.safeParse({ email: 'invalid' });
    expect(result.success).toBe(false);
  });
});

describe('changePasswordSchema', () => {
  it('accepts valid change', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'Old1pass',
      newPassword: 'NewPass1',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty current password', () => {
    const result = changePasswordSchema.safeParse({ currentPassword: '', newPassword: 'NewPass1' });
    expect(result.success).toBe(false);
  });
});

describe('deleteAccountSchema', () => {
  it('accepts valid password', () => {
    const result = deleteAccountSchema.safeParse({ password: 'Password1' });
    expect(result.success).toBe(true);
  });

  it('rejects empty password', () => {
    const result = deleteAccountSchema.safeParse({ password: '' });
    expect(result.success).toBe(false);
  });
});
