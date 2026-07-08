import { describe, it, expect } from 'vitest';
import {
  ApiClientError,
  NetworkError,
  SessionExpiredError,
  RequestAbortedError,
} from './errors.ts';

describe('ApiClientError', () => {
  it('creates error with message, code, and status', () => {
    const error = new ApiClientError(
      { message: 'Validation failed', code: 'VALIDATION_ERROR' },
      400,
    );
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ApiClientError');
    expect(error.message).toBe('Validation failed');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.status).toBe(400);
    expect(error.errors).toBeUndefined();
  });

  it('stores validation errors when provided', () => {
    const errors = [{ field: 'email', message: 'Invalid email' }];
    const error = new ApiClientError(
      { message: 'Validation failed', code: 'VALIDATION_ERROR', errors },
      422,
    );
    expect(error.errors).toEqual(errors);
  });
});

describe('NetworkError', () => {
  it('creates error with message only', () => {
    const error = new NetworkError('Server unreachable');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('NetworkError');
    expect(error.message).toBe('Server unreachable');
    expect(error.cause).toBeUndefined();
  });

  it('stores cause when provided', () => {
    const cause = new TypeError('fetch failed');
    const error = new NetworkError('Server unreachable', cause);
    expect(error.cause).toBe(cause);
  });
});

describe('SessionExpiredError', () => {
  it('creates error with default message', () => {
    const error = new SessionExpiredError();
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('SessionExpiredError');
    expect(error.message).toBe('Sesi telah berakhir. Silakan login kembali.');
  });

  it('creates error with custom message', () => {
    const error = new SessionExpiredError('Silakan login ulang');
    expect(error.message).toBe('Silakan login ulang');
  });
});

describe('RequestAbortedError', () => {
  it('creates error with default message', () => {
    const error = new RequestAbortedError();
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('RequestAbortedError');
    expect(error.message).toBe('Request dibatalkan');
  });

  it('creates error with custom message', () => {
    const error = new RequestAbortedError('Dibatalkan pengguna');
    expect(error.message).toBe('Dibatalkan pengguna');
  });
});
