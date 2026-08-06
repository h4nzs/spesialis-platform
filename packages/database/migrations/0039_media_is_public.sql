-- Media visibility: add is_public flag.
--
-- Konten CMS (cover artikel, gambar layanan, iklan blog, halaman CMS, dll.)
-- dirender di halaman publik, tetapi GET /api/v1/media/:id/file membutuhkan
-- auth sehingga gambar-gambar itu gagal dimuat di browser publik (401).
-- is_public memisahkan media publik (tanpa auth) dari dokumen privat
-- (mis. dokumen partner) yang tetap wajib auth.
--
-- Backfill: seluruh media milik admin/super_admin adalah konten publik.
-- Upload partner tetap privat (default false).
ALTER TABLE media ADD COLUMN is_public boolean NOT NULL DEFAULT false;

UPDATE media
SET is_public = true
WHERE uploaded_by IN (SELECT id FROM users WHERE role IN ('admin', 'super_admin'));
