import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import type { Context } from 'hono';

const testSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().min(0),
});

function mockC(body: unknown): Context {
  return {
    req: { json: vi.fn().mockResolvedValue(body) },
    json: vi.fn().mockReturnValue({ status: 422 } as unknown as Response),
  } as unknown as Context;
}

describe('parseBody', () => {
  it('returns ok: true with parsed data when validation succeeds', async () => {
    const c = mockC({ name: 'Alice', age: 30 });
    const { parseBody } = await import('./parse-body.ts');

    const result = await parseBody(c, testSchema);

    expect(result).toEqual({
      ok: true,
      data: { name: 'Alice', age: 30 },
    });
  });

  it('returns ok: false with validationError response when body is invalid', async () => {
    const c = mockC({ name: '', age: -1 });
    const { parseBody } = await import('./parse-body.ts');

    const result = await parseBody(c, testSchema);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response).toBeDefined();
    }
  });

  it('reports field-level errors with correct paths and messages', async () => {
    const c = mockC({ name: '', age: -1 });
    const { parseBody } = await import('./parse-body.ts');

    const result = await parseBody(c, testSchema);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      // c.json should have been called with validation error format
      expect(c.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          errors: expect.arrayContaining([
            expect.objectContaining({ field: 'name' }),
            expect.objectContaining({ field: 'age' }),
          ]),
        }),
        422,
      );
    }
  });

  it('returns ok: true with partial data for optional fields', async () => {
    const partialSchema = z.object({
      name: z.string().min(1),
      age: z.number().int().min(0).optional(),
    });
    const c = mockC({ name: 'Bob' });
    const { parseBody } = await import('./parse-body.ts');

    const result = await parseBody(c, partialSchema);

    expect(result).toEqual({
      ok: true,
      data: { name: 'Bob' },
    });
  });

  it('handles nested object schemas', async () => {
    const nestedSchema = z.object({
      user: z.object({
        email: z.string().email(),
        profile: z.object({
          displayName: z.string().min(1),
        }),
      }),
    });
    const c = mockC({
      user: { email: 'test@example.com', profile: { displayName: 'Test' } },
    });
    const { parseBody } = await import('./parse-body.ts');

    const result = await parseBody(c, nestedSchema);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.user.email).toBe('test@example.com');
    }
  });

  it('reports nested field errors with dot-path notation', async () => {
    const nestedSchema = z.object({
      user: z.object({
        email: z.string().email(),
        profile: z.object({
          displayName: z.string().min(1),
        }),
      }),
    });
    const c = mockC({ user: { email: 'not-an-email', profile: { displayName: '' } } });
    const { parseBody } = await import('./parse-body.ts');

    const result = await parseBody(c, nestedSchema);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(c.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({ field: 'user.email' }),
            expect.objectContaining({ field: 'user.profile.displayName' }),
          ]),
        }),
        422,
      );
    }
  });

  it('handles boolean and number literals via transform schemas', async () => {
    const transformSchema = z.object({
      active: z.coerce.boolean(),
      count: z.coerce.number().int(),
    });
    const c = mockC({ active: 'true', count: '5' });
    const { parseBody } = await import('./parse-body.ts');

    const result = await parseBody(c, transformSchema);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.active).toBe(true);
      expect(result.data.count).toBe(5);
    }
  });
});
