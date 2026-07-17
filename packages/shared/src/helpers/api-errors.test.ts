import { describe, it, expect } from 'vitest';
import { ApiClientError } from '../errors.ts';
import { parseApiError, getFieldError } from './api-errors.ts';

function makeApiError(
  status: number,
  message: string,
  errors?: Array<{ field: string; message: string }>,
): ApiClientError {
  return new ApiClientError(
    { success: false as const, code: 'VALIDATION_ERROR', message, ...(errors ? { errors } : {}) },
    status,
  );
}

// ─── parseApiError ──────────────────────────────────────────────

describe('parseApiError', () => {
  // ── ApiClientError with validation errors ─────────────────

  it('parses single field validation error', () => {
    const err = makeApiError(422, 'Validation failed', [{ field: 'name', message: 'Required' }]);

    const result = parseApiError(err);

    expect(result.fieldErrors).toEqual({ name: 'Nama wajib diisi' });
    expect(result.generalError).toBe('Validasi gagal: Nama wajib diisi');
  });

  it('parses multiple field validation errors (≤3)', () => {
    const err = makeApiError(422, 'Validation failed', [
      { field: 'name', message: 'Required' },
      { field: 'email', message: 'Invalid email' },
      { field: 'password', message: 'String must contain at least 8 character(s)' },
    ]);

    const result = parseApiError(err);

    expect(result.fieldErrors).toEqual({
      name: 'Nama wajib diisi',
      email: 'Format Email tidak valid',
      password: 'Password terlalu pendek (minimal 8 karakter)',
    });
    expect(result.generalError).toBe(
      'Validasi gagal: Nama wajib diisi, Format Email tidak valid, Password terlalu pendek (minimal 8 karakter)',
    );
  });

  it('truncates general summary when >3 field errors', () => {
    const err = makeApiError(422, 'Validation failed', [
      { field: 'name', message: 'Required' },
      { field: 'email', message: 'Required' },
      { field: 'password', message: 'Required' },
      { field: 'phone', message: 'Required' },
      { field: 'fullName', message: 'Required' },
    ]);

    const result = parseApiError(err);

    expect(Object.keys(result.fieldErrors).length).toBe(5);
    expect(result.generalError).toBe(
      'Validasi gagal: Nama wajib diisi, Email wajib diisi, Password wajib diisi, dan 2 lainnya',
    );
  });

  // ── formatErrorMessage variants ────────────────────────

  it('maps "Required" to "label wajib diisi"', () => {
    const err = makeApiError(422, '', [{ field: 'slug', message: 'Required' }]);
    const result = parseApiError(err);
    expect(result.fieldErrors['slug']).toBe('Slug wajib diisi');
  });

  it('maps "Expected string" to "label harus berupa teks"', () => {
    const err = makeApiError(422, '', [
      { field: 'name', message: 'Expected string, received number' },
    ]);
    const result = parseApiError(err);
    expect(result.fieldErrors['name']).toBe('Nama harus berupa teks');
  });

  it('maps "Expected number" to "label harus berupa angka"', () => {
    const err = makeApiError(422, '', [
      { field: 'displayOrder', message: 'Expected number, received string' },
    ]);
    const result = parseApiError(err);
    expect(result.fieldErrors['displayOrder']).toBe('Urutan harus berupa angka');
  });

  it('maps "Expected boolean" to "label tidak valid"', () => {
    const err = makeApiError(422, '', [{ field: 'isActive', message: 'Expected boolean' }]);
    const result = parseApiError(err);
    expect(result.fieldErrors['isActive']).toBe('Status Aktif tidak valid');
  });

  it('maps invalid UUID to "label tidak valid"', () => {
    const err = makeApiError(422, '', [{ field: 'categoryId', message: 'Invalid uuid' }]);
    const result = parseApiError(err);
    expect(result.fieldErrors['categoryId']).toBe('Kategori tidak valid');
  });

  it('maps String must contain at most to max length message', () => {
    const err = makeApiError(422, '', [
      { field: 'name', message: 'String must contain at most 255 character(s)' },
    ]);
    const result = parseApiError(err);
    expect(result.fieldErrors['name']).toBe('Nama terlalu panjang (maksimal 255 karakter)');
  });

  it('maps Number must be greater than or equal to min message', () => {
    const err = makeApiError(422, '', [
      { field: 'rating', message: 'Number must be greater than or equal to 1' },
    ]);
    const result = parseApiError(err);
    expect(result.fieldErrors['rating']).toBe('Rating minimal 1');
  });

  it('maps String must contain at least to min length message', () => {
    const err = makeApiError(422, '', [
      { field: 'password', message: 'String must contain at least 8 character(s)' },
    ]);
    const result = parseApiError(err);
    expect(result.fieldErrors['password']).toBe('Password terlalu pendek (minimal 8 karakter)');
  });

  it('maps Number must be greater than to must-be-over message', () => {
    const err = makeApiError(422, '', [
      { field: 'quantity', message: 'Number must be greater than 0' },
    ]);
    const result = parseApiError(err);
    expect(result.fieldErrors['quantity']).toBe('Jumlah harus lebih dari 0');
  });

  it('maps regex validation to slug format message', () => {
    const err = makeApiError(422, '', [{ field: 'slug', message: 'must be a valid regex' }]);
    const result = parseApiError(err);
    expect(result.fieldErrors['slug']).toBe(
      'Slug hanya boleh mengandung huruf kecil, angka, dan tanda hubung (-)',
    );
  });

  it('maps Invalid email to format message', () => {
    const err = makeApiError(422, '', [{ field: 'email', message: 'Invalid email' }]);
    const result = parseApiError(err);
    expect(result.fieldErrors['email']).toBe('Format Email tidak valid');
  });

  it('maps Invalid enum value to enum message', () => {
    const err = makeApiError(422, '', [
      { field: 'status', message: "Invalid enum value. Expected 'Active' | 'Inactive'" },
    ]);
    const result = parseApiError(err);
    expect(result.fieldErrors['status']).toBe(
      'Status tidak valid. Silakan pilih dari opsi yang tersedia',
    );
  });

  it('maps must not be null to "label tidak boleh kosong"', () => {
    const err = makeApiError(422, '', [{ field: 'description', message: 'must not be null' }]);
    const result = parseApiError(err);
    expect(result.fieldErrors['description']).toBe('Deskripsi tidak boleh kosong');
  });

  it('falls back to raw message for unknown Zod messages', () => {
    const err = makeApiError(422, '', [
      { field: 'customField', message: 'Custom validation error' },
    ]);
    const result = parseApiError(err);
    expect(result.fieldErrors['customField']).toBe('Custom validation error');
  });

  // ── FIELD_LABELS coverage per category ─────────────────

  it('maps Service fields correctly', () => {
    const err = makeApiError(422, '', [
      { field: 'categoryId', message: 'Required' },
      { field: 'basePrice', message: 'Required' },
      { field: 'estimatedDuration', message: 'Required' },
      { field: 'warrantyDays', message: 'Required' },
      { field: 'isFeatured', message: 'Required' },
    ]);
    const result = parseApiError(err);
    expect(result.fieldErrors).toEqual({
      categoryId: 'Kategori wajib diisi',
      basePrice: 'Harga wajib diisi',
      estimatedDuration: 'Durasi wajib diisi',
      warrantyDays: 'Garansi wajib diisi',
      isFeatured: 'Featured wajib diisi',
    });
  });

  it('maps User / Auth fields correctly', () => {
    const err = makeApiError(422, '', [
      { field: 'fullName', message: 'Required' },
      { field: 'password', message: 'Required' },
      { field: 'currentPassword', message: 'Required' },
      { field: 'newPassword', message: 'Required' },
      { field: 'token', message: 'Required' },
      { field: 'refreshToken', message: 'Required' },
      { field: 'ktpNumber', message: 'Required' },
    ]);
    const result = parseApiError(err);
    expect(result.fieldErrors['fullName']).toBe('Nama Lengkap wajib diisi');
    expect(result.fieldErrors['password']).toBe('Password wajib diisi');
    expect(result.fieldErrors['currentPassword']).toBe('Password Saat Ini wajib diisi');
    expect(result.fieldErrors['newPassword']).toBe('Password Baru wajib diisi');
    expect(result.fieldErrors['token']).toBe('Token wajib diisi');
    expect(result.fieldErrors['refreshToken']).toBe('Refresh Token wajib diisi');
    expect(result.fieldErrors['ktpNumber']).toBe('Nomor KTP wajib diisi');
  });

  it('maps Partner fields correctly', () => {
    const err = makeApiError(422, '', [
      { field: 'domicile', message: 'Required' },
      { field: 'bio', message: 'Required' },
      { field: 'availability', message: 'Required' },
      { field: 'verificationStatus', message: 'Required' },
      { field: 'proficiency', message: 'Required' },
      { field: 'skillIds', message: 'Required' },
      { field: 'suggestedServiceName', message: 'Required' },
    ]);
    const result = parseApiError(err);
    expect(result.fieldErrors['domicile']).toBe('Domisili wajib diisi');
    expect(result.fieldErrors['bio']).toBe('Bio wajib diisi');
    expect(result.fieldErrors['availability']).toBe('Ketersediaan wajib diisi');
    expect(result.fieldErrors['verificationStatus']).toBe('Status Verifikasi wajib diisi');
    expect(result.fieldErrors['proficiency']).toBe('Tingkat Keahlian wajib diisi');
    expect(result.fieldErrors['skillIds']).toBe('Keahlian wajib diisi');
    expect(result.fieldErrors['suggestedServiceName']).toBe('Usulan Nama Layanan wajib diisi');
  });

  it('maps Corporate / Company fields correctly', () => {
    const err = makeApiError(422, '', [
      { field: 'companyName', message: 'Required' },
      { field: 'legalName', message: 'Required' },
      { field: 'taxNumber', message: 'Required' },
      { field: 'website', message: 'Required' },
      { field: 'employeeCount', message: 'Required' },
      { field: 'industry', message: 'Required' },
    ]);
    const result = parseApiError(err);
    expect(result.fieldErrors['companyName']).toBe('Nama Perusahaan wajib diisi');
    expect(result.fieldErrors['legalName']).toBe('Nama Legal wajib diisi');
    expect(result.fieldErrors['taxNumber']).toBe('NPWP wajib diisi');
    expect(result.fieldErrors['website']).toBe('Website wajib diisi');
    expect(result.fieldErrors['employeeCount']).toBe('Jumlah Karyawan wajib diisi');
    expect(result.fieldErrors['industry']).toBe('Industri wajib diisi');
  });

  it('maps Address fields correctly', () => {
    const err = makeApiError(422, '', [
      { field: 'receiverName', message: 'Required' },
      { field: 'province', message: 'Required' },
      { field: 'city', message: 'Required' },
      { field: 'district', message: 'Required' },
      { field: 'postalCode', message: 'Required' },
      { field: 'label', message: 'Required' },
      { field: 'isDefault', message: 'Required' },
    ]);
    const result = parseApiError(err);
    expect(result.fieldErrors['receiverName']).toBe('Nama Penerima wajib diisi');
    expect(result.fieldErrors['province']).toBe('Provinsi wajib diisi');
    expect(result.fieldErrors['city']).toBe('Kota/Kabupaten wajib diisi');
    expect(result.fieldErrors['district']).toBe('Kecamatan wajib diisi');
    expect(result.fieldErrors['postalCode']).toBe('Kode Pos wajib diisi');
    expect(result.fieldErrors['label']).toBe('Label Alamat wajib diisi');
    expect(result.fieldErrors['isDefault']).toBe('Alamat Utama wajib diisi');
  });

  it('maps Order / Booking fields correctly', () => {
    const err = makeApiError(422, '', [
      { field: 'serviceId', message: 'Required' },
      { field: 'bookingDate', message: 'Required' },
      { field: 'bookingTime', message: 'Required' },
      { field: 'notes', message: 'Required' },
      { field: 'reason', message: 'Required' },
      { field: 'internalNotes', message: 'Required' },
    ]);
    const result = parseApiError(err);
    expect(result.fieldErrors['serviceId']).toBe('Layanan wajib diisi');
    expect(result.fieldErrors['bookingDate']).toBe('Tanggal wajib diisi');
    expect(result.fieldErrors['bookingTime']).toBe('Jam wajib diisi');
    expect(result.fieldErrors['notes']).toBe('Catatan wajib diisi');
    expect(result.fieldErrors['reason']).toBe('Alasan wajib diisi');
    expect(result.fieldErrors['internalNotes']).toBe('Catatan Internal wajib diisi');
  });

  it('maps SEO fields correctly', () => {
    const err = makeApiError(422, '', [
      { field: 'metaTitle', message: 'Required' },
      { field: 'metaDescription', message: 'Required' },
      { field: 'ogTitle', message: 'Required' },
      { field: 'canonicalUrl', message: 'Required' },
    ]);
    const result = parseApiError(err);
    expect(result.fieldErrors['metaTitle']).toBe('Judul Meta wajib diisi');
    expect(result.fieldErrors['metaDescription']).toBe('Deskripsi Meta wajib diisi');
    expect(result.fieldErrors['ogTitle']).toBe('Judul OG wajib diisi');
    expect(result.fieldErrors['canonicalUrl']).toBe('URL Canonical wajib diisi');
  });

  it('maps nested address fields with dot notation label', () => {
    const err = makeApiError(422, '', [
      { field: 'address.city', message: 'Required' },
      { field: 'address.postalCode', message: 'Required' },
    ]);
    const result = parseApiError(err);
    // Nested fields fall back to raw field name since exact match is 'address.city', not 'city'
    expect(result.fieldErrors['address.city']).toBe('address.city wajib diisi');
    expect(result.fieldErrors['address.postalCode']).toBe('address.postalCode wajib diisi');
  });

  it('uses raw field name as label when field is not in FIELD_LABELS', () => {
    const err = makeApiError(422, '', [{ field: 'unknownField', message: 'Required' }]);
    const result = parseApiError(err);
    expect(result.fieldErrors['unknownField']).toBe('unknownField wajib diisi');
  });

  // ── Non-validation errors ─────────────────────────

  it('returns empty fieldErrors for ApiClientError without errors array', () => {
    const err = makeApiError(409, 'Email sudah terdaftar');

    const result = parseApiError(err);

    expect(result.fieldErrors).toEqual({});
    expect(result.generalError).toBe('Email sudah terdaftar');
  });

  it('returns empty fieldErrors for ApiClientError with empty errors array', () => {
    const err = makeApiError(400, 'Bad request', []);

    const result = parseApiError(err);

    expect(result.fieldErrors).toEqual({});
    expect(result.generalError).toBe('Bad request');
  });

  it('returns err.message for regular Error', () => {
    const err = new Error('Network error');

    const result = parseApiError(err);

    expect(result.fieldErrors).toEqual({});
    expect(result.generalError).toBe('Network error');
  });

  it('returns fallback message for unknown error type', () => {
    const result = parseApiError('some string error');

    expect(result.fieldErrors).toEqual({});
    expect(result.generalError).toBe('Terjadi kesalahan. Silakan coba lagi.');
  });

  it('returns fallback message for null', () => {
    const result = parseApiError(null);

    expect(result.fieldErrors).toEqual({});
    expect(result.generalError).toBe('Terjadi kesalahan. Silakan coba lagi.');
  });

  it('uses custom fallback message for unknown errors', () => {
    const result = parseApiError(undefined, 'Gagal memuat data');

    expect(result.generalError).toBe('Gagal memuat data');
  });
});

// ─── getFieldError ──────────────────────────────────────────────

describe('getFieldError', () => {
  it('returns error message for existing field', () => {
    const errors = { name: 'Nama wajib diisi', email: 'Format Email tidak valid' };
    expect(getFieldError(errors, 'name')).toBe('Nama wajib diisi');
  });

  it('returns undefined for missing field', () => {
    const errors = { name: 'Nama wajib diisi' };
    expect(getFieldError(errors, 'email')).toBeUndefined();
  });

  it('returns undefined for empty errors record', () => {
    expect(getFieldError({}, 'name')).toBeUndefined();
  });
});
