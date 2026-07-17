import { ApiClientError } from '../errors.ts';

/**
 * Mapping field names from API validation errors to user-friendly labels
 * in Bahasa Indonesia. Extend this map as needed.
 */
const FIELD_LABELS: Record<string, string> = {
  // ── Service ──────────────────────────────────────────────
  categoryId: 'Kategori',
  name: 'Nama',
  slug: 'Slug',
  shortDescription: 'Deskripsi Singkat',
  description: 'Deskripsi',
  thumbnail: 'Gambar',
  basePrice: 'Harga',
  estimatedDuration: 'Durasi',
  warrantyDays: 'Garansi',
  isFeatured: 'Featured',
  displayOrder: 'Urutan',

  // ── FAQ ──────────────────────────────────────────────────
  question: 'Pertanyaan',
  answer: 'Jawaban',
  category: 'Kategori',
  isActive: 'Status Aktif',

  // ── Service Category ─────────────────────────────────────
  icon: 'Icon',
  image: 'Gambar',

  // ── Coverage Area ────────────────────────────────────────
  note: 'Keterangan',

  // ── Article ──────────────────────────────────────────────
  title: 'Judul',
  content: 'Konten',
  summary: 'Ringkasan',
  authorName: 'Nama Penulis',
  coverImage: 'Gambar Sampul',
  tags: 'Tag',

  // ── CMS Pages ────────────────────────────────────────────
  pageTitle: 'Judul Halaman',

  // ── Booking / Order ──────────────────────────────────────
  addressId: 'Alamat',
  bookingDate: 'Tanggal',
  bookingTime: 'Jam',
  customerName: 'Nama',
  customerPhone: 'Nomor Telepon',
  notes: 'Catatan',
  serviceId: 'Layanan',
  items: 'Item Pesanan',
  quantity: 'Jumlah',
  unitPrice: 'Harga Satuan',
  discountAmount: 'Diskon',
  finalPrice: 'Harga Final',
  internalNotes: 'Catatan Internal',
  reason: 'Alasan',
  discountPercent: 'Persentase Diskon',

  // ── Review ──────────────────────────────────────────────
  orderId: 'Pesanan',
  rating: 'Rating',
  review: 'Komentar',

  // ── Complaint ───────────────────────────────────────────
  complaintTitle: 'Judul Komplain',

  // ── Payment ─────────────────────────────────────────────
  method: 'Metode',
  amount: 'Jumlah',

  // ── User / Auth ────────────────────────────────────────
  fullName: 'Nama Lengkap',
  phone: 'Nomor Telepon',
  email: 'Email',
  password: 'Password',
  currentPassword: 'Password Saat Ini',
  newPassword: 'Password Baru',
  token: 'Token',
  refreshToken: 'Refresh Token',
  status: 'Status',
  role: 'Role',
  ktpNumber: 'Nomor KTP',

  // ── Partner ─────────────────────────────────────────────
  domicile: 'Domisili',
  avatar: 'Foto Profil',
  bio: 'Bio',
  experienceYear: 'Tahun Pengalaman',
  availability: 'Ketersediaan',
  verificationStatus: 'Status Verifikasi',
  proficiency: 'Tingkat Keahlian',
  skillIds: 'Keahlian',
  suggestedServiceName: 'Usulan Nama Layanan',
  suggestedServiceDescription: 'Usulan Deskripsi Layanan',
  fileName: 'Nama File',
  mediaId: 'File',

  // ── Corporate / Company ─────────────────────────────────
  companyName: 'Nama Perusahaan',
  legalName: 'Nama Legal',
  picName: 'Nama PIC',
  picPhone: 'Nomor Telepon PIC',
  companyEmail: 'Email Perusahaan',
  companyPhone: 'Nomor Telepon Perusahaan',
  taxNumber: 'NPWP',
  logoMediaId: 'Logo',
  website: 'Website',
  industry: 'Industri',
  employeeCount: 'Jumlah Karyawan',

  // ── Address ──────────────────────────────────────────────
  receiverName: 'Nama Penerima',
  receiverPhone: 'Nomor Telepon Penerima',
  province: 'Provinsi',
  city: 'Kota/Kabupaten',
  district: 'Kecamatan',
  postalCode: 'Kode Pos',
  address: 'Alamat Lengkap',
  label: 'Label Alamat',
  isDefault: 'Alamat Utama',

  // ── SEO ──────────────────────────────────────────────────
  metaTitle: 'Judul Meta',
  metaDescription: 'Deskripsi Meta',
  ogTitle: 'Judul OG',
  ogDescription: 'Deskripsi OG',
  ogImage: 'Gambar OG',
  canonicalUrl: 'URL Canonical',
  robots: 'Robots',
  schemaJson: 'Schema JSON-LD',

  // ── Media ──────────────────────────────────────────────
  filename: 'Nama File',
  mimeType: 'Tipe File',
  extension: 'Ekstensi File',

  // ── Penalty ────────────────────────────────────────────
  partnerId: 'Mitra',
  penaltyType: 'Jenis',
  penaltyStatus: 'Status',

  // ── Contract ───────────────────────────────────────────
  startDate: 'Tanggal Mulai',
  endDate: 'Tanggal Berakhir',

  // ── Invoice ────────────────────────────────────────────
  dueDate: 'Tanggal Jatuh Tempo',

  // ── Redirect ────────────────────────────────────────────
  sourcePath: 'Path Asal',
  targetPath: 'Path Tujuan',

  // ── Notification ──────────────────────────────────────
  notificationIds: 'Notifikasi',

  // ── Customer ───────────────────────────────────────────
  gender: 'Jenis Kelamin',
  defaultAddressId: 'Alamat Utama',

  // ── Document ──────────────────────────────────────────
  type: 'Tipe',
  documentType: 'Jenis Dokumen',

  // ── CMS Pages ─────────────────────────────────────────
  meta: 'Meta',

  // ── General ────────────────────────────────────────────
  body: 'Body Request',
};

/**
 * Convert raw Zod validation error messages to user-friendly messages
 * in Bahasa Indonesia.
 */
function formatErrorMessage(field: string, rawMessage: string): string {
  const label = FIELD_LABELS[field] ?? field;

  // Zod common messages
  if (rawMessage === 'Required') return `${label} wajib diisi`;
  if (rawMessage.startsWith('Expected string')) return `${label} harus berupa teks`;
  if (rawMessage.startsWith('Expected number')) return `${label} harus berupa angka`;
  if (rawMessage.startsWith('Expected boolean')) return `${label} tidak valid`;
  if (rawMessage.includes('must be a valid UUID') || rawMessage.includes('Invalid uuid'))
    return `${label} tidak valid`;
  if (rawMessage.includes('String must contain at most'))
    return `${label} terlalu panjang (maksimal ${rawMessage.match(/\d+/)?.[0] ?? ''} karakter)`;
  if (rawMessage.includes('String must contain at least'))
    return `${label} terlalu pendek (minimal ${rawMessage.match(/\d+/)?.[0] ?? ''} karakter)`;
  if (rawMessage.includes('Number must be greater than or equal to'))
    return `${label} minimal ${rawMessage.match(/\d+/)?.[0] ?? ''}`;
  if (rawMessage.includes('Number must be greater than'))
    return `${label} harus lebih dari ${rawMessage.match(/\d+/)?.[0] ?? ''}`;
  if (rawMessage.includes('Invalid email')) return `Format ${label} tidak valid`;
  if (rawMessage.includes('Invalid enum value'))
    return `${label} tidak valid. Silakan pilih dari opsi yang tersedia`;
  if (rawMessage.includes('must be a valid regex') || rawMessage.includes('Invalid'))
    return `${label} hanya boleh mengandung huruf kecil, angka, dan tanda hubung (-)`;
  if (rawMessage.includes('must not be null')) return `${label} tidak boleh kosong`;

  // Fallback — use the raw Zod message
  return rawMessage;
}

/**
 * Parse an unknown error (likely from API catch block) into:
 * - `fieldErrors`: Record<fieldName, userFriendlyMessage> for inline field-level display
 * - `generalError`: A user-friendly general error message string
 *
 * Usage:
 * ```ts
 * catch (err) {
 *   const { fieldErrors, generalError } = parseApiError(err);
 *   setFieldErrors(fieldErrors);
 *   setError(generalError);
 * }
 * ```
 */
export function parseApiError(
  err: unknown,
  fallbackMessage = 'Terjadi kesalahan. Silakan coba lagi.',
): { fieldErrors: Record<string, string>; generalError: string } {
  if (err instanceof ApiClientError && err.errors && err.errors.length > 0) {
    const fieldErrors: Record<string, string> = {};
    for (const ve of err.errors) {
      fieldErrors[ve.field] = formatErrorMessage(ve.field, ve.message);
    }
    // Build a general summary from field errors
    const fieldList = Object.values(fieldErrors).slice(0, 3).join(', ');
    const suffix =
      Object.keys(fieldErrors).length > 3
        ? `, dan ${Object.keys(fieldErrors).length - 3} lainnya`
        : '';
    return {
      fieldErrors,
      generalError: `Validasi gagal: ${fieldList}${suffix}`,
    };
  }

  if (err instanceof ApiClientError) {
    // Non-validation API error (e.g., 409 Conflict, 403 Forbidden)
    return { fieldErrors: {}, generalError: err.message };
  }

  if (err instanceof Error) {
    return { fieldErrors: {}, generalError: err.message };
  }

  return { fieldErrors: {}, generalError: fallbackMessage };
}

/**
 * Direct helper to get a field-level error message from a parsed error record.
 */
export function getFieldError(
  fieldErrors: Record<string, string>,
  field: string,
): string | undefined {
  return fieldErrors[field];
}
