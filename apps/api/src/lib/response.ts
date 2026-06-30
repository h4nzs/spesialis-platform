import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { PaginationMeta, ValidationError } from '@specialist/types';

export function success<T>(
  c: Context,
  data: T,
  message = 'Success',
  status: ContentfulStatusCode = 200,
) {
  return c.json({ success: true as const, message, data }, status);
}

export function successPaginated<T>(
  c: Context,
  data: T[],
  pagination: PaginationMeta,
  message = 'Success',
) {
  return c.json({ success: true as const, message, data, pagination }, 200);
}

export function created<T>(c: Context, data: T, message = 'Created') {
  return c.json({ success: true as const, message, data }, 201);
}

export function error(
  c: Context,
  code: string,
  message: string,
  status: ContentfulStatusCode = 400,
  errors?: ValidationError[],
) {
  return c.json({ success: false as const, code, message, errors }, status);
}

export function notFound(c: Context, message = 'Resource not found') {
  return error(c, 'NOT_FOUND', message, 404);
}

export function validationError(c: Context, errors: ValidationError[]) {
  return error(c, 'VALIDATION_ERROR', 'Validation failed', 422, errors);
}

export function unauthorized(c: Context, message = 'Unauthorized') {
  return error(c, 'UNAUTHORIZED', message, 401);
}

export function forbidden(c: Context, message = 'Forbidden') {
  return error(c, 'FORBIDDEN', message, 403);
}

export function conflict(c: Context, message: string) {
  return error(c, 'CONFLICT', message, 409);
}

export function serverError(c: Context, message = 'Internal server error') {
  return error(c, 'SERVER_ERROR', message, 500);
}
