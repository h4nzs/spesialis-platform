import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';

vi.mock('../lib/response.ts', () => ({
  validationError: vi.fn().mockReturnValue('validation-error-response'),
}));

import { validationError } from '../lib/response.ts';
import type { ValidationError } from '@specialist/types';

function mockC(): any {
  const state: Record<string, unknown> = {};
  return {
    req: {
      json: vi.fn(),
      query: vi.fn(),
    },
    get: vi.fn((k: string) => state[k]),
    set: vi.fn((k: string, v: unknown) => {
      state[k] = v;
    }),
    status: vi.fn(),
    json: vi.fn(),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ───── validateBody ─────

describe('validateBody', () => {
  const nameSchema = z.object({
    name: z.string().min(1).max(100),
    age: z.coerce.number().int().min(0).optional(),
  });

  it('passes valid body and sets validated', async () => {
    const c = mockC();
    c.req.json.mockResolvedValue({ name: 'John', age: 25 });
    const next = vi.fn();

    const { validateBody } = await import('./validation.ts');
    await validateBody(nameSchema)(c, next);

    expect(c.set).toHaveBeenCalledWith('validated', { name: 'John', age: 25 });
    expect(next).toHaveBeenCalled();
    expect(validationError).not.toHaveBeenCalled();
  });

  it('passes valid body with optional fields omitted', async () => {
    const c = mockC();
    c.req.json.mockResolvedValue({ name: 'John' });
    const next = vi.fn();

    const { validateBody } = await import('./validation.ts');
    await validateBody(nameSchema)(c, next);

    expect(c.set).toHaveBeenCalledWith('validated', { name: 'John' });
    expect(next).toHaveBeenCalled();
  });

  it('coerces string values to number', async () => {
    const c = mockC();
    c.req.json.mockResolvedValue({ name: 'John', age: '25' });
    const next = vi.fn();

    const { validateBody } = await import('./validation.ts');
    await validateBody(nameSchema)(c, next);

    expect(c.set).toHaveBeenCalledWith('validated', { name: 'John', age: 25 });
    expect(next).toHaveBeenCalled();
  });

  it('returns 422 for empty body (missing required field)', async () => {
    const c = mockC();
    c.req.json.mockResolvedValue({});
    const next = vi.fn();

    const { validateBody } = await import('./validation.ts');
    await validateBody(nameSchema)(c, next);

    expect(validationError).toHaveBeenCalledTimes(1);
    const callArgs = vi.mocked(validationError).mock.calls[0]!;
    expect(callArgs[0]).toBe(c);
    const errors = callArgs[1] as ValidationError[];
    expect(errors.some((e) => e.field === 'name')).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 422 for empty string in required field', async () => {
    const c = mockC();
    c.req.json.mockResolvedValue({ name: '' });
    const next = vi.fn();

    const { validateBody } = await import('./validation.ts');
    await validateBody(nameSchema)(c, next);

    expect(validationError).toHaveBeenCalled();
    const errors = vi.mocked(validationError).mock.calls[0]![1] as ValidationError[];
    expect(errors.some((e) => e.field === 'name')).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 422 for field exceeding max length', async () => {
    const c = mockC();
    c.req.json.mockResolvedValue({ name: 'x'.repeat(101) });
    const next = vi.fn();

    const { validateBody } = await import('./validation.ts');
    await validateBody(nameSchema)(c, next);

    expect(validationError).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 422 for invalid JSON body', async () => {
    const c = mockC();
    c.req.json.mockRejectedValue(new SyntaxError('Unexpected token'));
    const next = vi.fn();

    const { validateBody } = await import('./validation.ts');
    await validateBody(nameSchema)(c, next);

    expect(validationError).toHaveBeenCalledWith(c, [
      { field: 'body', message: 'Invalid JSON body' },
    ]);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 422 for wrong type (number instead of string)', async () => {
    const c = mockC();
    c.req.json.mockResolvedValue({ name: 123 });
    const next = vi.fn();

    const { validateBody } = await import('./validation.ts');
    await validateBody(nameSchema)(c, next);

    expect(validationError).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('formats nested field errors with dot notation', async () => {
    const nestedSchema = z.object({
      user: z.object({
        email: z.string().email(),
      }),
    });
    const c = mockC();
    c.req.json.mockResolvedValue({ user: { email: 'not-an-email' } });
    const next = vi.fn();

    const { validateBody } = await import('./validation.ts');
    await validateBody(nestedSchema)(c, next);

    expect(validationError).toHaveBeenCalled();
    const errors = vi.mocked(validationError).mock.calls[0]![1] as ValidationError[];
    expect(errors.some((e) => e.field === 'user.email')).toBe(true);
  });

  it('applies default values from schema', async () => {
    const schemaWithDefault = z.object({
      role: z.enum(['admin', 'user']).default('user'),
      name: z.string().min(1),
    });
    const c = mockC();
    c.req.json.mockResolvedValue({ name: 'John' });
    const next = vi.fn();

    const { validateBody } = await import('./validation.ts');
    await validateBody(schemaWithDefault)(c, next);

    expect(c.set).toHaveBeenCalledWith('validated', { name: 'John', role: 'user' });
    expect(next).toHaveBeenCalled();
  });

  it('rejects enum with invalid value', async () => {
    const enumSchema = z.object({
      status: z.enum(['active', 'inactive']),
    });
    const c = mockC();
    c.req.json.mockResolvedValue({ status: 'banned' });
    const next = vi.fn();

    const { validateBody } = await import('./validation.ts');
    await validateBody(enumSchema)(c, next);

    expect(validationError).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects UUID with invalid format', async () => {
    const uuidSchema = z.object({
      id: z.string().uuid(),
    });
    const c = mockC();
    c.req.json.mockResolvedValue({ id: 'not-a-uuid' });
    const next = vi.fn();

    const { validateBody } = await import('./validation.ts');
    await validateBody(uuidSchema)(c, next);

    expect(validationError).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('accepts valid UUID', async () => {
    const uuidSchema = z.object({
      id: z.string().uuid(),
    });
    const c = mockC();
    c.req.json.mockResolvedValue({ id: '550e8400-e29b-41d4-a716-446655440000' });
    const next = vi.fn();

    const { validateBody } = await import('./validation.ts');
    await validateBody(uuidSchema)(c, next);

    expect(c.set).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});

// ───── validateQuery ─────

describe('validateQuery', () => {
  const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    status: z.string().optional(),
  });

  it('passes valid query params and sets validated', async () => {
    const c = mockC();
    c.req.query.mockReturnValue({ page: '2', limit: '20', status: 'active' });
    const next = vi.fn();

    const { validateQuery } = await import('./validation.ts');
    await validateQuery(paginationSchema)(c, next);

    expect(c.set).toHaveBeenCalledWith('validated', {
      page: 2,
      limit: 20,
      status: 'active',
    });
    expect(next).toHaveBeenCalled();
  });

  it('applies default values for missing query params', async () => {
    const c = mockC();
    c.req.query.mockReturnValue({});
    const next = vi.fn();

    const { validateQuery } = await import('./validation.ts');
    await validateQuery(paginationSchema)(c, next);

    expect(c.set).toHaveBeenCalledWith('validated', { page: 1, limit: 10 });
    expect(next).toHaveBeenCalled();
  });

  it('coerces string query values to numbers', async () => {
    const c = mockC();
    c.req.query.mockReturnValue({ page: '3', limit: '50' });
    const next = vi.fn();

    const { validateQuery } = await import('./validation.ts');
    await validateQuery(paginationSchema)(c, next);

    expect(c.set).toHaveBeenCalledWith('validated', { page: 3, limit: 50 });
    expect(next).toHaveBeenCalled();
  });

  it('returns 422 for invalid numeric value (string instead of number)', async () => {
    const c = mockC();
    c.req.query.mockReturnValue({ page: 'abc', limit: '10' });
    const next = vi.fn();

    const { validateQuery } = await import('./validation.ts');
    await validateQuery(paginationSchema)(c, next);

    expect(validationError).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 422 for value exceeding max', async () => {
    const c = mockC();
    c.req.query.mockReturnValue({ page: '1', limit: '200' });
    const next = vi.fn();

    const { validateQuery } = await import('./validation.ts');
    await validateQuery(paginationSchema)(c, next);

    expect(validationError).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 422 for value below min', async () => {
    const c = mockC();
    c.req.query.mockReturnValue({ page: '0', limit: '10' });
    const next = vi.fn();

    const { validateQuery } = await import('./validation.ts');
    await validateQuery(paginationSchema)(c, next);

    expect(validationError).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 422 for invalid enum value in query', async () => {
    const statusSchema = z.object({
      status: z.enum(['active', 'inactive']),
    });
    const c = mockC();
    c.req.query.mockReturnValue({ status: 'banned' });
    const next = vi.fn();

    const { validateQuery } = await import('./validation.ts');
    await validateQuery(statusSchema)(c, next);

    expect(validationError).toHaveBeenCalled();
    const errors = vi.mocked(validationError).mock.calls[0]![1] as ValidationError[];
    expect(errors.some((e) => e.field === 'status')).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });

  it('passes with optional params omitted', async () => {
    const optionalSchema = z.object({
      q: z.string().optional(),
      category: z.string().optional(),
    });
    const c = mockC();
    c.req.query.mockReturnValue({});
    const next = vi.fn();

    const { validateQuery } = await import('./validation.ts');
    await validateQuery(optionalSchema)(c, next);

    expect(c.set).toHaveBeenCalledWith('validated', {});
    expect(next).toHaveBeenCalled();
  });

  it('handles query with additional unvalidated fields', async () => {
    const c = mockC();
    c.req.query.mockReturnValue({ page: '1', limit: '10', extra: 'ignored' });
    const next = vi.fn();

    const { validateQuery } = await import('./validation.ts');
    await validateQuery(paginationSchema)(c, next);

    // Zod by default strips unknown fields
    expect(c.set).toHaveBeenCalledWith('validated', { page: 1, limit: 10 });
    expect(next).toHaveBeenCalled();
  });
});
