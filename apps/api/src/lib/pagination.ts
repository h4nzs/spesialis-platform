import type { PaginationMeta } from '@specialist/types';

/**
 * Build a PaginationMeta object from page, limit, and total count.
 *
 * Replaces inline pagination calculation repeated across all list endpoints.
 *
 * @example
 * ```ts
 * const pagination = buildPaginationMeta(page, limit, total);
 * return successPaginated(c, items, pagination);
 * ```
 */
export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
