import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { db, media } from '../lib/db.ts';
import { authMiddleware } from '../middleware/auth.ts';
import {
  saveFile,
  deleteFile,
  isAllowedMimeType,
  isWithinSizeLimit,
  UPLOAD_DIR,
} from '../lib/storage.ts';
import { success, created, error, notFound, forbidden, serverError } from '../lib/response.ts';

const router = new Hono();

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
        disk: 'Local',
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

  await deleteFile(record.path);
  await db.delete(media).where(eq(media.id, mediaId));

  return success(c, null, 'Media berhasil dihapus');
});

export { router as mediaRouter };
