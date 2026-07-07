import { describe, it, expect } from 'vitest';
import { buildPaginationMeta } from './pagination.ts';

describe('buildPaginationMeta', () => {
  it('calculates page 1 with hasPrev=false and hasNext=true when more pages exist', () => {
    const result = buildPaginationMeta(1, 10, 25);
    expect(result).toEqual({
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNext: true,
      hasPrev: false,
    });
  });

  it('sets hasPrev=true when not on first page', () => {
    const result = buildPaginationMeta(2, 10, 25);
    expect(result.hasPrev).toBe(true);
    expect(result.hasNext).toBe(true);
  });

  it('sets hasNext=false when on last page', () => {
    const result = buildPaginationMeta(3, 10, 25);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrev).toBe(true);
  });

  it('sets both hasNext and hasPrev false when total fits in one page', () => {
    const result = buildPaginationMeta(1, 10, 5);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrev).toBe(false);
  });

  it('returns 1 totalPage when total equals limit', () => {
    const result = buildPaginationMeta(1, 10, 10);
    expect(result.totalPages).toBe(1);
    expect(result.hasNext).toBe(false);
  });

  it('returns 0 totalPages when total is 0', () => {
    const result = buildPaginationMeta(1, 10, 0);
    expect(result.totalPages).toBe(0);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrev).toBe(false);
  });

  it('handles exact division (total = limit * pages)', () => {
    const result = buildPaginationMeta(2, 20, 40);
    expect(result.totalPages).toBe(2);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrev).toBe(true);
  });

  it('handles limit of 1', () => {
    const result = buildPaginationMeta(5, 1, 10);
    expect(result.totalPages).toBe(10);
    expect(result.page).toBe(5);
    expect(result.hasNext).toBe(true);
    expect(result.hasPrev).toBe(true);
  });

  it('handles page > totalPages (edge: page exceeds available pages)', () => {
    const result = buildPaginationMeta(10, 10, 25);
    // totalPages = 3, so page 10 > 3 -> hasNext=false
    expect(result.totalPages).toBe(3);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrev).toBe(true);
  });

  it('handles large total values', () => {
    const result = buildPaginationMeta(500, 20, 10000);
    expect(result.totalPages).toBe(500);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrev).toBe(true);
  });

  it('handles page 1 with zero total', () => {
    const result = buildPaginationMeta(1, 10, 0);
    expect(result.totalPages).toBe(0);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrev).toBe(false);
  });

  it('returns correct types (all numeric fields are numbers)', () => {
    const result = buildPaginationMeta(1, 10, 100);
    expect(typeof result.page).toBe('number');
    expect(typeof result.limit).toBe('number');
    expect(typeof result.total).toBe('number');
    expect(typeof result.totalPages).toBe('number');
    expect(typeof result.hasNext).toBe('boolean');
    expect(typeof result.hasPrev).toBe('boolean');
  });
});
