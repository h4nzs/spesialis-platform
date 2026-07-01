import { describe, it, expect, vi } from 'vitest';
import type { Context } from 'hono';

function mockC(overrides?: Partial<Context>): Context {
  return { json: vi.fn(), ...overrides } as unknown as Context;
}

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

  describe('success', () => {
    it('returns 200 with data and default message', async () => {
      const mod = await import('./response.ts');
      const c = mockC();
      mod.success(c, { id: '1' });
      expect(c.json).toHaveBeenCalledWith(
        { success: true, message: 'Success', data: { id: '1' } },
        200,
      );
    });

    it('uses custom message and status', async () => {
      const mod = await import('./response.ts');
      const c = mockC();
      mod.success(c, null, 'Custom', 201);
      expect(c.json).toHaveBeenCalledWith({ success: true, message: 'Custom', data: null }, 201);
    });
  });

  describe('successPaginated', () => {
    it('returns 200 with pagination meta', async () => {
      const mod = await import('./response.ts');
      const c = mockC();
      const pagination = {
        page: 1,
        limit: 20,
        total: 100,
        totalPages: 5,
        hasNext: true,
        hasPrev: false,
      };
      mod.successPaginated(c, [{ id: '1' }], pagination);
      expect(c.json).toHaveBeenCalledWith(
        { success: true, message: 'Success', data: [{ id: '1' }], pagination },
        200,
      );
    });
  });

  describe('created', () => {
    it('returns 201 with data', async () => {
      const mod = await import('./response.ts');
      const c = mockC();
      mod.created(c, { id: 'new-id' });
      expect(c.json).toHaveBeenCalledWith(
        { success: true, message: 'Created', data: { id: 'new-id' } },
        201,
      );
    });
  });

  describe('error', () => {
    it('returns error response with code and message', async () => {
      const mod = await import('./response.ts');
      const c = mockC();
      mod.error(c, 'MY_ERROR', 'Something wrong', 400);
      expect(c.json).toHaveBeenCalledWith(
        { success: false, code: 'MY_ERROR', message: 'Something wrong', errors: undefined },
        400,
      );
    });

    it('includes validation errors when provided', async () => {
      const mod = await import('./response.ts');
      const c = mockC();
      const errors = [{ field: 'email', message: 'Invalid email' }];
      mod.error(c, 'VALIDATION', 'Failed', 422, errors);
      expect(c.json).toHaveBeenCalledWith(
        { success: false, code: 'VALIDATION', message: 'Failed', errors },
        422,
      );
    });
  });

  describe('notFound', () => {
    it('returns 404 with default message', async () => {
      const mod = await import('./response.ts');
      const c = mockC();
      mod.notFound(c);
      expect(c.json).toHaveBeenCalledWith(
        { success: false, code: 'NOT_FOUND', message: 'Resource not found', errors: undefined },
        404,
      );
    });
  });

  describe('validationError', () => {
    it('returns 422 with errors', async () => {
      const mod = await import('./response.ts');
      const c = mockC();
      const errors = [{ field: 'name', message: 'Required' }];
      mod.validationError(c, errors);
      expect(c.json).toHaveBeenCalledWith(
        { success: false, code: 'VALIDATION_ERROR', message: 'Validation failed', errors },
        422,
      );
    });
  });

  describe('unauthorized', () => {
    it('returns 401', async () => {
      const mod = await import('./response.ts');
      const c = mockC();
      mod.unauthorized(c);
      expect(c.json).toHaveBeenCalledWith(
        { success: false, code: 'UNAUTHORIZED', message: 'Unauthorized', errors: undefined },
        401,
      );
    });
  });

  describe('forbidden', () => {
    it('returns 403', async () => {
      const mod = await import('./response.ts');
      const c = mockC();
      mod.forbidden(c);
      expect(c.json).toHaveBeenCalledWith(
        { success: false, code: 'FORBIDDEN', message: 'Forbidden', errors: undefined },
        403,
      );
    });
  });

  describe('conflict', () => {
    it('returns 409 with custom message', async () => {
      const mod = await import('./response.ts');
      const c = mockC();
      mod.conflict(c, 'Already exists');
      expect(c.json).toHaveBeenCalledWith(
        { success: false, code: 'CONFLICT', message: 'Already exists', errors: undefined },
        409,
      );
    });
  });

  describe('serverError', () => {
    it('returns 500 with default message', async () => {
      const mod = await import('./response.ts');
      const c = mockC();
      mod.serverError(c);
      expect(c.json).toHaveBeenCalledWith(
        {
          success: false,
          code: 'SERVER_ERROR',
          message: 'Internal server error',
          errors: undefined,
        },
        500,
      );
    });
  });
});
