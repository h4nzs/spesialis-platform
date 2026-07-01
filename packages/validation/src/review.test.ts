import { describe, it, expect } from 'vitest';
import { createReviewSchema } from './review.ts';

describe('createReviewSchema', () => {
  it('accepts valid review', () => {
    const result = createReviewSchema.safeParse({
      orderId: '550e8400-e29b-41d4-a716-446655440000',
      rating: 5,
    });
    expect(result.success).toBe(true);
  });

  it('accepts review with optional text', () => {
    const result = createReviewSchema.safeParse({
      orderId: '550e8400-e29b-41d4-a716-446655440000',
      rating: 4.5,
      review: 'Pelayanan sangat baik',
    });
    expect(result.success).toBe(true);
  });

  it('accepts minimum rating of 1', () => {
    const result = createReviewSchema.safeParse({
      orderId: '550e8400-e29b-41d4-a716-446655440000',
      rating: 1,
    });
    expect(result.success).toBe(true);
  });

  it('rejects rating below 1', () => {
    const result = createReviewSchema.safeParse({
      orderId: '550e8400-e29b-41d4-a716-446655440000',
      rating: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects rating above 5', () => {
    const result = createReviewSchema.safeParse({
      orderId: '550e8400-e29b-41d4-a716-446655440000',
      rating: 5.5,
    });
    expect(result.success).toBe(false);
  });

  it('rejects rating not multiple of 0.5', () => {
    const result = createReviewSchema.safeParse({
      orderId: '550e8400-e29b-41d4-a716-446655440000',
      rating: 4.3,
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing orderId', () => {
    const result = createReviewSchema.safeParse({ rating: 5 });
    expect(result.success).toBe(false);
  });

  it('rejects invalid orderId format', () => {
    const result = createReviewSchema.safeParse({
      orderId: 'not-a-uuid',
      rating: 5,
    });
    expect(result.success).toBe(false);
  });

  it('rejects review exceeding 2000 chars', () => {
    const result = createReviewSchema.safeParse({
      orderId: '550e8400-e29b-41d4-a716-446655440000',
      rating: 5,
      review: 'a'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});
