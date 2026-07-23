import { Hono } from 'hono';
import { eq, and, sql } from 'drizzle-orm';
import { db, resourceLocks, users } from '../../lib/db.ts';
import { authMiddleware, requireRole } from '../../middleware/auth.ts';
import { validateBody } from '../../middleware/validation.ts';
import {
  acquireLockSchema,
  releaseLockSchema,
  heartbeatLockSchema,
} from '@ahlipanggilan/validation';
import type {
  AcquireLockInput,
  ReleaseLockInput,
  HeartbeatLockInput,
} from '@ahlipanggilan/validation';
import { success, created, error } from '../../lib/response.ts';

const router = new Hono();

// ── Constants ───────────────────────────────────────────────────
/** Lock expires after 60 seconds without a heartbeat */
const LOCK_TIMEOUT_MS = 60_000;

// ── Helpers ─────────────────────────────────────────────────────

/** Clean up expired lock for a specific resource */
async function cleanupExpiredLock(resourceType: string, resourceId: string) {
  const cutoff = new Date(Date.now() - LOCK_TIMEOUT_MS).toISOString();
  await db
    .delete(resourceLocks)
    .where(
      and(
        eq(resourceLocks.resourceType, resourceType),
        eq(resourceLocks.resourceId, resourceId),
        sql`${resourceLocks.heartbeatAt} < ${cutoff}`,
      ),
    );
}

/** Clean up ALL expired locks (used by batch endpoint) */
async function cleanupAllExpiredLocks() {
  const cutoff = new Date(Date.now() - LOCK_TIMEOUT_MS).toISOString();
  await db.delete(resourceLocks).where(sql`${resourceLocks.heartbeatAt} < ${cutoff}`);
}

/**
 * Fetch lock holder info for a 409 response.
 * Used when acquire fails due to another user holding the lock.
 */
async function getLockHolderInfo(resourceType: string, resourceId: string) {
  const [holder] = await db
    .select({
      id: resourceLocks.id,
      lockedBy: resourceLocks.lockedBy,
      lockedAt: resourceLocks.lockedAt,
    })
    .from(resourceLocks)
    .where(
      and(eq(resourceLocks.resourceType, resourceType), eq(resourceLocks.resourceId, resourceId)),
    )
    .limit(1);

  if (!holder) return null;

  const [user] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, holder.lockedBy))
    .limit(1);

  return {
    id: holder.id,
    lockedBy: holder.lockedBy,
    lockedByEmail: user?.email ?? 'Unknown',
    lockedAt: holder.lockedAt,
  };
}

// ── Check lock status ───────────────────────────────────────────

/**
 * GET /locks/check?type=article&id=xxx
 * Returns the current lock state for a resource, or null if unlocked.
 */
router.get(
  '/check',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  async (c) => {
    const resourceType = c.req.query('type');
    const resourceId = c.req.query('id');

    if (!resourceType || !resourceId) {
      return error(c, 'VALIDATION_ERROR', 'Parameter type dan id wajib diisi', 400);
    }

    // Clean up expired locks first
    await cleanupExpiredLock(resourceType, resourceId);

    // Fetch current lock with user info
    const [lock] = await db
      .select({
        lockedBy: resourceLocks.lockedBy,
        lockedAt: resourceLocks.lockedAt,
        heartbeatAt: resourceLocks.heartbeatAt,
        lockedByEmail: users.email,
      })
      .from(resourceLocks)
      .innerJoin(users, eq(resourceLocks.lockedBy, users.id))
      .where(
        and(eq(resourceLocks.resourceType, resourceType), eq(resourceLocks.resourceId, resourceId)),
      )
      .limit(1);

    if (!lock) {
      return success(c, { locked: false });
    }

    const currentUserId = c.get('userId') as string;

    return success(c, {
      locked: true,
      lockedBy: lock.lockedBy,
      lockedByEmail: lock.lockedByEmail,
      lockedByMe: lock.lockedBy === currentUserId,
      lockedAt: lock.lockedAt.toISOString(),
      heartbeatAt: lock.heartbeatAt.toISOString(),
    });
  },
);

// ── Batch check locks ───────────────────────────────────────────

/**
 * GET /locks/batch?type=article&ids=id1,id2,id3
 * Returns lock status for multiple resources at once.
 * IDs dipisahkan koma agar kompatibel dengan API client yang tidak support array params.
 * Used by the list page to show lock indicators per row.
 */
router.get(
  '/batch',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  async (c) => {
    const resourceType = c.req.query('type');
    const idsRaw = c.req.query('ids');

    if (!resourceType || !idsRaw) {
      return error(c, 'VALIDATION_ERROR', 'Parameter type dan ids wajib diisi', 400);
    }

    const idsParam = idsRaw.split(',').filter(Boolean);
    if (idsParam.length === 0) {
      return error(c, 'VALIDATION_ERROR', 'Parameter ids tidak boleh kosong', 400);
    }

    // Clean up all expired locks first (no need to do per-resource)
    await cleanupAllExpiredLocks();

    // Fetch all matching locks with user info
    const locks = await db
      .select({
        resourceId: resourceLocks.resourceId,
        lockedBy: resourceLocks.lockedBy,
        lockedAt: resourceLocks.lockedAt,
        lockedByEmail: users.email,
      })
      .from(resourceLocks)
      .innerJoin(users, eq(resourceLocks.lockedBy, users.id))
      .where(
        and(
          eq(resourceLocks.resourceType, resourceType),
          sql`${resourceLocks.resourceId} = ANY(ARRAY[${sql.join(
            idsParam.map((id) => sql`${id}::uuid`),
            sql`, `,
          )}])`,
        ),
      );

    const currentUserId = c.get('userId') as string;

    // Build a map: resourceId → lock info
    const lockMap: Record<
      string,
      {
        locked: boolean;
        lockedBy: string;
        lockedByEmail: string;
        lockedByMe: boolean;
        lockedAt: string;
      }
    > = {};
    for (const lock of locks) {
      lockMap[lock.resourceId] = {
        locked: true,
        lockedBy: lock.lockedBy,
        lockedByEmail: lock.lockedByEmail,
        lockedByMe: lock.lockedBy === currentUserId,
        lockedAt: lock.lockedAt.toISOString(),
      };
    }

    return success(c, { locks: lockMap });
  },
);

// ── Acquire lock ────────────────────────────────────────────────

/**
 * POST /locks/acquire
 * Attempt to acquire a lock on a resource.
 *
 * Race-condition-safe: menggunakan INSERT + ON CONFLICT DO NOTHING.
 * Jika dua user acquire bersamaan, database menjamin hanya satu yang lolos
 * berkat unique constraint pada (resource_type, resource_id).
 *
 * Flow:
 * 1. Cleanup expired lock (kalau ada)
 * 2. INSERT dengan onConflictDoNothing — atomic, tidak ada TOCTOU gap
 * 3. Jika insert berhasil → lock acquired 🎉
 * 4. Jika gagal (conflict) → cari pemegang lock:
 *    a. Kalau diri sendiri → refresh heartbeat
 *    b. Kalau user lain → return 409 dengan info pemegang lock
 */
router.post(
  '/acquire',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  validateBody(acquireLockSchema),
  async (c) => {
    const data = c.get('validated') as AcquireLockInput;
    const userId = c.get('userId') as string;

    // ── Step 1: Cleanup expired lock ───────────────────────────
    await cleanupExpiredLock(data.resourceType, data.resourceId);

    // ── Step 2: Atomic INSERT with conflict handling ───────────
    // If another user inserted between our cleanup and here,
    // onConflictDoNothing prevents a 500 error — we just get no rows back.
    const [inserted] = await db
      .insert(resourceLocks)
      .values({
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        lockedBy: userId,
      })
      .onConflictDoNothing()
      .returning();

    if (inserted) {
      // ── Step 3: We got the lock! ──────────────────────────────
      return created(c, { acquired: true, lockId: inserted.id }, 'Sumber daya berhasil dikunci');
    }

    // ── Step 4: Conflict — someone beat us to it ──────────────
    const holder = await getLockHolderInfo(data.resourceType, data.resourceId);

    if (!holder) {
      // Shouldn't happen (conflict means a row exists), but be defensive
      return error(c, 'SERVER_ERROR', 'Gagal mengunci sumber daya', 500);
    }

    if (holder.lockedBy === userId) {
      // It's our own lock — refresh heartbeat
      const [refreshed] = await db
        .update(resourceLocks)
        .set({ heartbeatAt: new Date() })
        .where(eq(resourceLocks.id, holder.id))
        .returning();

      return success(c, {
        acquired: true,
        lockId: refreshed?.id ?? holder.id,
      });
    }

    // Someone else holds the lock
    return c.json(
      {
        success: false,
        code: 'RESOURCE_LOCKED',
        message: 'Sumber daya sedang diedit oleh pengguna lain',
        lockedBy: holder.lockedBy,
        lockedByEmail: holder.lockedByEmail,
        lockedAt: holder.lockedAt.toISOString(),
      },
      409,
    );
  },
);

// ── Takeover lock ───────────────────────────────────────────────

/**
 * POST /locks/takeover
 * Force-acquire a lock even if another user holds it.
 * Previous holder's lock is released.
 */
router.post(
  '/takeover',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  validateBody(acquireLockSchema),
  async (c) => {
    const data = c.get('validated') as AcquireLockInput;
    const userId = c.get('userId') as string;

    // Delete any existing lock for this resource
    await db
      .delete(resourceLocks)
      .where(
        and(
          eq(resourceLocks.resourceType, data.resourceType),
          eq(resourceLocks.resourceId, data.resourceId),
        ),
      );

    // Create new lock
    const [lock] = await db
      .insert(resourceLocks)
      .values({
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        lockedBy: userId,
      })
      .returning();

    if (!lock) {
      return error(c, 'SERVER_ERROR', 'Gagal mengambil alih kunci', 500);
    }

    return success(c, { acquired: true, lockId: lock.id }, 'Kunci berhasil diambil alih');
  },
);

// ── Release lock ────────────────────────────────────────────────

/**
 * POST /locks/release
 * Release a lock (manual: save success or cancel).
 */
router.post(
  '/release',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  validateBody(releaseLockSchema),
  async (c) => {
    const data = c.get('validated') as ReleaseLockInput;
    const userId = c.get('userId') as string;

    // Only delete the lock if it belongs to the current user
    // (or if expired — cleanupExpiredLock was already called on acquire)
    const [deleted] = await db
      .delete(resourceLocks)
      .where(
        and(
          eq(resourceLocks.resourceType, data.resourceType),
          eq(resourceLocks.resourceId, data.resourceId),
          eq(resourceLocks.lockedBy, userId),
        ),
      )
      .returning({ id: resourceLocks.id });

    if (!deleted) {
      // Lock might already be gone (expired or taken over) — still return success
      return success(c, { released: true });
    }

    return success(c, { released: true }, 'Kunci berhasil dilepaskan');
  },
);

// ── Heartbeat ───────────────────────────────────────────────────

/**
 * POST /locks/heartbeat
 * Extend the lock timeout. Called every 30s from the frontend.
 */
router.post(
  '/heartbeat',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  validateBody(heartbeatLockSchema),
  async (c) => {
    const data = c.get('validated') as HeartbeatLockInput;
    const userId = c.get('userId') as string;

    // Clean up expired locks
    await cleanupExpiredLock(data.resourceType, data.resourceId);

    const [updated] = await db
      .update(resourceLocks)
      .set({ heartbeatAt: new Date() })
      .where(
        and(
          eq(resourceLocks.resourceType, data.resourceType),
          eq(resourceLocks.resourceId, data.resourceId),
          eq(resourceLocks.lockedBy, userId),
        ),
      )
      .returning({ id: resourceLocks.id, heartbeatAt: resourceLocks.heartbeatAt });

    if (!updated) {
      // Lock not found or taken over by another user
      return error(c, 'LOCK_LOST', 'Kunci telah hilang atau diambil alih pengguna lain', 409);
    }

    return success(c, {
      heartbeatAt: updated.heartbeatAt.toISOString(),
    });
  },
);

export { router as adminLocksRouter };
