import type { Context, NotFoundHandler } from 'hono';
import { eq, and, or, sql } from 'drizzle-orm';
import { db, redirects, pageErrors } from '../lib/db.ts';

/**
 * 404 handler that:
 * 1. Checks if the requested path has a redirect configured
 * 2. Logs the 404 to the page_errors table for monitoring
 *
 * If a matching active redirect is found, it redirects the client and
 * increments the hit count. Otherwise, it returns a standard 404 response.
 */
export const redirectCheck: NotFoundHandler = async (c: Context) => {
  const path = c.req.path;

  // Skip API routes — let them handle their own 404s
  if (path.startsWith('/api/')) {
    return c.json({ success: false, code: 'NOT_FOUND', message: 'Endpoint tidak ditemukan' }, 404);
  }

  try {
    const [redirect] = await db
      .select()
      .from(redirects)
      .where(and(eq(redirects.sourcePath, path), eq(redirects.isActive, true)))
      .limit(1);

    if (redirect) {
      // Increment hit count asynchronously (don't wait for it)
      db.update(redirects)
        .set({ hitCount: sql`hit_count + 1`, updatedAt: new Date() })
        .where(eq(redirects.id, redirect.id))
        .then()
        .catch(() => {
          // Silently fail — the redirect still works
        });

      const statusCode = redirect.statusCode === 302 ? 302 : 301;
      return c.redirect(redirect.targetPath, statusCode);
    }
  } catch {
    // If DB check fails, fall through to 404 logging
  }

  // ── Log 404 to page_errors table ──────────────────────────
  if (!path.startsWith('/_')) {
    // Skip internal paths like /_astro, /_image
    logPageError(path, c).catch(() => {
      // Silently fail — logging should never break the response
    });
  }

  return c.json({ success: false, code: 'NOT_FOUND', message: 'Halaman tidak ditemukan' }, 404);
};

/**
 * Log (or increment) a 404 entry in the page_errors table.
 * Uses ON CONFLICT to upsert by path.
 */
async function logPageError(path: string, c: Context): Promise<void> {
  const referer = c.req.header('referer') ?? null;
  const userAgent = c.req.header('user-agent') ?? null;

  // Upsert: if path exists, increment count and update lastSeen
  // Otherwise insert a new row
  await db
    .insert(pageErrors)
    .values({
      path,
      referer,
      userAgent,
      count: 1,
      firstSeen: new Date(),
      lastSeen: new Date(),
    })
    .onConflictDoUpdate({
      target: pageErrors.path,
      set: {
        count: sql`page_errors.count + 1`,
        lastSeen: new Date(),
        referer: sql`CASE WHEN ${referer} IS NOT NULL THEN ${referer} ELSE page_errors.referer END`,
        userAgent: sql`CASE WHEN ${userAgent} IS NOT NULL THEN ${userAgent} ELSE page_errors.user_agent END`,
      },
    });
}
