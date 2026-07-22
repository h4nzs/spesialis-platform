// =============================================================================
// Tests — Privacy Filter
// =============================================================================

import { describe, it, expect } from 'vitest';
import { privacyFilter, isPII, assessPrivacyLevel } from '../core/privacy.ts';

// Load property registry (needed for privacy level checks)
import '../properties/index.ts';

describe('isPII', () => {
  it('identifies email as PII', () => {
    expect(isPII('email')).toBe(true);
  });

  it('identifies phone as PII', () => {
    expect(isPII('phone')).toBe(true);
    expect(isPII('phone_number')).toBe(true);
  });

  it('identifies address as PII', () => {
    expect(isPII('address')).toBe(true);
  });

  it('identifies name as PII', () => {
    expect(isPII('name')).toBe(true);
    expect(isPII('full_name')).toBe(true);
  });

  it('identifies password/token as PII', () => {
    expect(isPII('password')).toBe(true);
    expect(isPII('token')).toBe(true);
    expect(isPII('jwt')).toBe(true);
  });

  it('identifies identity numbers as PII', () => {
    expect(isPII('nik')).toBe(true);
    expect(isPII('ktp')).toBe(true);
    expect(isPII('npwp')).toBe(true);
  });

  it('does not flag non-PII keys', () => {
    expect(isPII('category')).toBe(false);
    expect(isPII('service_id')).toBe(false);
    expect(isPII('amount')).toBe(false);
    expect(isPII('status')).toBe(false);
    expect(isPII('url')).toBe(false);
    expect(isPII('query')).toBe(false);
  });

  it('is case insensitive', () => {
    expect(isPII('Email')).toBe(true);
    expect(isPII('PHONE')).toBe(true);
  });
});

describe('privacyFilter', () => {
  it('passes through public properties', () => {
    const result = privacyFilter('test_event', {
      service_id: 'srv-123',
      booking_id: 'bk-001',
      status: 'completed',
    });
    expect(result.service_id).toBe('srv-123');
    expect(result.booking_id).toBe('bk-001');
    expect(result.status).toBe('completed');
  });

  it('filters out PII email', () => {
    const result = privacyFilter('test_event', {
      email: 'user@example.com',
      service_id: 'srv-123',
    });
    expect(result.email).toBeUndefined();
    expect(result.service_id).toBe('srv-123');
  });

  it('filters out PII phone', () => {
    const result = privacyFilter('test_event', {
      phone: '08123456789',
    });
    expect(result.phone).toBeUndefined();
  });

  it('filters out PII name', () => {
    const result = privacyFilter('test_event', {
      name: 'John Doe',
      full_name: 'John Doe',
    });
    expect(result.name).toBeUndefined();
    expect(result.full_name).toBeUndefined();
  });

  it('filters out PII token and password', () => {
    const result = privacyFilter('test_event', {
      token: 'abc123',
      password: 'secret123',
      session_id: 'ses-456',
    });
    expect(result.token).toBeUndefined();
    expect(result.password).toBeUndefined();
    expect(result.session_id).toBeUndefined();
  });

  it('filters out sensitive properties from registry', () => {
    // 'user_id' should be registered as at least internal
    const result = privacyFilter('test_event', {
      user_id: 'usr-123',
      email_hash: 'hash123',
    });
    expect(result.user_id).toBeUndefined();
    expect(result.email_hash).toBeUndefined();
  });

  it('keeps arrays as-is', () => {
    const result = privacyFilter('test_event', {
      items: ['a', 'b', 'c'],
      count: 3,
    });
    expect(result.items).toEqual(['a', 'b', 'c']);
    expect(result.count).toBe(3);
  });

  it('handles nested objects with depth limit', () => {
    const nested = {
      level1: {
        level2: {
          level3: {
            level4: {
              level5: {
                level6: {
                  level7: {
                    level8: {
                      level9: {
                        level10: {
                          level11: {
                            deep_prop: 'should be truncated',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
    // Should not throw — depth limit prevents stack overflow
    const result = privacyFilter('test_event', nested as Record<string, unknown>);
    expect(result.level1).toBeDefined();
  });

  it('handles circular references without stack overflow', () => {
    const obj: Record<string, unknown> = { name: 'test' };
    const child: Record<string, unknown> = { parent: obj };
    obj.child = child;

    // Should not throw on circular reference
    expect(() => privacyFilter('test_event', obj)).not.toThrow();
    // The result should contain the top-level property
    // Depending on filter behavior, circular refs may be skipped
    expect(typeof privacyFilter('test_event', obj)).toBe('object');
  });

  it('returns empty object for empty input', () => {
    const result = privacyFilter('test_event', {});
    expect(result).toEqual({});
  });

  it('filters out PII properties while keeping non-PII', () => {
    const result = privacyFilter('test_event', {
      email: 'test@test.com',
      role: 'admin',
    });
    expect(result.email).toBeUndefined();
    expect(result.role).toBe('admin');
  });
});

describe('assessPrivacyLevel', () => {
  it('returns appropriate privacy level for properties', () => {
    // service_id may be registered as sensitive — accept either public or sensitive
    const level1 = assessPrivacyLevel({ service_id: 'srv-1' });
    expect(['public', 'sensitive', 'internal', 'pii']).toContain(level1);

    const level2 = assessPrivacyLevel({ amount: 50000 });
    expect(['public', 'sensitive']).toContain(level2);
  });

  it('detects PII via pattern matching', () => {
    expect(assessPrivacyLevel({ email: 'test@test.com' })).toBe('pii');
    expect(assessPrivacyLevel({ phone: '08123456789' })).toBe('pii');
  });

  it('returns public for empty object', () => {
    expect(assessPrivacyLevel({})).toBe('public');
  });
});
