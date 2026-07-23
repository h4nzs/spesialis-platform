import type { ApiError as ApiErrorResponse, ValidationError } from '@ahlipanggilan/types';

/**
 * Error yang dilempar oleh ApiClient saat request gagal.
 * Field `code`, `status`, `errors`, dan `response` sudah terparsing dari response API.
 * `response` berisi full JSON body dari respons error — berguna untuk
 * mengakses field kustom seperti `lockedByEmail` dari lock 409 conflict.
 */
export class ApiClientError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly errors: ValidationError[] | undefined;
  /** Raw JSON response body from the API error response */
  public readonly response: Record<string, unknown>;

  constructor(response: ApiErrorResponse, status: number) {
    super(response.message);
    this.name = 'ApiClientError';
    this.code = response.code;
    this.status = status;
    this.errors = response.errors;
    this.response = response as unknown as Record<string, unknown>;
  }
}

/**
 * Error untuk network failure (server down, timeout, dll).
 */
export class NetworkError extends Error {
  public readonly cause: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'NetworkError';
    this.cause = cause;
  }
}

/**
 * Error saat refresh token gagal (user harus login ulang).
 */
export class SessionExpiredError extends Error {
  constructor(message = 'Sesi telah berakhir. Silakan login kembali.') {
    super(message);
    this.name = 'SessionExpiredError';
  }
}

/**
 * Error untuk request yang dibatalkan (AbortController).
 */
export class RequestAbortedError extends Error {
  constructor(message = 'Request dibatalkan') {
    super(message);
    this.name = 'RequestAbortedError';
  }
}
