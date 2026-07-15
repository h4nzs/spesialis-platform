import { writeFile, mkdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

/* ── Constants ───────────────────────────────────────────────────── */

export const UPLOAD_DIR = resolve(process.env.UPLOAD_DIR ?? join(process.cwd(), 'uploads'));

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] as const;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export type StorageDisk = 'Local' | 'Cloudflare R2';

export interface StoredFile {
  filename: string;
  originalName: string;
  mimeType: string;
  extension: string;
  size: number;
  path: string;
  disk: StorageDisk;
}

/* ── R2 / S3 Client ──────────────────────────────────────────────── */

let _s3Client: S3Client | null = null;

function getR2Config() {
  const endpoint = process.env.R2_ENDPOINT;
  const bucket = process.env.R2_BUCKET;
  const accessKey = process.env.R2_ACCESS_KEY;
  const secretKey = process.env.R2_SECRET_KEY;
  if (endpoint && bucket && accessKey && secretKey) {
    return { endpoint, bucket, accessKey, secretKey };
  }
  return null;
}

function getS3Client(): S3Client {
  if (!_s3Client) {
    const cfg = getR2Config();
    if (!cfg)
      throw new Error(
        'R2 not configured — missing R2_ENDPOINT, R2_BUCKET, R2_ACCESS_KEY, R2_SECRET_KEY',
      );
    _s3Client = new S3Client({
      region: 'auto',
      endpoint: cfg.endpoint,
      credentials: {
        accessKeyId: cfg.accessKey,
        secretAccessKey: cfg.secretKey,
      },
      requestHandler: { requestTimeout: 30_000 },
    });
  }
  return _s3Client;
}

export function isR2Enabled(): boolean {
  return getR2Config() !== null;
}

export function getR2Bucket(): string {
  const cfg = getR2Config();
  if (!cfg) throw new Error('R2 not configured');
  return cfg.bucket;
}

/**
 * Build a public URL for an R2 object.
 * Uses R2_PUBLIC_URL if set (e.g. custom domain), otherwise constructs
 * from the R2 endpoint in the standard format.
 */
export function getR2PublicUrl(filename: string): string {
  const key = filename.replace(/^\//, '');
  const customUrl = process.env.R2_PUBLIC_URL;
  if (customUrl) return `${customUrl.replace(/\/+$/, '')}/${key}`;

  const cfg = getR2Config();
  if (!cfg) throw new Error('R2 not configured');
  // Standard R2 URL: https://<bucket>.<endpoint-host>/<key>
  const host = cfg.endpoint.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  return `https://${cfg.bucket}.${host}/${key}`;
}

/* ── Helpers ─────────────────────────────────────────────────────── */

export function isAllowedMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType as (typeof ALLOWED_MIME_TYPES)[number]);
}

export function isWithinSizeLimit(size: number): boolean {
  return size > 0 && size <= MAX_FILE_SIZE;
}

export async function ensureUploadDir(): Promise<void> {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

/* ── saveFile ──────────────────────────────────────────────────────── */

export async function saveFile(file: File): Promise<StoredFile> {
  if (!isAllowedMimeType(file.type)) {
    throw new Error(`File type ${file.type} not allowed`);
  }

  if (!isWithinSizeLimit(file.size)) {
    throw new Error('File exceeds maximum size');
  }

  const ext = extname(file.name) || '';
  const uniqueName = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (isR2Enabled()) {
    const client = getS3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: getR2Bucket(),
        Key: uniqueName,
        Body: buffer,
        ContentType: file.type,
      }),
    );

    return {
      filename: uniqueName,
      originalName: file.name,
      mimeType: file.type,
      extension: ext.replace('.', ''),
      size: file.size,
      path: uniqueName, // R2 key = filename
      disk: 'Cloudflare R2',
    };
  }

  // Local filesystem fallback
  await ensureUploadDir();
  const filePath = join(UPLOAD_DIR, uniqueName);
  await writeFile(filePath, buffer);

  return {
    filename: uniqueName,
    originalName: file.name,
    mimeType: file.type,
    extension: ext.replace('.', ''),
    size: file.size,
    path: filePath,
    disk: 'Local',
  };
}

/* ── deleteFile ────────────────────────────────────────────────────── */

export async function deleteFile(path: string, disk?: StorageDisk): Promise<void> {
  if (disk === 'Cloudflare R2' || (disk === undefined && isR2Enabled())) {
    try {
      const client = getS3Client();
      await client.send(new DeleteObjectCommand({ Bucket: getR2Bucket(), Key: path }));
    } catch {
      // Ignore — file already deleted or not found
    }
    return;
  }

  // Local filesystem
  try {
    await unlink(path);
  } catch {
    // Ignore
  }
}
