import { z } from 'zod/v4';

export const RESOURCE_TYPES = ['article', 'cms_page', 'faq'] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

/**
 * Acquire a lock on a resource.
 */
export const acquireLockSchema = z.object({
  resourceType: z.enum(RESOURCE_TYPES),
  resourceId: z.string().uuid(),
});

export type AcquireLockInput = z.infer<typeof acquireLockSchema>;

/**
 * Release a lock (manual: save/cancel).
 */
export const releaseLockSchema = z.object({
  resourceType: z.enum(RESOURCE_TYPES),
  resourceId: z.string().uuid(),
});

export type ReleaseLockInput = z.infer<typeof releaseLockSchema>;

/**
 * Heartbeat — extend the lock timeout.
 */
export const heartbeatLockSchema = z.object({
  resourceType: z.enum(RESOURCE_TYPES),
  resourceId: z.string().uuid(),
});

export type HeartbeatLockInput = z.infer<typeof heartbeatLockSchema>;
