import { Hono, type Context } from 'hono';
import { eq, desc } from 'drizzle-orm';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { db, media } from '../lib/db.ts';
import { authMiddleware } from '../middleware/auth.ts';
import { buildPaginationMeta } from '../lib/pagination.ts';
import { sql } from 'drizzle-orm';
import {
  saveFile,
  deleteFile,
  isAllowedMimeType,
  isWithinSizeLimit,
  UPLOAD_DIR,
  getR2PublicUrl,
  type StorageDisk,
} from '../lib/storage.ts';
import {
  success,
  successPaginated,
  created,
  error,
  notFound,
  forbidden,
  serverError,
} from '../lib/response.ts';

const router = new Hono();

// Redirect /media/ → /media (strip trailing slash) to handle requests
// where Cloudflare or Nginx adds a trailing slash.
// Uses forwarded headers so redirect URLs use the correct protocol (HTTPS)
// when Hono is behind a reverse proxy (Nginx).
router.use('*', async (c, next) => {
  const path = c.req.path;
  if (path.endsWith('/') && path.length > 1) {
    const proto = c.req.header('x-forwarded-proto') ?? 'http';
    const host = c.req.header('x-forwarded-host') ?? c.req.header('host') ?? '';
    const url = new URL(c.req.url);
    url.protocol = proto === 'https' ? 'https:' : 'http:';
    url.host = host;
    url.pathname = path.replace(/\/+$/, '');
    return c.redirect(url.toString(), 301);
  }
  await next();
});

router.get('', authMiddleware, async (c) => {
  return handleListMedia(c);
});

async function handleListMedia(c: Context) {
  const page = Number(c.req.query('page') ?? 1);
  const limit = Number(c.req.query('limit') ?? 20);
  const search = c.req.query('search');
  const mediaType = c.req.query('mediaType');

  const conditions: ReturnType<typeof sql>[] = [];
  if (search) {
    conditions.push(sql`${media.filename} ILIKE ${'%' + search + '%'}`);
  }
  if (mediaType === 'images') {
    conditions.push(sql`${media.mimeType} LIKE 'image/%'`);
  } else if (mediaType === 'documents') {
    conditions.push(sql`${media.mimeType} NOT LIKE 'image/%'`);
  }

  const items = await db
    .select({
      id: media.id,
      filename: media.filename,
      mimeType: media.mimeType,
      extension: media.extension,
      size: media.size,
      width: media.width,
      height: media.height,
      disk: media.disk,
      url: sql<string>`'/api/v1/media/' || ${media.id} || '/file'`,
      createdAt: media.createdAt,
    })
    .from(media)
    .where(conditions.length > 0 ? conditions.reduce((a, b) => sql`${a} AND ${b}`) : undefined)
    .orderBy(desc(media.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(media)
    .where(conditions.length > 0 ? conditions.reduce((a, b) => sql`${a} AND ${b}`) : undefined);
  const total = Number(countResult[0]?.count ?? 0);

  return successPaginated(c, items, buildPaginationMeta(page, limit, total));
}

router.post('/upload', authMiddleware, async (c) => {
  const userId = c.get('userId');

  let file: File | undefined;

  try {
    const parsed = await c.req.parseBody();
    const candidate = parsed['file'];
    if (candidate instanceof File) {
      file = candidate;
    }
  } catch {
    return error(c, 'INVALID_UPLOAD', 'Gagal membaca file', 400);
  }

  if (!file) {
    return error(c, 'FILE_REQUIRED', 'File wajib diupload', 400);
  }

  if (!isAllowedMimeType(file.type)) {
    return error(
      c,
      'INVALID_FILE_TYPE',
      'Tipe file tidak diizinkan. Gunakan jpg, png, webp, atau pdf',
      400,
    );
  }

  if (!isWithinSizeLimit(file.size)) {
    return error(c, 'FILE_TOO_LARGE', 'Ukuran file maksimal 10MB', 400);
  }

  try {
    const stored = await saveFile(file);

    const [record] = await db
      .insert(media)
      .values({
        disk: stored.disk,
        path: stored.path,
        filename: stored.filename,
        mimeType: stored.mimeType,
        extension: stored.extension,
        size: stored.size,
        uploadedBy: userId,
      })
      .returning();

    if (!record) return serverError(c, 'Gagal menyimpan media');

    return created(
      c,
      {
        id: record.id,
        filename: record.filename,
        mimeType: record.mimeType,
        extension: record.extension,
        size: record.size,
        url: `/api/v1/media/${record.id}/file`,
        createdAt: record.createdAt,
      },
      'File berhasil diupload',
    );
  } catch (err) {
    console.error('Upload failed:', err);
    return serverError(c, 'Gagal mengupload file');
  }
});

router.get('/:id', authMiddleware, async (c) => {
  const mediaId = c.req.param('id')!;

  const [record] = await db.select().from(media).where(eq(media.id, mediaId)).limit(1);

  if (!record) return notFound(c, 'Media tidak ditemukan');

  return success(c, {
    id: record.id,
    filename: record.filename,
    mimeType: record.mimeType,
    extension: record.extension,
    size: record.size,
    width: record.width,
    height: record.height,
    url: `/api/v1/media/${record.id}/file`,
    createdAt: record.createdAt,
  });
});

router.get('/:id/file', async (c) => {
  const mediaId = c.req.param('id')!;

  const [record] = await db.select().from(media).where(eq(media.id, mediaId)).limit(1);

  if (!record) return notFound(c, 'Media tidak ditemukan');

  // R2: redirect to public URL
  if (record.disk === 'Cloudflare R2' || (record.disk as StorageDisk) === 'Cloudflare R2') {
    try {
      const publicUrl = getR2PublicUrl(record.filename);
      return c.redirect(publicUrl, 302);
    } catch {
      // Fall through to local filesystem attempt
    }
  }

  // Local filesystem
  try {
    const filePath = join(UPLOAD_DIR, record.filename);
    const buffer = await readFile(filePath);

    return c.body(buffer, 200, {
      'Content-Type': record.mimeType,
      'Content-Length': String(record.size),
      'Cache-Control': 'public, max-age=31536000',
    });
  } catch {
    return error(c, 'FILE_NOT_FOUND', 'File tidak ditemukan di storage', 404);
  }
});

router.delete('/:id', authMiddleware, async (c) => {
  const mediaId = c.req.param('id')!;
  const userId = c.get('userId');
  const userRole = c.get('userRole');

  const [record] = await db.select().from(media).where(eq(media.id, mediaId)).limit(1);

  if (!record) return notFound(c, 'Media tidak ditemukan');

  if (record.uploadedBy !== userId && userRole !== 'admin' && userRole !== 'super_admin') {
    return forbidden(c, 'Tidak dapat menghapus media milik user lain');
  }

  await deleteFile(record.path, record.disk as StorageDisk);
  await db.delete(media).where(eq(media.id, mediaId));

  return success(c, null, 'Media berhasil dihapus');
});

export { router as mediaRouter };
