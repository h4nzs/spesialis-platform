import type { ValidationError } from '@specialist/types';

/**
 * Map issue dari Zod hasil parse ke format ValidationError yang konsisten.
 */
export function mapZodIssues(
  issues: Array<{ path: (string | number)[]; message: string }>,
): ValidationError[] {
  return issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
}

/**
 * Cek apakah string adalah UUID yang valid.
 */
export function isValidUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

/**
 * Cek apakah string adalah email yang valid (basic check).
 */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Cek apakah nomor HP Indonesia valid.
 * Format: 08xx atau 628xx, 10-15 digit.
 */
export function isValidIndonesianPhone(value: string): boolean {
  const cleaned = value.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('62')) {
    return cleaned.length >= 11 && cleaned.length <= 15;
  }
  if (cleaned.startsWith('0')) {
    return cleaned.length >= 10 && cleaned.length <= 14;
  }
  return false;
}

/**
 * Cek apakah file size tidak melebihi batas (dalam MB).
 */
export function isValidFileSize(fileSizeBytes: number, maxMB: number): boolean {
  return fileSizeBytes <= maxMB * 1024 * 1024;
}

/**
 * Cek apakah MIME type termasuk dalam daftar yang diizinkan.
 */
export function isValidFileType(mimeType: string, allowedTypes: readonly string[]): boolean {
  return allowedTypes.includes(mimeType);
}

/**
 * Truncate string ke max length.
 */
export function truncate(value: string, maxLength: number, suffix = '...'): string {
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Slugify string.
 *
 * @example
 *   slugify('Cuci AC Standar') // 'cuci-ac-standar'
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}
