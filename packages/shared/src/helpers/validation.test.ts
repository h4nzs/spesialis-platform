import { describe, it, expect } from 'vitest';
import {
  isValidUUID,
  isValidEmail,
  isValidIndonesianPhone,
  isValidFileSize,
  isValidFileType,
  slugify,
  truncate,
  mapZodIssues,
} from './validation.ts';

describe('isValidUUID', () => {
  it('accepts valid UUID', () => {
    expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
  });

  it('rejects invalid string', () => {
    expect(isValidUUID('not-uuid')).toBe(false);
  });
});

describe('isValidEmail', () => {
  it('accepts valid email', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('rejects email without @', () => {
    expect(isValidEmail('userexample.com')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });
});

describe('isValidIndonesianPhone', () => {
  it('accepts 08xx format', () => {
    expect(isValidIndonesianPhone('08123456789')).toBe(true);
  });

  it('accepts 628xx format', () => {
    expect(isValidIndonesianPhone('628123456789')).toBe(true);
  });

  it('rejects too short number', () => {
    expect(isValidIndonesianPhone('0812')).toBe(false);
  });

  it('rejects non-Indonesian prefix', () => {
    expect(isValidIndonesianPhone('123456789')).toBe(false);
  });
});

describe('isValidFileSize', () => {
  it('accepts file within limit', () => {
    expect(isValidFileSize(1024, 10)).toBe(true);
  });

  it('rejects file exceeding limit', () => {
    expect(isValidFileSize(11 * 1024 * 1024, 10)).toBe(false);
  });
});

describe('isValidFileType', () => {
  it('accepts allowed type', () => {
    expect(isValidFileType('image/jpeg', ['image/jpeg', 'image/png'])).toBe(true);
  });

  it('rejects disallowed type', () => {
    expect(isValidFileType('image/gif', ['image/jpeg', 'image/png'])).toBe(false);
  });
});

describe('slugify', () => {
  it('converts to lowercase slug', () => {
    expect(slugify('Cuci AC Standar')).toBe('cuci-ac-standar');
  });

  it('removes special characters', () => {
    expect(slugify('Perbaikan AC @ Rumah!')).toBe('perbaikan-ac-rumah');
  });
});

describe('truncate', () => {
  it('returns string if within limit', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });

  it('truncates with suffix', () => {
    expect(truncate('Hello World', 8)).toBe('Hello...');
  });
});

describe('mapZodIssues', () => {
  it('maps zod issues to validation errors', () => {
    const issues = [
      { path: ['email'], message: 'Invalid email' },
      { path: ['password'], message: 'Too short' },
    ];
    const result = mapZodIssues(issues);
    expect(result).toEqual([
      { field: 'email', message: 'Invalid email' },
      { field: 'password', message: 'Too short' },
    ]);
  });
});
