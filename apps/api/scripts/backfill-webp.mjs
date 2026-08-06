/**
 * Backfill PNG lama di R2 → WebP (resize 1600 + q80, alpha terjaga).
 *
 * Sebelum 16 Jul 2026 upload disimpan apa adanya (PNG 3-4MB, tanpa
 * Cache-Control → cf-cache-status DYNAMIC → thumbnail butuh 8-16 detik).
 * Script ini: download dari R2 → kompres → upload object .webp dengan
 * Cache-Control → update DB → hapus object PNG lama.
 *
 * JALANKAN DI VPS (punya env R2 + sharp + postgres):
 *   cd spesialis-platform
 *   docker compose -f docker-compose.prod.yml --env-file .env.prod exec -T api \
 *     node apps/api/scripts/backfill-webp.mjs
 */
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import postgres from 'postgres';
import sharp from 'sharp';

const sql = postgres(process.env.DATABASE_URL, { max: 3 });

if (
  !process.env.R2_ENDPOINT ||
  !process.env.R2_BUCKET ||
  !process.env.R2_ACCESS_KEY ||
  !process.env.R2_SECRET_KEY
) {
  console.error('❌ R2 env tidak lengkap (R2_ENDPOINT, R2_BUCKET, R2_ACCESS_KEY, R2_SECRET_KEY)');
  process.exit(1);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET;
const MAX_DIMENSION = 1600;

try {
  const rows = await sql`
    SELECT id, filename, size
    FROM media
    WHERE mime_type = 'image/png'
      AND disk = 'Cloudflare R2'
      AND deleted_at IS NULL
  `;

  console.log(`Found ${rows.length} PNG di R2`);

  let converted = 0;
  let failed = 0;

  for (const row of rows) {
    try {
      const get = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: row.filename }));
      if (!get.Body) throw new Error('Body kosong');
      const buf = Buffer.from(await get.Body.transformToByteArray());

      const out = await sharp(buf)
        .resize({
          width: MAX_DIMENSION,
          height: MAX_DIMENSION,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 80, alphaQuality: 100 })
        .toBuffer();

      const newName = row.filename.replace(/\.png$/i, '.webp');

      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: newName,
          Body: out,
          ContentType: 'image/webp',
          CacheControl: 'public, max-age=31536000, immutable',
        }),
      );

      await sql`
        UPDATE media
        SET filename = ${newName}, mime_type = 'image/webp', extension = 'webp', size = ${out.length}
        WHERE id = ${row.id}
      `;

      await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: row.filename }));

      console.log(
        `✓ ${row.filename} → ${newName} (${(row.size / 1024).toFixed(0)}KB → ${(out.length / 1024).toFixed(0)}KB, -${(
          (1 - out.length / row.size) * 100
        ).toFixed(0)}%)`,
      );
      converted++;
    } catch (err) {
      console.error(`✗ ${row.filename}: ${(err as Error).message}`);
      failed++;
    }
  }

  console.log(`\nSelesai: ${converted} dikonversi, ${failed} gagal`);
} finally {
  await sql.end();
  s3.destroy();
}
