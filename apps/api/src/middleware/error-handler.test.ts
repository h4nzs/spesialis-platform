import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HTTPException } from 'hono/http-exception';

vi.mock('../lib/response.ts', () => ({
  serverError: vi.fn().mockReturnValue('server-error-response'),
}));

import { serverError } from '../lib/response.ts';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('errorHandler', () => {
  it('handles HTTPException with status code', async () => {
    const mockJson = vi.fn();
    const c = { json: mockJson, get: vi.fn(), req: { method: 'GET', path: '/test' } } as any;
    const err = new HTTPException(404, {
      message: 'Not Found',
      res: new Response('', { status: 404 }),
    });

    const mod = await import('./error-handler.ts');
    await mod.errorHandler(err, c);

    expect(mockJson).toHaveBeenCalledWith(
      { success: false, code: '404', message: 'Not Found', errors: undefined },
      404,
    );
  });

  it('handles generic Error with 500', async () => {
    const mockError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const c = {
      get: vi.fn().mockReturnValue('uid'),
      req: { method: 'POST', path: '/test' },
      json: vi.fn(),
    } as any;
    const err = new Error('Something broke');

    const mod = await import('./error-handler.ts');
    await mod.errorHandler(err, c);

    expect(console.error).toHaveBeenCalled();
    expect(serverError).toHaveBeenCalledWith(c);
    mockError.mockRestore();
  });

  it('handles HTTPException without res', async () => {
    const mockJson = vi.fn();
    const c = { json: mockJson, get: vi.fn(), req: { method: 'GET', path: '/test' } } as any;
    const err = new HTTPException(400, { message: 'Bad request' });

    const mod = await import('./error-handler.ts');
    await mod.errorHandler(err, c);

    expect(mockJson).toHaveBeenCalledWith(
      { success: false, code: 'HTTP_ERROR', message: 'Bad request', errors: undefined },
      400,
    );
  });
});
