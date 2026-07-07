import { describe, it, expect } from 'vitest';
import { markNotificationReadSchema } from './notification.ts';

const UUID = '550e8400-e29b-41d4-a716-446655440000';

describe('markNotificationReadSchema', () => {
  it('accepts valid notification IDs', () => {
    const result = markNotificationReadSchema.safeParse({
      notificationIds: [UUID],
    });
    expect(result.success).toBe(true);
  });

  it('accepts multiple notification IDs', () => {
    const result = markNotificationReadSchema.safeParse({
      notificationIds: [
        UUID,
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
      ],
    });
    expect(result.success).toBe(true);
  });

  it('accepts up to 100 notification IDs', () => {
    const ids = Array.from(
      { length: 100 },
      (_, i) => `550e8400-e29b-41d4-a716-${String(i).padStart(12, '0')}`,
    );
    const result = markNotificationReadSchema.safeParse({ notificationIds: ids });
    expect(result.success).toBe(true);
  });

  it('rejects empty array', () => {
    const result = markNotificationReadSchema.safeParse({ notificationIds: [] });
    expect(result.success).toBe(false);
  });

  it('rejects more than 100 notification IDs', () => {
    const ids = Array.from(
      { length: 101 },
      (_, i) => `550e8400-e29b-41d4-a716-${String(i).padStart(12, '0')}`,
    );
    const result = markNotificationReadSchema.safeParse({ notificationIds: ids });
    expect(result.success).toBe(false);
  });

  it('rejects invalid UUID in array', () => {
    const result = markNotificationReadSchema.safeParse({
      notificationIds: [UUID, 'not-a-uuid'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing notificationIds field', () => {
    const result = markNotificationReadSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects non-array input', () => {
    const result = markNotificationReadSchema.safeParse({ notificationIds: 'not-array' });
    expect(result.success).toBe(false);
  });
});
