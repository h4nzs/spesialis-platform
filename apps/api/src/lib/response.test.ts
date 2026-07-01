import { describe, it, expect } from 'vitest';

describe('response helpers', () => {
  it('exports all response functions', async () => {
    const mod = await import('./response.ts');
    expect(typeof mod.success).toBe('function');
    expect(typeof mod.error).toBe('function');
    expect(typeof mod.created).toBe('function');
    expect(typeof mod.notFound).toBe('function');
    expect(typeof mod.serverError).toBe('function');
    expect(typeof mod.unauthorized).toBe('function');
    expect(typeof mod.forbidden).toBe('function');
    expect(typeof mod.conflict).toBe('function');
    expect(typeof mod.validationError).toBe('function');
    expect(typeof mod.successPaginated).toBe('function');
  });
});
