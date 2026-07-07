import { describe, it, expect } from 'vitest';
import { omitUndefined } from './update.ts';

describe('omitUndefined', () => {
  it('drops undefined values', () => {
    const result = omitUndefined({ name: 'Foo', slug: undefined, description: 'Bar' });
    expect(result).toEqual({ name: 'Foo', description: 'Bar' });
  });

  it('preserves null values', () => {
    const result = omitUndefined({ website: null, name: 'Foo' });
    expect(result).toEqual({ website: null, name: 'Foo' });
  });

  it('preserves falsy values (0, false, empty string)', () => {
    const result = omitUndefined({ count: 0, isActive: false, note: '' });
    expect(result).toEqual({ count: 0, isActive: false, note: '' });
  });

  it('returns empty object when all values are undefined', () => {
    const result = omitUndefined({ a: undefined, b: undefined });
    expect(result).toEqual({});
  });

  it('returns empty object for empty input', () => {
    const result = omitUndefined({});
    expect(result).toEqual({});
  });

  it('works with numeric keys', () => {
    const result = omitUndefined({ 0: 'zero', 1: undefined, 2: 'two' } as Record<string, unknown>);
    expect(result).toEqual({ 0: 'zero', 2: 'two' });
  });

  it('preserves the original object (immutable)', () => {
    const input = { name: 'Foo', slug: undefined, description: 'Bar' };
    const result = omitUndefined(input);
    expect(result).not.toBe(input);
    expect(input).toEqual({ name: 'Foo', slug: undefined, description: 'Bar' });
  });

  it('handles mixed types (string, number, boolean, null)', () => {
    const result = omitUndefined({
      name: 'Test',
      age: 30,
      isVerified: true,
      avatar: null,
      deletedAt: undefined,
    });
    expect(result).toEqual({
      name: 'Test',
      age: 30,
      isVerified: true,
      avatar: null,
    });
  });
});
