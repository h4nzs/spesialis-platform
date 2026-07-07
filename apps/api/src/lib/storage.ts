import { writeFile, mkdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

export const UPLOAD_DIR = resolve(process.env.UPLOAD_DIR ?? join(process.cwd(), 'uploads'));

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] as const;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export interface StoredFile {
  filename: string;
  originalName: string;
  mimeType: string;
  extension: string;
  size: number;
  path: string;
}

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

export async function saveFile(file: File): Promise<StoredFile> {
  if (!isAllowedMimeType(file.type)) {
    throw new Error(`File type ${file.type} not allowed`);
  }

  if (!isWithinSizeLimit(file.size)) {
    throw new Error('File exceeds maximum size');
  }

  await ensureUploadDir();

  const ext = extname(file.name) || '';
  const uniqueName = `${randomUUID()}${ext}`;
  const filePath = join(UPLOAD_DIR, uniqueName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, buffer);

  return {
    filename: uniqueName,
    originalName: file.name,
    mimeType: file.type,
    extension: ext.replace('.', ''),
    size: file.size,
    path: filePath,
  };
}

export async function deleteFile(path: string): Promise<void> {
  try {
    await unlink(path);
  } catch {
    // File already deleted or not found — ignore
  }
}
