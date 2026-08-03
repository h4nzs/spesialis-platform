# 📋 Laporan Kesiapan Produksi — AhliPanggilan Platform

- **Auditor:** Auditor Perangkat Lunak Mandiri
- **Tanggal:** 3 Agustus 2026
- **Batasan:** Audit bersifat _read-only_ (hanya meninjau kode), tidak ada modifikasi kode
- **Cakupan:** Monorepo lengkap (`apps/api`, `apps/web`, 8 packages, docs, infra)
- **Repositori:** `/home/ken/Projects/spesialis`

---

## 1. Ringkasan Eksekutif

Audit multi-tahap yang mendalam mengungkap **11 Blocker**, **~30 Critical**, dan **~90+ High severity** yang tersebar di 10 domain. Karena mengandung pelanggaran kontrak fundamental terhadap ADR 0002 (seluruh 89 halaman Astro dirender SSR, membuat target Lighthouse/SSG tidak tercapai), RedLock Redis yang belum pernah diaktifkan (membuat fitur multi-instance seperti rate-limit/CMS-cache/lock-pubsub berjalan sepenuhnya sebagai fallback in-memory), kebocoran IDOR pada data KYC dan endpoint media pribadi, serta cadangan basis data yang tidak dapat dipulihkan dengan metode yang didokumentasikan — platform ini untuk saat ini berada di bawah standar "siap produksi" yang diajukan oleh tim.

Dokumentasi (`AGENTS.md`, ADR, business-rules, `deployment.md`, `content-lock-redis.md`) sangat komprehensif dan komposisi testing (2.455 tes) mengesankan, tetapi ditemukan beberapa masalah mendasar:

### 1. Dokumen vs Implementasi — angka inventaris salah di setiap level

| Item                 | Didokumentasikan | Aktual | Selisih |
| -------------------- | ---------------- | ------ | ------- |
| Tabel Database       | 34               | 43     | +9      |
| File Rute API        | 67               | 45     | -22     |
| Komponen UI          | 106              | 45     | -61     |
| File Spesifikasi E2E | 19               | 29     | +10     |
| Halaman Astro        | 62               | 89     | +27     |
| Package (AGENTS.md)  | 6                | 8      | +2      |

Ketidaksesuaian kontrak dokumentasi dengan implementasi ini mengikis kepercayaan terhadap akurasi dokumentasi secara keseluruhan.

### 2. Pengaturan Keamanan RBAC

- Tidak ada imunitas audit log di database (proses aplikasi dapat melakukan `UPDATE` lalu `DELETE` pada `audit_logs`)
- Dokumen KYC dapat diunduh tanpa autentikasi
- IDOR pada booking/payment/media
- Validasi `JWT_SECRET` lemah (hanya menolak literal string `'change-me'`)
- Refresh-token rotation tidak atomik
- Enumerasi pengguna melalui login API (perbedaan waktu respons 401/403 yang jelas)
- Password `password123` tersebar di data seed
- Token akses dikembalikan di JSON body — mengalahkan proteksi cookie `httpOnly`
- CSRF skip pada `/auth/refresh` dan menerima request tanpa `Origin`/`Referer`

### 3. Dokumentasi vs Produksi

- PostgreSQL 18 di development, PostgreSQL 17 di produksi & CI (versi tidak konsisten)
- Memori API: 256M dialokasikan vs 512M yang didokumentasikan
- Retensi backup: 7 hari di deploy vs 30 hari di dokumentasi
- `RATE_LIMIT_DISABLED=true` sebagai default
- `IMAGE_OWNER=h4nzs` vs `.env.prod.example=ahlipanggilan` tidak sinkron

### 4. Infra Blocker pada Deploy Pertama

Tidak ada sertifikat SSL untuk subdomain Plausible → Nginx gagal start → seluruh HTTPS down. Cron perpanjangan cert tidak terpasang (Let's Encrypt kadaluarsa 90 hari).

Secara keseluruhan, fitur bisnis inti MVP (pemesanan, corporate, partner, CMS, SEO suite, content lock) sudah fungsional. Namun platform ini belum siap dipindahkan ke domain publik secara permanen.

---

## 2. Pas 1: Arsitektur

| Metrik                  | Didokumentasikan                     | Aktual                                                                                                           |
| ----------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Package (AGENTS.md)     | 6                                    | 8 (analytics, cli tidak terdokumentasi)                                                                          |
| Business logic boundary | "Hanya di Hono API"                  | Ditemukan di shared helpers partial borderless                                                                   |
| `output: 'server'`      | Hybrid / Static First                | Semua SSR (0 pages `prerender: true`)                                                                            |
| ADR 0002 compliance     | Homepage/Service/Blog = SSG          | Semua dipaksa SSR                                                                                                |
| Redis dependency        | Non-critical (gradeful fallback)     | 100% fallback in-memory karena `lazyConnect: true` tanpa `.connect()`                                            |
| Package boundary        | DB/shared/validation/types/ui/config | analytics punya scope `@spesialis/` tidak konsisten, `packages/config/README.md` klaim subpackage yang tidak ada |

### Temuan

#### ARCH-1 — Seluruh halaman publik melanggar ADR 0002 (semua SSR, tidak ada SSG)

- **Lokasi:** `apps/web/astro.config.mjs:21`
- **Masalah:** `output: 'server'` + 0 halaman `export const prerender = true`. ADR 0002 menetapkan: Homepage → SSG, Service Detail → SSG, Blog → SSG, Dashboard → SSR, Booking → SSR.
- **Mengapa penting:** Seluruh halaman publik (homepage, service detail, blog, FAQ, tentang-kami, kontak) dirender ulang setiap permintaan. Target LCP <2.5s dan TTFB <500ms tidak dapat tercapai karena setiap hit mengeksekusi 3-5 fetch API secara live. Ini adalah pelanggaran kontrak arsitektur paling fundamental.
- **Dampak:** Semua target Lighthouse Performance >90 tidak mungkin tercapai tanpa perbaikan ini.
- **Severitas:** **Blocker**
- **Referensi dokumentasi:** `docs/adr/0002-use-astro.md`
- **Solusi:** Ubah `output: 'hybrid'`; set `prerender = true` pada homepage, service, blog, FAQ, CMS pages; gunakan `getStaticPaths()` untuk halaman dinamis (service/[slug], blog/[slug]); trigger rebuild via `pages/api/revalidate.ts` saat admin mengupdate konten.
- **Estimasi effort:** 2-4 hari
- **Dampak produksi:** Eliminasi 100% render-time API fetch pada homepage dan halaman publik; target LCP <2.5s baru mungkin tercapai.

#### ARCH-2 — Tidak ada pemisahan layer Astro ↔ React yang tegas

- **Lokasi:** `astro.config.mjs:21` (`output: 'server'`)
- **Masalah:** AGENTS.md menyatakan "Static First → SSR when needed → React only for interactivity" namun `output: 'server'` membuat semua halaman SSR. Dashboard menggunakan `client:load` secara universal (75 dari 77 halaman dashboard) yang menghidrasi semua pulau React secara eager.
- **Mengapa penting:** Filosofi "Island Architecture" Astro tidak dimanfaatkan. Hydrasi eager pada komponen besar (DispatcherOverview 907 baris, ServiceExplorer 801 baris) membebani main thread tanpa alasan bisnis.
- **Severitas:** **Critical**
- **Solusi:** Dashboard: gunakan `client:idle` atau `client:visible` untuk komponen non-kritis. Pindahkan logika bisnis dari komponen React ke server-side Astro.
- **Estimasi:** 2-3 hari
- **Dampak produksi:** TTI dashboard membaik signifikan; CLS lebih rendah.

#### ARCH-3 — Package analytics menggunakan scope `@spesialis/` tidak konsisten dengan `@ahlipanggilan/`

- **Lokasi:** `packages/analytics/package.json:2`
- **Masalah:** Seluruh package inti menggunakan `@ahlipanggilan/*`, kecuali analytics yang memakai `@spesialis/analytics`. Storage key juga menggunakan prefix `@spesialis/analytics/queue`.
- **Mengapa penting:** Inkonsistensi namespace menimbulkan kebingungan saat instalasi, import, dan publikasi package. Analytics digunakan oleh halaman publik dan dashboard.
- **Severitas:** **High**
- **Solusi:** Rename ke `@ahlipanggilan/analytics`; update seluruh 8+ file consumer dan localStorage key prefix.
- **Estimasi:** 2 jam (rename mekanis) + 1 hari (migrasi localStorage key)
- **Dampak produksi:** Medium — mempengaruhi cache localStorage pengguna existing.

#### ARCH-4 — `packages/config/README.md` mengklaim 6 sub-package, hanya 2 yang ada

- **Lokasi:** `packages/config/README.md:11-35`
- **Masalah:** README menyebutkan direktori `eslint/`, `prettier/`, `tailwind/`, `typescript/`, `env/`. Hanya `eslint/` dan `typescript/` yang benar-benar ada. Konfigurasi Prettier ada di root `.prettierrc`, Tailwind di `apps/web`.
- **Severitas:** **Low**
- **Solusi:** Update README atau pindahkan konfigurasi ke dalam package config.

#### ARCH-5 — UI package mengimpor langsung dari `@ahlipanggilan/shared` (melanggar batas)

- **Lokasi:** `packages/ui/src/components/MediaBrowser.tsx:2`
- **Masalah:** `import { createBrowserClient } from '@ahlipanggilan/shared';` — komponen UI yang harusnya reusable sekarang terikat ke API client spesifik. Tidak bisa digunakan tanpa shared package.
- **Severitas:** **Medium**
- **Solusi:** Accept `fetcher` prop; biarkan consumer yang wiring endpoint-nya.

#### ARCH-6 — Tidak ada enforcement lint untuk batas antar package

- **Lokasi:** `packages/config/eslint/base.js`
- **Masalah:** Tidak ada aturan `import/no-restricted-paths` yang mencegah UI mengimpor database/api. Convention-based enforcement saja, tidak terverifikasi alat.
- **Severitas:** **Medium**
- **Solusi:** Tambahkan `eslint-plugin-import` dengan `no-restricted-paths`.

#### ARCH-7 — `tsconfig.json` override `exactOptionalPropertyTypes` menjadi `false` (melonggarkan strict)

- **Lokasi:** `tsconfig.json:7`, `packages/config/typescript/base.json:8`
- **Masalah:** Base config menetapkan `exactOptionalPropertyTypes: true` (strict mode penuh), root tsconfig override ke `false`. Analytics juga override ke `false`.
- **Severitas:** **Medium**
- **Solusi:** Hapus override atau tetapkan false di base. Inkonsistensi ini menyebabkan perbedaan perilaku type-checking antar package.

#### ARCH-8 — Analytics package menggunakan TypeScript `^5.7.0` vs monorepo `^6.0.3`

- **Lokasi:** `packages/analytics/package.json:37`
- **Masalah:** Target `ES2022` berbeda dengan `ES2023` di base config. Cross-package type inference bisa gagal.
- **Severitas:** **Critical**
- **Solusi:** Bump ke TypeScript `^6.0.3`, target `ES2023`. Fix resulting type errors.
- **Estimasi:** 1-2 hari

---

## 3. Pas 2: Database

### Statistik

| Metrik                                           | Didokumentasikan    | Aktual                               |
| ------------------------------------------------ | ------------------- | ------------------------------------ |
| File skema                                       | 34                  | 43                                   |
| Tabel dengan `createdBy`/`updatedBy`/`deletedBy` | Semua               | Hanya 2/43 (contracts, invoices)     |
| Tabel dengan soft delete (`deletedAt`)           | Semua               | 16/43                                |
| Trigger `BEFORE UPDATE` untuk `updated_at`       | Implisit            | **0**                                |
| File migrasi                                     | -                   | 28 (gap di 0024)                     |
| Meta snapshot                                    | 28                  | 21 (hilang: 0018–0023 + 0026)        |
| Duplikasi tag migrasi                            | 0                   | 1 (0020 muncul 2×)                   |
| Backup script                                    | `scripts/backup.sh` | Ada di root, tapi format tidak cocok |
| FK dengan `onDelete` eksplisit                   | -                   | 27/33 (6 default ke NO ACTION)       |
| CHECK constraint pada state machine              | -                   | **0**                                |

### Temuan Detil

#### DB-1 (BLOCKER) — Meta snapshot Drizzle hilang untuk migrasi 0018–0023 + 0026

- **Lokasi:** `packages/database/migrations/meta/` — hanya `0000`–`0017`, `0025`, `0027`, `0028` yang ada
- **Masalah:** Snapshot state file hilang untuk 7 migrasi. `drizzle-kit generate` berikutnya akan diff terhadap snapshot `0017` atau `0025`, menghasilkan migrasi yang membuat ulang objek yang sudah ada. Bukti: `0025_closed_sir_ram.sql` membuat ulang `coverage_areas` dan `service_suggestions` dengan `IF NOT EXISTS`.
- **Mengapa penting:** Toolchain migrasi sudah dalam drift. Urutan upgrade produksi rapuh.
- **Severitas:** **Blocker**
- **Referensi dokumentasi:** `AGENTS.md` — "Manual production changes forbidden; all via migrations"
- **Solusi:** Dari database yang cocok dengan skema saat ini, jalankan `drizzle-kit introspect` → diff → regenerasi baseline snapshot bersih. Audit `_journal.json` untuk menghapus entri duplikat 0020.
- **Estimasi effort:** 1–2 hari
- **Dampak produksi:** Tanpa perbaikan, migrasi berikutnya menghasilkan duplikasi objek CREATE TABLE.

#### DB-2 (BLOCKER) — Tag migrasi `0020_*` duplikat (non-deterministik urutan eksekusi)

- **Lokasi:** `packages/database/migrations/0020_change_services_base_price_to_text.sql` dan `0020_add_service_suggestions.sql`
- **Masalah:** Dua file migrasi berbeda berbagi prefix `0020_`. Journal memiliki `idx: 20` → `change_services_base_price_to_text` dan `idx: 22` → `add_service_suggestions`. Urutan filesystem (alphabetic) menghasilkan `add_service_suggestions` berjalan lebih dulu. Dua runner migrasi bisa menghasilkan skema DB berbeda.
- **Severitas:** **Blocker**
- **Solusi:** Rename satu file ke `0024_*`, update `_journal.json`. Verifikasi `drizzle-kit migrate --list` menunjukkan urutan deterministik.
- **Estimasi:** 1 jam

#### DB-3 (BLOCKER) — Backup script format tidak kompatibel — restore akan gagal

- **Lokasi:** `scripts/backup.sh:37-42` + `docs/architecture/deployment.md:288-289`
- **Masalah:** `scripts/backup.sh` menggunakan `pg_dump --format=custom --compress=9` (format binary proprietary PostgreSQL, biasanya berekstensi `.backup`). File output diberi nama `.sql.gz`. Dokumentasi restore menggunakan `gunzip -c | psql` — perintah ini akan gagal karena file binary tidak bisa di-decompress dengan gzip dan tidak bisa di-parse oleh psql.
- **Mengapa penting:** Satu-satunya tes keberhasilan backup adalah ketika benar-benar perlu restore — dan saat itu, prosedur yang didokumentasikan akan gagal di produksi. Kemungkinan besar belum pernah diuji end-to-end.
- **Severitas:** **Blocker**
- **Solusi:** Ubah ke `--format=plain --compress=9` agar kompatibel dengan `gunzip -c | psql`, atau ubah ekstensi output ke `.backup` dan dokumentasi restore ke `pg_restore`.
- **Estimasi:** 30 menit implementasi + 1 jam uji end-to-end
- **Dampak produksi:** Katastropik jika restore dilakukan saat insiden.

#### DB-4 (CRITICAL) — Audit fields `createdBy`/`updatedBy`/`deletedBy` hilang di 41/43 tabel

- **Lokasi:** 41 file skema di `packages/database/src/schema/` — hanya `contracts.ts:31-32` dan `invoices.ts:21-22` yang mendeklarasikan `createdBy`/`updatedBy`. **Tidak ada satu pun tabel** yang mendeklarasikan `deletedBy`.
- **Masalah:** Dokumentasi AGENTS.md menetapkan: "Audit fields on all tables: created_at, updated_at, deleted_at, created_by, updated_by, deleted_by". Realita: field siapa yang membuat/mengedit/menghapus tidak ada di 95% tabel.
- **Mengapa penting:** Untuk platform RBAC dengan 8 role dan tabel `audit_logs`, ketidakmampuan menjawab "siapa yang membuat / terakhir mengedit / soft-delete baris ini" menghancurkan kemampuan forensik. Kegagalan kepatuhan terhadap UU PDP dan GDPR.
- **Severitas:** **Critical**
- **Solusi:** Tambahkan `createdBy`, `updatedBy`, `deletedBy` UUID columns referencing `users.id` pada semua 43 tabel. Backfill via migrasi dengan `NULL` default.
- **Estimasi:** 2–3 hari
- **Dampak produksi:** Setiap tabel tumbuh 3 kolom; forensik produksi saat ini buta total.

#### DB-5 (CRITICAL) — Soft delete `deletedAt` hilang di 27/43 tabel

- **Lokasi:** 27 tabel termasuk `order_items`, `assignments`, `payments`, `reviews`, `complaints`, `notifications`, `audit_logs`, `media`, `seo_metadata`, `system_settings`, `order_status_history`, `partner_documents`, dll.
- **Masalah:** Dokumentasi AGENTS.md: "Soft delete via `deleted_at`". Hampir 2/3 tabel tidak mendukungnya. Record `payment` atau `assignment` yang dibuat hanya bisa di-hard-DELETE.
- **Mengapa penting:** Record finansial dan operasional tidak bisa memenuhi "auditable deletion" — regulasi keuangan Indonesia mensyaratkan retensi 10 tahun untuk record pembayaran. Hard-DELETE pada `payments` melanggar ini.
- **Severitas:** **Critical**
- **Solusi:** Tambahkan `deletedAt timestamp` (nullable) ke 27 tabel. Terutama urgent: `payments`, `assignments`, `reviews`, `complaints`, `partner_documents`.
- **Estimasi:** 1–2 jam skema + 1 jam migrasi (batch ALTER tunggal)
- **Dampak produksi:** Hapus permanen tidak dapat dipulihkan; data keuangan tidak compliant.

#### DB-6 (CRITICAL) — Tidak ada trigger `BEFORE UPDATE` untuk mempertahankan `updated_at`

- **Lokasi:** Pencarian di `migrations/*.sql` untuk `CREATE.*TRIGGER`, `BEFORE UPDATE`, `set updated_at` — **tidak ditemukan**
- **Masalah:** `updatedAt: timestamp('updated_at').defaultNow().notNull()` hanya mengatur `updated_at` saat INSERT. Tanpa trigger DB, nilai tidak pernah otomatis diperbarui. Kode aplikasi harus ingat memanggil `.set({ updatedAt: new Date() })` di setiap UPDATE — hanya satu tempat yang melakukannya (`apps/api/src/middleware/redirect-check.ts:31`).
- **Mengapa penting:** Sebagian besar jalur update kemungkinan lupa set eksplisit. `updated_at` akan salah di hampir semua tabel — mengikis setiap UI "terakhir diperbarui", setiap strategi cache invalidation, dan setiap laporan audit.
- **Severitas:** **Critical**
- **Solusi:** Tambahkan fungsi PL/pgSQL `set_updated_at()` + trigger `BEFORE UPDATE` di setiap tabel yang memiliki `updated_at`.
- **Estimasi:** 1 hari
- **Dampak produksi:** Semua nilai `updated_at` yang ada mungkin salah, perlu backfill manual.

#### DB-7 (CRITICAL) — Seed-admin menggunakan default `password123` yang lemah

- **Lokasi:** `apps/api/src/seeds/seed-admin.ts:29` — `const password = process.env['ADMIN_PASSWORD'] ?? 'password123';`
- **Masalah:** Jika operator menjalankan `db:seed-admin` tanpa `ADMIN_PASSWORD`, mereka mendapatkan admin dengan password `password123`. Password dicetak plaintext ke log (baris 43, 67).
- **Mengapa penting:** Password super_admin yang bisa ditebak = pengambilalihan platform penuh. Siapa pun dengan akses log melihat password.
- **Severitas:** **Critical**
- **Solusi:** Hapus fallback; tolak jalankan jika env var tidak diatur; generate password acak dan cetak SEKALI.
- **Estimasi:** 15 menit
- **Dampak produksi:** Menutup celah CVE-class.

#### DB-8 (CRITICAL) — Seed `index.ts` menjalankan `TRUNCATE TABLE...RESTART IDENTITY CASCADE` tanpa guard

- **Lokasi:** `apps/api/src/seeds/index.ts:35-44` dan `seed-data.ts:34-40`
- **Masalah:** Seed menghapus SEMUA data produksi sebelum insert ulang. Tidak ada guard `NODE_ENV !== 'production'`, tidak ada konfirmasi prompt. Menjalankan `pnpm db:seed` terhadap produksi = kehilangan data total.
- **Severitas:** **Critical**
- **Solusi:** Assert `process.env.NODE_ENV !== 'production'` di awal `main()`; tambahkan countdown 5 detik; cetak daftar tabel dan DB URL yang akan ditindak.
- **Estimasi:** 30 menit

#### DB-9 (HIGH) — `is_active` diketik sebagai `varchar(20) DEFAULT 'true'` pada 4 tabel

- **Lokasi:** `faq.ts:9`, `coverage-areas.ts:8`, `cms-testimonials.ts:12`, `blog-ads.ts:10`
- **Masalah:** Boolean disimpan sebagai string. Konsumen membaca string `'true'`/`'false'` alih-alih boolean JSON. `WHERE is_active = TRUE` gagal.
- **Severitas:** **High**
- **Solusi:** Migrasi `ALTER COLUMN is_active TYPE boolean USING is_active = 'true'`; ubah skema ke `boolean('is_active').default(true)`.
- **Estimasi:** 1 jam
- **Dampak produksi:** Bug silent di admin tooling.

#### DB-10 (HIGH) — 6 kolom UUID orphan tanpa deklarasi `.references()`

- **Lokasi:** `customer-profiles.ts:13`, `partner-profiles.ts:26-27`, `companies.ts:14`, `payments.ts:17`, `partner-documents.ts:12`, `corporate-inquiries.ts:15`
- **Masalah:** Kolom seperti `ktpMediaId`, `profilePhotoId`, `proofMediaId`, `handledBy` adalah UUID polos tanpa FK constraint. Jika record media dihapus, referensi menjadi orphan.
- **Severitas:** **High**
- **Solusi:** Tambahkan `.references(() => media.id, { onDelete: 'set null' })`; bersihkan data orphan terlebih dahulu.
- **Estimasi:** 1 hari

#### DB-11 (HIGH) — 16 tabel tanpa Drizzle relations didefinisikan

- **Lokasi:** `packages/database/src/schema/relations.ts`
- **Masalah:** Tabel seperti `addresses`, `seo_metadata`, `system_settings`, `corporate_inquiries`, `resource_locks`, dll. tidak memiliki entri relations. Developer terpaksa menulis manual join, meningkatkan risiko N+1.
- **Severitas:** **High**
- **Solusi:** Tambahkan entri relations untuk setiap FK yang ada.
- **Estimasi:** 1–2 jam

#### DB-12 (HIGH) — `refreshTokensRelations` dan `passwordResetsRelations` didefinisikan tapi TIDAK diekspor

- **Lokasi:** `packages/database/src/schema/relations.ts:168-174` (didefinisikan); `index.ts:65-72` (TIDAK dalam daftar re-export)
- **Masalah:** `db.query.refreshTokens.with.user` akan gagal runtime karena relations tidak ditemukan.
- **Severitas:** **High**
- **Solusi:** Tambahkan `refreshTokensRelations` dan `passwordResetsRelations` ke daftar export `index.ts`.
- **Estimasi:** 5 menit

#### DB-13 (HIGH) — Tidak ada CHECK constraint untuk `users.role`, `payments.status`, `orders.status`

- **Lokasi:** `users.ts:9-10`, `payments.ts:15`, `orders.ts:25`
- **Masalah:** Semua kolom status/role hanya menggunakan `$type<>()` TypeScript-only. Tidak ada constraint DB. Siapa pun dengan akses SQL bisa `UPDATE users SET role = 'super_admin'`.
- **Severitas:** **Critical**
- **Solusi:** Tambahkan `CHECK (role IN (...))`, `CHECK (status IN (...))` constraint untuk setiap kolom kritis.
- **Estimasi:** 1 hari
- **Dampak produksi:** Menutup permukaan paling eksploitable di database.

#### DB-14 (HIGH) — Migration `0016` booking_number_seq `CACHE 1` — bottleneck kontensi

- **Lokasi:** `packages/database/migrations/0016_add_booking_sequence.sql:16-21`
- **Masalah:** `CACHE 1` memaksa setiap panggilan `nextval()` melakukan synchronous disk write. Di bawah traffic pemesanan konkuren (flash sale / marketing blast), ini menjadi bottleneck.
- **Severitas:** **High**
- **Solusi:** Ubah ke `CACHE 50` atau `CACHE 100`.
- **Estimasi:** 15 menit
- **Dampak produksi:** Throughput pemesanan konkuren terbatas parah.

#### DB-15 (HIGH) — Indeks redundant menduplikasi indeks UNIQUE constraint

- **Lokasi:** `cms-pages.ts:17`, `redirects.ts:26`, `page-errors.ts:16`, `articles.ts:52`
- **Masalah:** Empat indeks `btree` eksplisit menduplikasi indeks unique implisit. Pemborosan disk dan overhead maintenance.
- **Severitas:** **Low** (masalah penyimpanan/kinerja tulis)
- **Solusi:** Hapus indeks redundant; andalkan indeks unique implisit.
- **Estimasi:** 15 menit + 1 migrasi DROP INDEX

#### DB-16 (HIGH) — Indeks hilang di kolom status/filter kritis

- **Lokasi:** `orders.ts:25` (status), `assignments.ts:16` (status), `payments.ts:15` (status), `partner-profiles.ts:36-39` (verification_status, availability), `users.ts:9-10` (role, status)
- **Masalah:** Kolom yang paling sering difilter dashboard (status pemesanan, status partner) tidak diindeks.
- **Severitas:** **Medium**
- **Solusi:** Tambahkan indeks pada kolom status untuk setiap tabel utama.
- **Estimasi:** 30 menit + 1 migrasi

#### DB-17 — `partner_skills` tanpa UNIQUE constraint pada `(partner_id, category_id)`

- **Lokasi:** `partner-skills.ts:5-22`
- **Masalah:** Dua INSERT identik menghasilkan duplikasi skill yang sama. Metrik kapasitas skill menjadi tidak akurat.
- **Severitas:** **Medium**
- **Solusi:** Tambahkan `unique('uq_partner_skills_partner_category').on(table.partnerId, table.categoryId)`.

#### DB-18 (HIGH) — `seo_metadata` tanpa UNIQUE pada `(entity_type, entity_id)` dan tanpa indeks

- **Lokasi:** `seo-metadata.ts:3-18`
- **Masalah:** Multiple rows per entity bisa diinsert; setiap lookup adalah table-scan.
- **Severitas:** **High**
- **Solusi:** Tambahkan `unique('uq_seo_metadata_entity').on(table.entityType, table.entityId)`.

#### DB-19 (CRITICAL) — `audit_logs` tidak memiliki trigger proteksi immutability

- **Lokasi:** `packages/database/src/schema/audit-logs.ts:4-23` — tidak ada trigger, tidak ada revoke grants
- **Masalah:** Dokumentasi AGENTS.md menyatakan "Audit log immutable". Tapi user aplikasi memiliki CRUD penuh pada `audit_logs`. `db.update(auditLogs)` atau `db.delete(auditLogs)` akan berhasil tanpa hambatan.
- **Mengapa penting:** Integritas forensik platform finansial bergantung pada audit log yang tamper-evident. Dengan admin account takeover, penyerang bisa menulis ulang sejarah.
- **Severitas:** **Critical** (keamanan)
- **Solusi:** Migrasi SQL: `CREATE FUNCTION prevent_audit_mutation()` + `CREATE TRIGGER audit_no_update BEFORE UPDATE` + `CREATE TRIGGER audit_no_delete BEFORE DELETE`. Revoke UPDATE/DELETE dari role aplikasi.
- **Estimasi:** 1 hari
- **Dampak produksi:** Mengubah "audit log" menjadi catatan tamper-evident sejati.

---

## 4. Pas 3: Backend (Hono API)

### Statistik

| Metrik                        | Didokumentasikan                                                      | Aktual                                                                    |
| ----------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| File rute API                 | 67                                                                    | 45 (44 router + index.ts mounter)                                         |
| Jumlah endpoint               | 80+                                                                   | 208                                                                       |
| Response envelope             | `{success, message, data}` / `{success:false, code, message, errors}` | Konsisten di sebagian besar, inkonsisten di beberapa admin route          |
| Pagination                    | `{page, limit, total, totalPages, hasNext, hasPrev}`                  | Diimplementasikan di booking/partners/admin; TIDAK di customers           |
| Sorting (`?sort=-created_at`) | Didokumentasikan                                                      | Tidak diimplementasikan — semua endpoint hardcode `.orderBy(desc(...))`   |
| Password hashing              | Argon2id (OWASP m=19456, t=2, p=1)                                    | ✓ Benar, via `hash-wasm`                                                  |
| Redis                         | Rate limit + CMS cache + lock Pub/Sub                                 | **100% fallback in-memory** karena `lazyConnect: true` tanpa `.connect()` |
| OpenAPI/Swagger               | Didokumentasikan di api-specification.md                              | **Tidak ada** — tidak ada `zod-openapi` atau endpoint `/openapi`          |

### Temuan Detil

#### BE-1 (BLOCKER) — Redis `lazyConnect: true` tapi `.connect()` tidak pernah dipanggil

- **Lokasi:** `apps/api/src/lib/redis.ts:36-55`
- **Masalah:** Client Redis dibuat dengan `lazyConnect: true` dan `enableOfflineQueue: false`, tapi `await instance.connect()` tidak pernah dipanggil. Dengan `enableOfflineQueue: false`, ioredis akan menolak perintah pertama dengan error "Stream isn't writeable".
- **Mengapa penting:** **Setiap fitur yang bergantung pada Redis** (rate limiter, CMS cache, lock Pub/Sub) **selalu gagal** dan jatuh ke fallback in-memory. Deployment multi-instance tidak aman: rate limit, cache, dan lock broadcast bersifat per-proses, tidak shared.
- **Severitas:** **Blocker** (produksi rusak di deploy multi-instance)
- **Solusi:** Hapus `lazyConnect: true` agar client terkoneksi pada command pertama, atau panggil `await instance.connect()` di `initClient()`.
- **Estimasi:** 30 menit + integration test dengan Redis container
- **Dampak produksi:** Semua fitur "Redis-backed" sebenarnya 100% in-memory.

#### BE-2 (BLOCKER) — Endpoint analytics tidak diautentikasi — KPI bisnis terbuka

- **Lokasi:** `apps/api/src/routes/analytics.ts:49,59,152,226`
- **Masalah:** `GET /analytics/funnels`, `POST /analytics/funnels/query`, `POST /analytics/funnels/:name`, `GET /analytics/health` — tidak ada `authMiddleware` atau `requireRole`. Klien anonim dapat POST definisi funnel dan menerima analytics agregat (revenue, conversion counts, traffic).
- **Severitas:** **Blocker**
- **Solusi:** Bungkus router dengan `authMiddleware` + `requireRole('admin', 'super_admin', 'finance')`. Validasi body dengan Zod.
- **Estimasi:** 1 jam

#### BE-3 (CRITICAL) — Refresh-token rotation tidak atomik — rentan replay attack

- **Lokasi:** `apps/api/src/routes/auth.ts:220-265`
- **Masalah:** Tiga pernyataan non-transaksional sequential: `SELECT ... WHERE revoked = false`, `UPDATE ... SET revoked = true`, `INSERT ... new token`. Tanpa `SELECT FOR UPDATE`, tanpa transaksi. Dua request konkuren dengan token yang sama bisa keduanya lolos check `revoked = false`.
- **Mengapa penting:** Penyerang yang mencuri refresh token bisa replay tanpa batas. Setiap rotasi menghasilkan dua (atau N) token penerus valid.
- **Severitas:** **Critical**
- **Solusi:** Bungkus dalam `db.transaction(async tx => { ... })` + gunakan `SELECT ... FOR UPDATE`. Atau: atomic `UPDATE ... WHERE revoked = false RETURNING *`.
- **Estimasi:** 1–2 jam
- **Dampak produksi:** Token refresh yang dicuri memiliki kemampuan replay tak terbatas.

#### BE-4 (CRITICAL) — `GET /partners` dan `GET /partners/:id` publik — kebocoran PII mitra

- **Lokasi:** `apps/api/src/routes/partners.ts:180, 504, 609, 692`
- **Masalah:** Endpoint partner hanya menggunakan `validateQuery(paginationQuerySchema)` — tidak ada `authMiddleware`. Mengembalikan `fullName`, `domicile`, `verificationStatus`. `/partners/:id/jobs` mengekspos history assignment dengan orderId dan bookingNumber.
- **Mengapa penting:** Akses publik ke registry partner adalah kebocoran PII; `jobs` mengekspos order IDs ke anonymous.
- **Severitas:** **Critical**
- **Solusi:** Tambahkan `authMiddleware` dan `requireRole`; untuk listing publik, strip field PII.
- **Estimasi:** 30 menit

#### BE-5 (CRITICAL) — Media library IDOR penuh — `GET /media`, `/:id`, `/:id/file`

- **Lokasi:** `apps/api/src/routes/media.ts:34-40, 155-173, 175-205`
- **Masalah:** (1) `GET /media` mengembalikan metadata SEMUA upload tanpa filter `uploadedBy`. (2) `GET /media/:id/file` tidak ada `authMiddleware` — siapa pun dengan UUID bisa fetch raw bytes. (3) `GET /media/:id` memerlukan auth tapi tidak cek kepemilikan. Redirect 302 ke URL publik R2 + `Cache-Control: max-age=31536000`.
- **Mengapa penting:** Payment proofs, KTP partner, dan lampiran order menjadi terbaca global. Kegagalan kepatuhan UU PDP / GDPR paling umum.
- **Severitas:** **Critical**
- **Solusi:** `GET /media` → filter `uploadedBy = userId` untuk non-admin. `GET /media/:id/file` → tambah authMiddleware + ownership check. Ganti redirect R2 publik dengan signed URL short-lived.
- **Estimasi:** 2–4 jam

#### BE-6 (CRITICAL) — `POST /payments` membiarkan partner membuat pembayaran untuk pesanan siapa pun

- **Lokasi:** `apps/api/src/routes/payments.ts:127-190`
- **Masalah:** Hanya role `customer` yang melalui ownership check (baris 144-151). Untuk `partner`, `corporate`, `dispatcher`, `finance` — tidak ada check. Partner bisa POST `{"orderId": "<any>", "method": "Cash", "amount": 1}`.
- **Mengapa penting:** Fraud — partner malicious bisa menyuntikkan pembayaran palsu, mengunci order dengan guard `existingPayment` sehingga customer asli tidak bisa membayar.
- **Severitas:** **Critical**
- **Solusi:** Bungkus route dengan `requireRole('customer', 'admin', 'super_admin', 'finance')`.
- **Estimasi:** 30 menit

#### BE-7 (CRITICAL) — `unitPrice` menyimpan total baris, bukan harga per unit

- **Lokasi:** `apps/api/src/lib/create-order.ts:141-149`
- **Masalah:** `const unitPrice = (svc?.price ?? 0) * item.quantity;` — `unitPrice` dan `subtotal` diset ke nilai yang sama (total × quantity). Seed data menulis dengan benar (`unitPrice: item.unitPrice` dan `subtotal: item.unitPrice * item.quantity`). **Makna kolom berbeda tergantung code path yang membuatnya.**
- **Mengapa penting:** Konsumen downstream (invoice PDF, rekonsiliasi finance) yang menghitung `unitPrice × quantity` akan menggandakan total untuk order yang dibuat lewat jalur produksi.
- **Severitas:** **Critical**
- **Solusi:** `unitPrice = svc?.price ?? 0`, `subtotal = unitPrice * item.quantity`. Backfill baris existing ke `unit_price = subtotal / quantity`.
- **Estimasi:** 30 menit kode + backfill migration

#### BE-8 (HIGH) — Race condition (TOCTOU) pada partner assignment

- **Lokasi:** `apps/api/src/routes/bookings.ts:530-616`
- **Masalah:** SELECT order di luar transaksi, lalu UPDATE dalam transaksi tanpa `SELECT FOR UPDATE` dan tanpa `WHERE status = 'Waiting Assignment'`. Dua admin bisa assign partner yang sama secara bersamaan.
- **Severitas:** **High**
- **Solusi:** SELECT FOR UPDATE dalam transaksi, atau atomic UPDATE dengan WHERE guard.
- **Estimasi:** 1–2 jam

#### BE-9 (HIGH) — State machine pemesanan: `/confirm` cek transisi `Confirmed` tapi menulis `Waiting Assignment`

- **Lokasi:** `apps/api/src/routes/bookings.ts:464-480`
- **Masalah:** `canTransition(order.status, 'Confirmed')` tapi `tx.update(orders).set({ status: 'Waiting Assignment' })`. Transisi `Pending Confirmation → Waiting Assignment` **tidak ada** di `ORDER_STATUS_TRANSITIONS`. State `Confirmed` tidak pernah ditulis oleh endpoint manapun.
- **Severitas:** **High**
- **Solusi:** Tambahkan langkah `Confirmed` sebenarnya, atau update state map.
- **Estimasi:** 30 menit

#### BE-10 (HIGH) — `POST /payments/:id/verify` dan `refund` melewati state machine

- **Lokasi:** `apps/api/src/routes/payments.ts:319-360, 102-113`
- **Masalah:** Verify path update `orders.status = 'Paid'` tanpa `canTransition`. Refund hardcode `recordStatusHistory(payment.orderId, 'Paid', 'Cancelled')` — transisi `Paid → Cancelled` tidak diizinkan.
- **Severitas:** **High**
- **Solusi:** Panggil `canTransition` sebelum setiap penulisan `orders.status`.
- **Estimasi:** 1–2 jam

#### BE-11 (HIGH) — Customer bisa membatalkan dari `On The Way` (mitra dalam perjalanan)

- **Lokasi:** `apps/api/src/routes/bookings.ts:898-931`
- **Masalah:** Route menggunakan `canTransition(order.status, 'Cancelled')` — memungkinkan pembatalan dari `On The Way` dan `Partner Accepted`. Konstanta `CANCELLABLE_BY_CUSTOMER` ada tapi tidak pernah dipakai.
- **Severitas:** **High**
- **Solusi:** Tambahkan check `CANCELLABLE_BY_CUSTOMER.includes(order.status)` untuk role customer.
- **Estimasi:** 30 menit

#### BE-12 (HIGH) — Audit log hilang pada sebagian besar mutasi

- **Lokasi:** 38+ route files — `createAuditLog` hanya dipanggil dari 8 file rute
- **Masalah:** Tidak ada audit log untuk: auth (register/login/logout), admin articles CRUD, CMS pages, FAQ, testimonials, blog-ads, coverage-areas, service-suggestions, redirects, page-errors, SEO metadata, partners register/verify, media upload/delete, companies register, addresses CRUD, reviews create, complaints create, customers profile edit.
- **Severitas:** **High**
- **Solusi:** Tambahkan `createAuditLog` ke setiap POST/PATCH/DELETE.
- **Estimasi:** 1–2 hari

#### BE-13 (HIGH) — Audit log silent swallow failures

- **Lokasi:** `apps/api/src/lib/audit.ts:36-38` — `catch { /* non-critical */ }`
- **Masalah:** Semua kegagalan audit log gagal diam-diam. Blip konektivitas DB menghapus record audit tanpa peringatan apa pun.
- **Severitas:** **High**
- **Solusi:** Minimal `console.error` failure dengan `traceId`; lebih baik: enqueue ke retry queue.

#### BE-14 (HIGH) — Hard DELETE melanggar "semua soft delete via deleted_at"

- **Lokasi:** 10+ route files menggunakan `db.delete(...)` — `media.ts:221`, `seo.ts:94`, `admin/articles.ts:128`, `admin/coverage-areas.ts:92`, `admin/redirects.ts:136`, `companies.ts:385`, `partners.ts:355,500`
- **Mengapa penting:** Tidak ada recovery dari accidental admin delete; tidak ada preservasi FK.
- **Severitas:** **High**
- **Solusi:** Ganti dengan `db.update(X).set({ deletedAt: new Date() })`.

#### BE-15 (HIGH) — Tidak ada kompresi middleware Hono

- **Lokasi:** `apps/api/src/index.ts` — tidak ada `import { compress } from 'hono/compress'`
- **Masalah:** API response >10 KB dikirim tanpa kompresi. Nginx mungkin mengkompresi, tapi defense-in-depth kosong.
- **Severitas:** **Medium**
- **Solusi:** Tambah `app.use(compress())`.

#### BE-16 (HIGH) — Tidak ada `bodyLimit` middleware — upload gagal >100 KiB

- **Lokasi:** `apps/api/src/index.ts` — tidak ada `bodyLimit` import; `routes/media.ts:92` menggunakan `c.req.parseBody()`
- **Masalah:** Default Hono body limit 100 KiB untuk `c.req.json()`. Upload 1 MiB gagal sebelum mencapai `isWithinSizeLimit`.
- **Severitas:** **Medium**
- **Solusi:** `import { bodyLimit } from 'hono/body-limit'` + `app.use('*', bodyLimit({ fileSize: 10 * 1024 * 1024 }))`.

#### BE-17 (MEDIUM) — Enum akun melalui timing login 401 vs 403

- **Lokasi:** `apps/api/src/routes/auth.ts:188-194`
- **Masalah:** Login: email tidak ditemukan → 401, email ditemukan tapi status blocked → 403. Blocked account skip Argon2id (~120ms) sehingga timing differential terdeteksi.
- **Severitas:** **Critical** (keamanan)
- **Solusi:** Selalu jalankan Argon2id (atau dummy hash); kembalikan kode error yang sama untuk semua kasus (401).

#### BE-18 (MEDIUM) — Sorting tidak diimplementasikan meski documented

- **Lokasi:** Semua list endpoint — hardcode `.orderBy(desc(...))`
- **Masalah:** Dokumentasi API menyatakan `?sort=-created_at`. Tidak ada endpoint yang meng-parse query param ini.
- **Severitas:** **Medium**
- **Solusi:** Tambahkan helper `parseSort` ke `lib/pagination.ts`.

#### BE-19 (MEDIUM) — `GET /customers` admin endpoint tanpa pagination

- **Lokasi:** `apps/api/src/routes/customers.ts:60-76`
- **Masalah:** Mengembalikan SEMUA customer (email, phone, fullName, status) tanpa LIMIT. Untuk >10K customer ini akan OOM.
- **Severitas:** **High**
- **Solusi:** Tambahkan pagination dan batasi `limit` maksimum.

#### BE-20 (MEDIUM) — `limit` query parameter tidak dibatasi di sebagian besar list endpoint

- **Lokasi:** `routes/bookings.ts:293`, `routes/services.ts:13`, `admin/articles.ts:138`
- **Masalah:** `?limit=100000` memaksa API mematerialisasi 100K baris.
- **Severitas:** **Medium**
- **Solusi:** Cap di 100 atau 200 di setiap route list; gunakan `Math.min(limit, 100)`.

#### BE-21 (MEDIUM) — Nomor invoice/kontrak tidak atomik (race condition)

- **Lokasi:** `apps/api/src/routes/invoices.ts:17-27`, `routes/contracts.ts:25-35`
- **Masalah:** `SELECT COALESCE(MAX(...), 0) + 1` — dua pemanggilan konkuren menghitung `MAX()+1` yang sama. Bandingkan dengan `booking-number.ts:23-25` yang menggunakan `nextval('booking_number_seq')` secara atomik.
- **Severitas:** **Medium**
- **Solusi:** Gunakan sequence PostgreSQL, bukan MAX()+1.

#### BE-22 (LOW) — `any` types di storage.ts dengan eslint-disable

- **Lokasi:** `apps/api/src/lib/storage.ts:27-28, 41-42, 92-93`
- **Masalah:** `// eslint-disable-next-line @typescript-eslint/no-explicit-any` digunakan 3×. Melanggar AGENTS.md "No `any`".
- **Severitas:** **Low**
- **Solusi:** Gunakan `import type { S3Client } from '@aws-sdk/client-s3'`.

#### BE-23 (LOW) — File rute melanggar batas ukuran utility 100 baris

- **Lokasi:** `routes/admin/articles.ts` (1050 baris), `routes/bookings.ts` (970 baris), `routes/partners.ts` (707 baris)
- **Masalah:** AGENTS.md menetapkan max page 300, utility 100. File rute melebihi batas komponen/page.
- **Solusi:** Split menjadi sub-rute per domain.

#### BE-24 (LOW) — Health check tidak verifikasi Redis

- **Lokasi:** `apps/api/src/routes/health.ts:8-27`
- **Masalah:** Hanya DB ping yang dicek. Redis outage tidak terdeteksi oleh health probe.
- **Solusi:** Tambahkan `getRedis().ping()` best-effort check.

---

## 5. Pas 4: Frontend (Astro + React)

### Statistik

| Metrik                     | Didokumentasikan      | Aktual                 |
| -------------------------- | --------------------- | ---------------------- |
| Halaman Astro total        | 62                    | 89                     |
| Halaman dashboard          | 62                    | 64                     |
| Komponen UI shared         | 106+                  | 45                     |
| `output` mode              | Static First          | `'server'` (semua SSR) |
| Halaman `prerender = true` | Homepage/Service/Blog | **0 (nol)**            |
| `client:load` usage        | -                     | 75 halaman             |
| `client:idle` usage        | -                     | 2 halaman              |
| `client:visible` usage     | -                     | 2 halaman              |
| `React.lazy()` usage       | -                     | 3 (tiga)               |
| `<ErrorBoundary>`          | -                     | **0 (nol)**            |
| `aria-live`/`role="alert"` | -                     | **0 (nol)**            |
| Komponen >200 baris        | Maks 200              | 41 komponen            |
| Komponen >500 baris        | -                     | 13 komponen            |

### Temuan Detil

#### FE-1 (BLOCKER) — Seluruh halaman kunci publik dirender SSR, melanggar ADR 0002

- **Lokasi:** `apps/web/astro.config.mjs:21` — `output: 'server'`
- **Halaman terdampak:** `index.astro` (homepage), `services/[slug].astro`, `blog.astro`, `blog/[slug].astro`, `services.astro`, `faq.astro`, `tentang-kami.astro`, `syarat-ketentuan.astro`, `kebijakan-privasi.astro`, `kontak.astro`
- **Masalah:** 0 halaman memiliki `export const prerender = true`. ADR 0002 menetapkan: Homepage/Service/Blog = SSG. Akibat: homepage mengeksekusi 3 fetch API live per permintaan, service detail mengeksekusi 5 fetch, blog detail mengeksekusi 2 fetch.
- **Mengapa penting:** LCP <2.5s dan TTFB <500ms tidak mungkin tercapai. Setiap hit homepage cold memerlukan 3× API round-trip sebelum HTML bisa dikirim. Ini nullifies seluruh keunggulan "Static First" Astro.
- **Severitas:** **Blocker** (5 halaman: homepage + service/[slug] + blog index + blog/[slug] + service index)
- **Solusi:** Ubah ke `output: 'hybrid'`; set `prerender = true` pada halaman publik; gunakan `getStaticPaths()` untuk halaman dinamis; trigger rebuild via `pages/api/revalidate.ts`.
- **Estimasi:** 2-4 hari
- **Dampak produksi:** Eliminasi 100% API fetch saat render homepage; target LCP <2.5s baru mungkin tercapai.

#### FE-2 (BLOCKER) — Pelanggaran Rules of Hooks di `useLockPolling.ts` — `useRef` bersyarat

- **Lokasi:** `apps/web/src/lib/useLockPolling.ts:30`
- **Masalah:** `const client = api ?? useRef(createBrowserClient()).current;` — `useRef` dipanggil hanya jika `api` null/undefined. Ini melanggar Rules of Hooks React (hook tidak boleh dipanggil secara bersyarat). Jika caller mengoper `api` pada beberapa render dan tidak pada render lain, React akan throw "Rendered more hooks than during the previous render".
- **Severitas:** **Blocker**
- **Solusi:** `const clientRef = useRef<ApiClient | null>(null); if (!clientRef.current) clientRef.current = api ?? createBrowserClient();`
- **Estimasi:** 10 menit
- **Dampak produksi:** Mencegah crash React runtime intermiten.

#### FE-3 (BLOCKER) — 17+ lokasi hardcoded `fetch()` mem-bypass shared API client

- **Lokasi:** `pages/index.astro:48-50` (3 fetch), `pages/services/[slug].astro:25-69` (5 fetch), `pages/services.astro:6,17`, `pages/blog.astro:21,28`, `pages/blog/[slug].astro:35,41`, `pages/faq.astro:10,16`, `pages/tentang-kami.astro:17,22`, `pages/kontak.astro:11,16,36`, `pages/syarat-ketentuan.astro:15,20`, `pages/kebijakan-privasi.astro:15,20`, `pages/partner.astro:76-77`, `layouts/BaseLayout.astro:48,51`, `components/homepage/FAQSection.astro:46,50`, `components/homepage/Testimonials.astro:42`, `components/AuthNav.tsx:68`, `components/services/ServiceDetail.tsx:47`, `components/homepage/ServiceExplorer.tsx:566`, `components/BookingForm.tsx:127`, `middleware.ts:27-29`
- **Masalah:** AGENTS.md mandate: "jangan hardcode endpoint; use API Client". 17+ lokasi menggunakan `fetch()` langsung dengan URL template `process.env.API_URL ?? process.env.PUBLIC_API_URL ?? 'http://localhost:3000'` yang diulang-ulang. Tidak ada token refresh, tidak ada typed response handling, tidak ada error normalization terpusat.
- **Severitas:** **Blocker**
- **Solusi:** Ganti semua dengan `createServerClient(token, refreshToken)` di SSR dan `getApiClient()` / `createBrowserClient()` di client.
- **Estimasi:** 4–6 jam
- **Dampak produksi:** Single source of truth untuk auth refresh, typed errors, dan observability.

#### FE-4 (CRITICAL) — 8 section homepage disembunyikan di balik `class="hidden"` + "Lihat Selengkapnya"

- **Lokasi:** `apps/web/src/pages/index.astro:141-150` + `components/homepage/Hero.astro:181-202`
- **Masalah:** FeaturedServices, Process, Statistics, Testimonials, CorporateCTA, LatestArticles, FAQSection, FinalCTA — semua dirender tapi disembunyikan dengan `class="hidden"`. Hanya muncul saat user klik "Lihat Selengkapnya".
- **Mengapa penting:** >50% konten homepage tidak terlihat pada first view. SEO/AEO: FAQPage JSON-LD tersembunyi sampai interaksi. Mobile user hanya melihat 4 section sebelum wajib klik. Melanggar prinsip "setiap section harus punya business purpose".
- **Severitas:** **Critical**
- **Solusi:** Render semua sections server-side; jika ingin compact hero UX, gunakan anchor-based navigation atau progressive disclosure alami.
- **Estimasi:** 1 jam
- **Dampak produksi:** Bounce rate lebih tinggi; SEO impressions berkurang; FAQPage structured data tidak efektif.

#### FE-5 (CRITICAL) — Tidak ada `<ErrorBoundary>` di seluruh aplikasi

- **Lokasi:** Pencarian `ErrorBoundary|componentDidCatch|getDerivedStateFromError` — **0 hasil**
- **Masalah:** Ketika React island throw saat render (props buruk, NaN status, race condition data), React tree menjadi white-screen. Tidak ada recovery affordance untuk user.
- **Severitas:** **Critical**
- **Solusi:** Implement `<ErrorBoundary>` shared; bungkus setiap `<Component client:load />` dan `client:visible` dengannya.
- **Estimasi:** 2 jam
- **Dampak produksi:** Gagal lunak menggantikan white-screen keras.

#### FE-6 (CRITICAL) — 41 komponen melanggar batas maksimum 200 baris

- **Lokasi:** 13 komponen di atas 500 baris, 28+ di atas 200 baris. Terparah: `DispatcherOverview.tsx` (907 baris), `ServiceExplorer.tsx` (801 baris), `FinanceOverview.tsx` (740 baris), `BookingForm.tsx` (729 baris), `ArticleEditor.tsx` (692 baris), `AdminPenalties.tsx` (669 baris), `CorporateOverview.tsx` (652 baris), `AdminContracts.tsx` (644 baris), `FunnelChart.tsx` (613 baris), `AdminInvoices.tsx` (611 baris), `AdminUsers.tsx` (577 baris).
- **Masalah:** AGENTS.md menetapkan maks 200 baris per komponen. File 800+ baris menjadi unit review yang tidak terbaca, melambatkan velocity dan meningkatkan risiko regresi.
- **Severitas:** **Critical** (5 file di atas 650 baris)
- **Solusi:** Split setiap komponen oversized menjadi presentational + container sub-komponen.
- **Estimasi:** 15–25 hari-insinyur
- **Dampak produksi:** Velocity code review, biaya onboarding, latency perbaikan bug.

#### FE-7 (HIGH) — 75 halaman dashboard menggunakan `client:load` (eager hydration)

- **Lokasi:** 75 halaman di `apps/web/src/pages/dashboard/**/*.astro`
- **Masalah:** Setiap komponen React di dashboard dihidrasi secara eager, memuat full React + dependencies sebelum interaksi user. Hanya 2 halaman menggunakan `client:idle`, 2 halaman `client:visible`.
- **Severitas:** **High**
- **Solusi:** Dashboard overview pages: `client:idle`; modal forms: `client:visible`. Hanya simpan `client:load` untuk form yang butuh interaksi segera (booking, editor).
- **Estimasi:** 30 menit per halaman

#### FE-8 (HIGH) — Empat komponen homepage orphaned — tidak pernah diimpor

- **Lokasi:** `components/homepage/Benefits.astro` (83 baris), `PartnerCTA.astro` (36 baris), `QuickServiceCategories.astro` (69 baris), `ServiceGrid.astro` (98 baris)
- **Masalah:** Komponen ada, dibuat, tapi unused. `index.astro` tidak mengimpor mereka. AGENTS.md menyebutkan "Homepage menggunakan 14+ komponen" — realita: 12 diimpor.
- **Severitas:** **Medium**
- **Solusi:** Verifikasi intent — jika dead code, hapus; jika dimaksudkan untuk homepage, tambahkan ke `index.astro`.

#### FE-9 (HIGH) — Run-time import/pemanggilan API pada komponen UI packages

- **Lokasi:** `packages/ui/src/components/MediaBrowser.tsx:2` — `import { createBrowserClient } from '@ahlipanggilan/shared'`
- **Masalah:** Komponen UI reusable hard-couple ke API client spesifik. Melanggar prinsip desain sistem reusable.
- **Severitas:** **Medium**
- **Solusi:** Accept `fetcher` prop; biarkan consumer yang wiring endpoint.

#### FE-10 (LOW) — 30+ error catch block silent (tanpa logging)

- **Lokasi:** `index.astro:75-77`, `services.astro:22-24`, `services/[slug].astro:44-46,61-63,79-82`, `sitemap.xml.ts:148`, `partner.astro:91-93`, `lockEventBus.ts:39-41,55-57,59-61`, `useLockPolling.ts:55-57`, `middleware.ts:39-41`, `BaseLayout.astro:56-58`
- **Masalah:** `try { ... } catch { /* silent */ }` — API outage hanya menampilkan grid kosong tanpa peringatan admin atau console trace.
- **Severitas:** **High**
- **Solusi:** Log ke analytics (`trackError`); surface styled error block sebagai pengganti fallback kosong.
- **Estimasi:** 2–4 jam

---

## 6. Pas 5: UI/UX

### Temuan Detil

#### UX-1 (CRITICAL) — 8 section homepage disembunyikan — mirip dengan FE-4

- **Lokasi:** `apps/web/src/pages/index.astro:141`
- **Masalah:** `<div id="homepage-content" class="hidden">` membungkus FeaturedServices, Process, Statistics, Testimonials, CorporateCTA, LatestArticles, FAQSection, FinalCTA. Semua baru muncul setelah user klik "Lihat Selengkapnya".
- **Mengapa penting:** Melanggar prinsip AGENTS.md: "every section must have a business purpose" dan "whitespace is a feature — never try to fill empty space". User mobile melihat 4 section sebelum wajib klik. FAQPage JSON-LD tidak efektif untuk SEO/AEO.
- **Severitas:** **Critical**
- **Dampak:** Bounce rate, conversion rate, SEO impressions — semuanya terdampak negatif.

#### UX-2 (CRITICAL) — Tidak ada `aria-live` / `role="alert"` di seluruh aplikasi

- **Lokasi:** Pencarian `aria-live` dan `role="alert"` di `apps/web/src` — **0 hasil**
- **Masalah:** Error form dinamis (LoginForm, RoleManager save errors, toast notifications) tidak diumumkan ke screen reader. User dengan disabilitas visual tidak menyadari error bar atau toast.
- **Severitas:** **Critical**
- **Solusi:** Tambahkan `role="alert"` pada inline errors via shared `<FieldError>`; tambahkan `aria-live="polite"` pada Toast container.
- **Estimasi:** 4 jam
- **Dampak produksi:** Compliance aksesibilitas gagal; user disabilitas tidak mendapat feedback dinamis.

#### UX-3 (HIGH) — Tidak ada `aria-invalid` dan `aria-describedby` pada form input yang error

- **Lokasi:** `LoginForm.tsx:76-108`, `RegisterForm.tsx`, `ResetPasswordForm.tsx`, `PartnerRegistrationForm.tsx`, `BookingForm.tsx`, dll.
- **Masalah:** Field-level error hanya dirender sebagai `<p className="text-danger-500">`. Tidak ada `aria-invalid="true"` pada input, tidak ada `aria-describedby="name-error"` yang menghubungkan error ke field.
- **Severitas:** **High**
- **Solusi:** Tambahkan `aria-invalid={Boolean(error)}` dan `aria-describedby` ke setiap input; tambahkan `id` ke error paragraph.
- **Estimasi:** 1 jam per form × 9 form = ~9 jam

#### UX-4 (HIGH) — Hamburger menu tidak auto-close setelah navigasi

- **Lokasi:** `BaseLayout.astro:178-198`
- **Masalah:** Hamburger checkbox tetap checked setelah klik link. User harus klik label lagi untuk menutup — UX yang membingungkan di mobile.
- **Severitas:** **Low**
- **Solusi:** Tambahkan script inline untuk uncheck checkbox pada event click navigasi.
- **Estimasi:** 30 menit

#### UX-5 (MEDIUM) — Tidak ada dark mode token

- **Lokasi:** `apps/web/src/styles/global.css:13-364` + `BaseLayout.astro:79` — `<meta name="color-scheme" content="light" />`
- **Masalah:** Hanya light theme yang didefinisikan. Tidak ada `@media (prefers-color-scheme: dark)` dengan token override.
- **Severitas:** **Medium**
- **Solusi:** Tambahkan blok dark mode atau formal exclude dalam dokumentasi.
- **Estimasi:** 4–6 jam

#### UX-6 (POSITIVE) — Skip-link hadir dan benar

- **Lokasi:** `BaseLayout.astro:153-155`
- **Baik:** `<a href="#main-content" class="sr-only focus:not-sr-only ...">Lewati ke konten utama</a>` — pattern aksesibilitas yang benar.

#### UX-7 (POSITIVE) — Focus ring universal pada `:focus-visible`

- **Lokasi:** `apps/web/src/styles/global.css:528-533`
- **Baik:** `:focus-visible { outline: 2px solid var(--color-primary-500); outline-offset: 2px; }` — diterapkan secara global.

#### UX-8 (POSITIVE) — SVG dekoratif menggunakan `aria-hidden="true"`

- **Lokasi:** `BaseLayout.astro:96-122`, `Hero.astro`, `Sidebar.tsx:233`
- **Baik:** Konsisten — `<span aria-hidden="true" dangerouslySetInnerHTML={{__html: svg}} />`.

#### UX-9 (POSITIVE) — Tidak ada layout Tailwind UI/Shadcn/Flowbite/Bootstrap yang terdeteksi

- **Verifikasi:** Semantic tokens (`bg-bg-page`, `text-text-primary`, `border-border-default`) digunakan secara konsisten. Tidak ada pola `Card/CardHeader/CardContent` prefab.

#### UX-10 (MEDIUM) — RoleManager UI matrix 8×8 yang didokumentasikan hanya 8 perms × 5 toggleable roles

- **Lokasi:** `RoleManager.tsx:153-266`
- **Masalah:** AGENTS.md mengatakan "RoleManager UI matrix 8 features × 8 roles". Implementasi: 8 permissions keys × 5 roles yang bisa di-toggle (admin, super_admin, content_manager, dispatcher, finance — 3 role lainnya tidak bisa dikonfigurasi via UI).

---

## 7. Pas 6: Keamanan

### Temuan Detil

#### SEC-1 (BLOCKER) — Tidak ada security headers pada halaman Astro

- **Lokasi:** `apps/web/src/middleware.ts` (seluruh file), `infrastructure/docker/nginx/prod.conf:151-349`
- **Masalah:** Tidak ada `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, atau `Content-Security-Policy` pada respons HTML. Middleware web hanya menambahkan header `Link` dan markdown discovery. Hono `secureHeaders()` hanya berjalan pada `/api/*`; HTML di `/`, `/login`, `/dashboard/*` tidak mendapat apa pun.
- **Mengapa penting:** Setiap halaman HTML rentan clickjacking (iframe overlay), MIME-type sniffing, referrer-leak cross-origin. Halaman login adalah target bernilai tinggi.
- **Severitas:** **Blocker**
- **Solusi:** Tambahkan Astro middleware hook yang menetapkan security headers; atau tambahkan `add_header ... always` di Nginx prod.conf pada level HTTPS server block.

#### SEC-2 (BLOCKER) — HSTS dikomentari di produksi

- **Lokasi:** `infrastructure/docker/nginx/prod.conf:171-172`
- **Masalah:** `# add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;` — HSTS completely disabled. Hono API emit HSTS melalui `secureHeaders()` hanya pada `/api/*`, tapi user harus round-trip API call dulu sebelum browser pin HSTS.
- **Severitas:** **Blocker**
- **Solusi:** Uncomment line 172; mulai dengan `max-age=600` lalu bump ke 63072000 setelah seminggu verifikasi.

#### SEC-3 (BLOCKER) — `audit_logs` tidak immutable — bisa di-UPDATE/DELETE

- **Lokasi:** `packages/database/src/schema/audit-logs.ts:4-23` — tidak ada trigger, tidak ada revoke grants
- **Masalah:** Aplikasi connect user memiliki CRUD penuh pada tabel audit_logs. Siapa pun dengan akses SQL bisa `UPDATE audit_logs SET user_id=NULL WHERE action='booking.cancel'`.
- **Mengapa penting:** Dokumentasi menyatakan "Audit log immutable". Realita: tidak ada enforce di DB. Dengan akun admin yang terambil alih, penyerang bisa menulis ulang sejarah forensik.
- **Severitas:** **Blocker**
- **Solusi:** Migrasi SQL: `CREATE FUNCTION prevent_audit_mutation()` + trigger `BEFORE UPDATE` + `BEFORE DELETE`. Revoke UPDATE/DELETE dari role aplikasi.
- **Estimasi:** 1 hari

#### SEC-4 (BLOCKER) — Dokumen KYC disajikan publik tanpa autentikasi

- **Lokasi:** `apps/api/src/routes/media.ts:175` — `router.get('/:id/file', async (c) => {` tanpa authMiddleware
- **Masalah:** Endpoint `GET /media/:id/file` tidak memiliki authMiddleware dan tidak memeriksa kepemilikan. Dokumen partner (KTP, foto, SIM) disimpan sebagai media record. Siapa pun dengan UUID bisa mengunduhnya. Ditambah `Cache-Control: public, max-age=31536000`.
- **Mengapa penting:** KTP berisi nama lengkap, NIK, alamat, tanggal lahir, foto — PII sensitivitas tinggi di bawah UU PDP Indonesia. Kebocoran publik melanggar prinsip minimalisasi data.
- **Severitas:** **Blocker**
- **Solusi:** Tambahkan `authMiddleware` dan authorization check (uploader sendiri atau admin/super_admin/dispatcher). Ganti redirect R2 publik dengan signed URL short-lived.
- **Estimasi:** 2–3 hari

#### SEC-5 (BLOCKER) — `RATE_LIMIT_DISABLED=true` default di `.env.example`

- **Lokasi:** `.env.example:87`
- **Masalah:** Jika operator menyalin `.env.example` → `.env` dan lupa mengubah flag, seluruh API rate limit dinonaktifkan di produksi. Nginx rate limit (30/100 r/s) memberi baseline, tapi per-route limit aplikasi (5/menit di auth) hilang.
- **Severitas:** **Blocker**
- **Solusi:** Ubah default ke `false`; tambahkan `validateEnv()`: tolak start jika `APP_ENV=production && RATE_LIMIT_DISABLED=true`.
- **Estimasi:** 1 jam

#### SEC-6 (CRITICAL) — Refresh-token rotation tidak atomik — replay attack window

- **Lokasi:** `apps/api/src/routes/auth.ts:220-265`
- **Masalah:** Tiga statement terpisah tanpa transaksi. Dua request konkuren dengan token yang sama bisa keduanya lolos.
- **Severitas:** **Critical**
- **Solusi:** `db.transaction()` + `SELECT FOR UPDATE` atau atomic `UPDATE ... WHERE revoked=false RETURNING *`.
- **Estimasi:** 0,5 hari

#### SEC-7 (CRITICAL) — Password reset tidak mencabut sesi aktif

- **Lokasi:** `apps/api/src/routes/auth.ts:308-344`
- **Masalah:** Setelah reset password, refresh_token rows untuk user tersebut TIDAK direvoke, dan tidak ada JWT access-token blacklist. Access token tetap valid hingga 2 jam; refresh token hingga 7 hari.
- **Mengapa penting:** Jika user mereset password karena sesi dicuri, penyerang tetap memiliki akses penuh.
- **Severitas:** **Critical**
- **Solusi:** Di dalam transaksi reset, tambahkan `await tx.update(refreshTokens).set({ revoked: true }).where(eq(refreshTokens.userId, stored.userId))`.
- **Estimasi:** 0,5 hari

#### SEC-8 (CRITICAL) — Enumerasi akun via perbedaan 401 vs 403 pada login

- **Lokasi:** `apps/api/src/routes/auth.ts:188-194`
- **Masalah:** Login: email tidak ditemukan → 401 "Email atau password salah". Email ditemukan, akun diblokir → 403 "Akun tidak aktif". Status check berjalan SEBELUM `verifyPassword` — akun diblokir skip Argon2id (~120ms), timing differential terdeteksi.
- **Mengapa penting:** Fondasi untuk credential stuffing, phishing tertarget, social engineering. Siapa pun bisa probing `admin@ahlipanggilan.id` untuk enumerasi akun privileged.
- **Severitas:** **Critical**
- **Solusi:** Selalu jalankan Argon2id (atau dummy hash). Kembalikan HTTP status dan error string yang identik untuk "tidak ditemukan", "password salah", dan "diblokir". Surface guidance akun diblokir via flow post-login terpisah, bukan via HTTP response berbeda.
- **Estimasi:** 0,5 hari

#### SEC-9 (CRITICAL) — Token akses & refresh dikembalikan di JSON body — mengalahkan proteksi `httpOnly`

- **Lokasi:** `apps/api/src/routes/auth.ts:111-112, 215-216, 263-264`
- **Masalah:** Login, register, dan refresh menyetel cookie httpOnly DAN mengembalikan token di JSON response body. `NoopTokenStore` di api-client menyimpan token tersebut di memori JS. Setiap XSS di SPA bisa membaca `json.data.token` / `json.data.refreshToken` dan mengeksfiltrasi.
- **Mengapa penting:** Seluruh tujuan httpOnly + SameSite=Strict cookie (menjaga token di luar JavaScript) dibatalkan oleh JSON body echo. XSS pada dashboard apa pun menjadi pengambilalihan sesi penuh.
- **Severitas:** **Critical**
- **Solusi:** Berhenti mengembalikan token di response body. Kelola hanya via httpOnly cookie. Browser otomatis mengirim cookies dengan `credentials: 'include'`. `NoopTokenStore` harus tetap noop — tidak pernah menyimpan token client-side.
- **Estimasi:** 1 hari

#### SEC-10 (CRITICAL) — CSRF skip `/auth/refresh` dan menerima request tanpa Origin/Referer

- **Lokasi:** `apps/api/src/middleware/csrf.ts:51-54, 60-64, 36-40`
- **Masalah:** Tiga celah: (1) `/auth/refresh` di-whitelist dari CSRF — tapi refresh adalah endpoint state-changing yang mencetak token baru; (2) request tanpa `Origin` maupun `Referer` diizinkan lewat; (3) saat `CORS_ORIGIN` tidak diatur, fallback ke localhost origins.
- **Severitas:** **Critical**
- **Solusi:** Implementasi double-submit CSRF token dalam cookie non-httpOnly terpisah. Jangan skip `/auth/refresh`. Tolak request state-changing tanpa BOTH Origin dan Referer. Fail closed saat `CORS_ORIGIN` tidak diatur.
- **Estimasi:** 1–2 hari

#### SEC-11 (CRITICAL) — Validator `JWT_SECRET` hanya menolak literal string `'change-me'`

- **Lokasi:** `apps/api/src/index.ts:20-26`
- **Masalah:** Hanya `JWT_SECRET === 'change-me'` yang ditolak. Nilai lemah lain (`'secret'`, `'password123'`, `'ahlipanggilan'`, `'a'`) lolos. Tidak ada pengecekan entropi atau panjang minimum.
- **Mengapa penting:** JWT secret lemah memungkinkan offline brute-force token, auth bypass penuh, dan impersonasi admin. Panduan `openssl rand -hex 32` di `.env.prod.example` tidak dienforce.
- **Severitas:** **Critical**
- **Solusi:** Enforce `JWT_SECRET.length >= 64` di produksi; tolak nilai dalam denylist (weak secrets).
- **Estimasi:** 2 jam

#### SEC-12 (CRITICAL) — IDOR: `GET /bookings/:id` mengabaikan corporate, dispatcher, finance

- **Lokasi:** `apps/api/src/routes/bookings.ts:397-442`
- **Masalah:** Handler hanya enforce IDOR untuk `customer` (baris 405-411) dan `partner` (baris 412-419). Untuk corporate, dispatcher, finance, dan content_manager — tidak ada authorization check. Detail order lengkap (items, media, timeline, address, customer info) dikembalikan tanpa syarat.
- **Mengapa penting:** Corporate user hanya boleh melihat order perusahaan mereka — bisa fetch order apa pun. Finance/content_manager mendapat leak oracle untuk seluruh order.
- **Severitas:** **Critical**
- **Solusi:** Tambahkan branch corporate (cek `order.companyId === cu.companyId`); forbidden untuk content_manager; fallthrough dispatcher/admin/super_admin.
- **Estimasi:** 0,5 hari

#### SEC-13 (CRITICAL) — IDOR: `GET /payments/:id` hanya memblokir customer — leak PII ke semua role lain

- **Lokasi:** `apps/api/src/routes/payments.ts:192-283`
- **Masalah:** IDOR check hanya saat `userRole === 'customer'` (baris 234-248). Untuk partner, corporate, dispatcher, finance, content_manager — response termasuk customer.email, customer.phone, customer.name, verifier.email.
- **Mengapa penting:** Partner atau content_manager bisa scrape setiap payment + email/phone customer. Pelanggaran need-to-know langsung.
- **Severitas:** **Critical**
- **Solusi:** Tambahkan `requireRole('admin', 'super_admin', 'finance')` pada handler GET /:id.
- **Estimasi:** 0,5 hari

#### SEC-14 (CRITICAL) — MIME type file dipercaya dari klien — tanpa verifikasi magic byte

- **Lokasi:** `apps/api/src/lib/storage.ts:120-127, 104-106`
- **Masalah:** `saveFile` memvalidasi `file.type` (Content-Type dari browser) terhadap `ALLOWED_MIME_TYPES`. Penyerang bisa POST dengan `Content-Type: image/jpeg` sementara isinya `text/html`, polyglot ZIP/JAR/SVG. File disimpan dengan ekstensi dari user. Serve endpoint menetapkan `Content-Type: <record.mimeType>` dan `Cache-Control: public, max-age=31536000`.
- **Mengapa penting:** Stored XSS-as-file payload (`<svg onload=...>`) atau dokumen polyglot bisa dieksekusi. Phishing vector (PDF palsu dengan text/html mime).
- **Severitas:** **Critical**
- **Solusi:** Setelah menerima buffer, sniff magic bytes via `file-type`. Verifikasi MIME terdeteksi cocok dengan yang dideklarasikan. Validasi gambar dengan sharp. Reject pada mismatch. Paksa `Content-Disposition: attachment`.
- **Estimasi:** 1 hari

#### SEC-15 (CRITICAL) — `deleteFile(path)` menerima arbitrary path — potensi path traversal

- **Lokasi:** `apps/api/src/lib/storage.ts:194-211`, `apps/api/src/routes/media.ts:220`
- **Masalah:** `deleteFile` memanggil `unlink(path)` tanpa validasi bahwa `path` berada dalam `UPLOAD_DIR` (untuk local disk). Untuk R2, Key diambil apa adanya dari DB. Fungsi sepenuhnya mempercayai nilai yang tersimpan.
- **Mengapa penting:** Defense-in-depth failure. Chained bug di modul lain eskalasi ke primitif penghapusan file.
- **Severitas:** **Critical**
- **Solusi:** Untuk local: `const resolved = resolve(UPLOAD_DIR, basename(path))` + assert `resolved.startsWith(UPLOAD_DIR)`. Untuk R2: sanitasi Key.
- **Estimasi:** 2 jam

#### SEC-16 (CRITICAL) — Password seed `password123` untuk 10+ akun

- **Lokasi:** `apps/api/src/seeds/index.ts:47,67` + `seed-admin.ts:29`
- **Masalah:** Semua akun seeded (admin, admin2, dispatcher, finance, content_manager, partner, customer, corporate) menggunakan `hashPassword('password123')`. Seed-admin fallback ke `password123` jika `ADMIN_PASSWORD` env tidak diatur. Password dicetak plaintext ke log.
- **Mengapa penting:** Jika operator menjalankan seed di produksi tanpa env var, live super_admin memiliki password yang bisa ditebak. Siapa pun dengan akses log melihat password.
- **Severitas:** **Critical**
- **Solusi:** Hapus fallback; tolak jalankan jika env var tidak diatur; generate password acak dan cetak SEKALI; tambahkan guard `NODE_ENV !== 'production'`.
- **Estimasi:** 0,5 hari

#### SEC-17 (HIGH) — Rate limiter trust `X-Forwarded-For` dari klien

- **Lokasi:** `apps/api/src/middleware/rate-limiter.ts:46-50`
- **Masalah:** IP untuk rate limit bucket adalah `c.req.header('x-forwarded-for').split(',')[0]`. Nginx config menggunakan `$proxy_add_x_forwarded_for` yang menambahkan (bukan mengganti) — nilai klien muncul PERTAMA di header XFF. Penyerang bisa spoof XFF untuk bypass rate limit sepenuhnya.
- **Severitas:** **High**
- **Solusi:** Nginx: `proxy_set_header X-Forwarded-For $remote_addr;`. API: hanya trust XFF jika `TRUST_PROXY=true` dan request berasal dari Nginx (via `X-Real-IP` yang divalidasi).
- **Estimasi:** 0,5 hari

#### SEC-18 (HIGH) — Partner self-registration langsung `active` — bisa terima order tanpa KYC

- **Lokasi:** `apps/api/src/routes/partners.ts:78-178` + `routes/bookings.ts:618-660`
- **Masalah:** Registrasi partner langsung set `status: 'active'` (baris 113); `verificationStatus` default `'Pending'` tapi flow booking accept tidak meng-enforce ini. Dispatcher bisa menetapkan order ke partner yang belum diverifikasi.
- **Mengapa penting:** Layanan rumah on-demand + partner tidak terverifikasi = risiko keamanan fisik untuk customer. KYC didesain tapi tidak di-enforce di API boundary.
- **Severitas:** **High**
- **Solusi:** `bookings.ts /confirm` dan `/assign` harus menolak partner dengan `verificationStatus !== 'Approved'`.
- **Estimasi:** 0,5 hari

#### SEC-19 (HIGH) — No Cloudflare real-IP config — rate limiting keyed on Cloudflare IPs

- **Lokasi:** `infrastructure/docker/nginx/prod.conf:18-22`
- **Masalah:** Rate limit zones dikunci pada `$binary_remote_addr`. Di belakang Cloudflare CDN, semua request memiliki IP edge Cloudflare. Rate limit berlaku untuk Cloudflare IPs secara kolektif — satu pengunjung populer bisa menghabiskan kuota IP.
- **Severitas:** **High**
- **Solusi:** Tambahkan `set_real_ip_from` (semua Cloudflare IP ranges); `real_ip_header CF-Connecting-IP; real_ip_recursive on;`.
- **Estimasi:** 30 menit

#### SEC-20 (HIGH) — `dangerouslySetInnerHTML` pada article/page editor tanpa DOMPurify

- **Lokasi:** `articleEditor.tsx:474`, `PageEditor.tsx:306`
- **Masalah:** Konten artikel/CMS page dirender via `dangerouslySetInnerHTML`. CSP memblokir inline script tapi `imgSrc: ['self', 'data:', 'https:']` mengizinkan tracking pixel exfiltration. Tidak ada server-side HTML sanitization.
- **Severitas:** **Medium**
- **Solusi:** Tambahkan DOMPurify di sisi server sebelum render.

---

## 8. Pas 7: Kinerja/Performa

### Temuan Detil

#### PERF-1 (BLOCKER) — Homepage SSR dengan 3 fetch API live per permintaan → LCP <2.5s tidak mungkin

- **Lokasi:** `apps/web/src/pages/index.astro:48-50`
- **Masalah:** Tiga fetch paralel: `/api/v1/services?limit=12`, `/api/v1/cms/articles?limit=4`, `/api/v1/cms/coverage-areas`. Setiap hit homepage membutuhkan 3× API round-trip sebelum HTML bisa dikirim. Dengan latensi API 100ms, TTFB minimum ~300ms (belum termasuk render).
- **Mengapa penting:** Target LCP <2.5s dan TTFB <500ms tidak bisa dipenuhi. Homepage adalah halaman dengan traffic tertinggi. SSG + ISR/revalidate akan mengeliminasi bottleneck ini.
- **Severitas:** **Blocker** (tumpang tindih dengan FE-1)
- **Solusi:** `prerender = true` + build-time fetch + on-demand revalidation via `pages/api/revalidate.ts`.
- **Estimasi:** 4–8 jam

#### PERF-2 (HIGH) — Service detail SSR dengan 5 fetch per permintaan

- **Lokasi:** `apps/web/src/pages/services/[slug].astro:25-69`
- **Masalah:** Lima fetch: service by slug, reviews, coverage-areas, service-categories, FAQ. Halaman service detail adalah SEO-critical landing page dengan traffic tinggi.
- **Severitas:** **High**
- **Solusi:** SSG + `getStaticPaths()`; revalidate via webhook saat admin edit service.
- **Estimasi:** 6–10 jam

#### PERF-3 (HIGH) — `booking_number_seq` menggunakan `CACHE 1` — bottleneck tulis sinkron

- **Lokasi:** `packages/database/migrations/0016_add_booking_sequence.sql:16-21`
- **Masalah:** `CACHE 1` meniadakan caching sequence per-backend PostgreSQL. Setiap `nextval()` memaksa synchronous disk write. Saat traffic pemesanan konkuren, ini menjadi bottleneck utama.
- **Severitas:** **High**
- **Solusi:** Ubah ke `CACHE 50` atau `CACHE 100`.
- **Estimasi:** 15 menit
- **Dampak produksi:** Throughput pemesanan konkuren sangat terbatas.

#### PERF-4 (HIGH) — 75 page dashboard menggunakan `client:load` (eager hydration)

- **Lokasi:** 75 halaman di `apps/web/src/pages/dashboard/**/*.astro`
- **Masalah:** Setiap pulau React di dashboard dihidrasi secara eager, termasuk komponen besar seperti DispatcherOverview (907 baris) dan FinanceOverview (740 baris).
- **Severitas:** **High**
- **Solusi:** `client:idle` untuk dashboard overview; `client:visible` untuk komponen below-fold.
- **Estimasi:** 30 menit per halaman

#### PERF-5 (HIGH) — Hanya 3 `React.lazy()` di seluruh codebase

- **Lokasi:** Tiga file di `apps/web/src/components/dashboard/admin/`
- **Masalah:** Code splitting sangat minim. Komponen besar seperti RichTextEditor, MediaBrowser, SchemaBuilder, SEOEditor diimpor secara eager.
- **Severitas:** **High**
- **Solusi:** Terapkan `React.lazy()` + `<Suspense>` untuk komponen editor/media di ArticleEditor dan PageEditor.
- **Estimasi:** 1–2 jam per komponen

#### PERF-6 (MEDIUM) — `GET /customers` mengembalikan SEMUA customer tanpa pagination

- **Lokasi:** `apps/api/src/routes/customers.ts:60-76`
- **Masalah:** Admin endpoint mengembalikan seluruh daftar customer (email, phone, fullName, status) tanpa LIMIT. Untuk 10K+ customer, ini akan OOM.
- **Severitas:** **High**
- **Solusi:** Tambahkan pagination dan batasi `limit` maksimum 100.
- **Estimasi:** 30 menit

#### PERF-7 (MEDIUM) — `limit` query parameter tidak dibatasi di sebagian besar endpoint

- **Lokasi:** `bookings.ts:293`, `services.ts:13`, `admin/articles.ts:138`, dll.
- **Masalah:** `?limit=100000` memungkinkan DoS via eksfiltrasi data masif.
- **Severitas:** **Medium**
- **Solusi:** `Math.min(limit, 100)` di setiap list endpoint.

#### PERF-8 (MEDIUM) — `ServiceExplorer.tsx` (801 baris) di-homepage dengan `client:load`

- **Lokasi:** `apps/web/src/components/homepage/ServiceExplorer.tsx`
- **Masalah:** Komponen 801 baris dieksekusi saat halaman dimuat. Ini dikirim ke setiap pengunjung homepage.
- **Severitas:** **High**
- **Solusi:** Split, lazy-load sub-komponen, atau render server-side.
- **Estimasi:** 2–3 jam

#### PERF-9 (LOW) — `manualChunks` hanya memiliki 4 kategori

- **Lokasi:** `apps/web/astro.config.mjs:49-58`
- **Masalah:** Hanya `vendor-ui`, `vendor-editor` (TipTap), `vendor-icons` (lucide-react), `vendor-validation` (zod). Tidak ada chunk untuk React itu sendiri, analytics, atau komponen dashboard besar.
- **Severitas:** **Low**
- **Solusi:** Tambahkan chunk strategy untuk React core, analytics, dan komponen dashboard berat.

#### PERF-10 (POSITIVE) — Gzip aktif di Nginx (level 6)

- **Lokasi:** `infrastructure/docker/nginx/prod.conf:191-196`
- **Baik:** `gzip on; gzip_vary on; gzip_comp_level 6; gzip_min_length 256;` — konfigurasi yang baik.

#### PERF-11 (POSITIVE) — HTTP/2 diaktifkan di Nginx

- **Lokasi:** `prod.conf:86,152` — `listen 443 ssl http2;`
- **Baik:** HTTP/2 aktif untuk multiplexing.

#### PERF-12 (LOW) — Tidak ada Brotli

- **Lokasi:** `prod.conf` — tidak ada `brotli on;`
- **Masalah:** Brotli memberikan kompresi lebih baik (~20%) dibanding gzip untuk konten teks.
- **Severitas:** **Low**
- **Solusi:** Tambahkan modul Brotli jika Nginx dikompilasi dengannya.

#### PERF-13 (MEDIUM) — Nginx `proxy_cache` untuk API GET di 10s

- **Lokasi:** `prod.conf:278`
- **Baik:** `proxy_cache_valid 200 301 302 10s;` — caching 10 detik untuk API GET mengurangi beban.

---

## 9. Pas 8: Infrastruktur

### Temuan Detil

#### INFRA-1 (BLOCKER) — Tidak ada sertifikat SSL untuk `stats.ahlipanggilan.id`

- **Lokasi:** `.github/workflows/deploy.yml:175-188` vs `infrastructure/docker/nginx/prod.conf:91-92`
- **Masalah:** Nginx prod config mereferensi `/etc/letsencrypt/live/${PLAUSIBLE_DOMAIN}/fullchain.pem`. Workflow deploy certbot hanya meminta `-d ahlipanggilan.id -d www.ahlipanggilan.id` — tidak pernah `stats.ahlipanggilan.id`. Saat deploy pertama, Nginx akan gagal start karena file sertifikat tidak ada.
- **Mengapa penting:** Nginx tidak akan start, sehingga port 443 berhenti melayani domain utama juga. Seluruh HTTPS down.
- **Severitas:** **Blocker**
- **Solusi:** Tambahkan `-d stats.ahlipanggilan.id` ke perintah certbot; atau gunakan webroot mode dengan scheduled renewal.
- **Estimasi:** 30 menit
- **Dampak produksi:** Kritis — deploy produksi pertama dengan Plausible enabled membuat Nginx gagal.

#### INFRA-2 (BLOCKER) — Tidak ada cron perpanjangan sertifikat SSL (Let's Encrypt kadaluarsa 90 hari)

- **Lokasi:** `.github/workflows/deploy.yml:175-188` (hanya certbot first-run)
- **Masalah:** Tidak ada cron/systemd timer/container sidecar untuk renewal. Sertifikat Let's Encrypt kadaluarsa dalam 90 hari.
- **Severitas:** **Blocker**
- **Solusi:** Tambahkan `certbot renew` cron mingguan + `nginx -s reload` atau sidecar container.
- **Estimasi:** 1 jam

#### INFRA-3 (BLOCKER) — No Cloudflare real-IP config — rate limiting key on CDN IPs

- **Lokasi:** `infrastructure/docker/nginx/prod.conf:18-22`
- **Masalah:** `limit_req_zone $binary_remote_addr` tanpa `set_real_ip_from` Cloudflare. Semua request datang dari IP edge Cloudflare. Rate limiting kolektif untuk semua pengguna.
- **Severitas:** **Blocker**
- **Solusi:** Tambahkan `set_real_ip_from` (semua CF ranges) + `real_ip_header CF-Connecting-IP; real_ip_recursive on;`.
- **Estimasi:** 30 menit

#### INFRA-4 (CRITICAL) — PostgreSQL 17 di produksi vs PostgreSQL 18 yang didokumentasikan

- **Lokasi:** `docker-compose.prod.yml:16` (`image: postgres:17`), `docker-compose.yml:3` (`postgres:18`), `.github/workflows/ci.yml:84` (`postgres:17`)
- **Masalah:** Dev menggunakan PG18, CI dan produksi menggunakan PG17. Ketidakcocokan versi antar environment menyebabkan bug yang hanya muncul di dev atau hanya di produksi.
- **Severitas:** **High**
- **Solusi:** Bump produksi dan CI ke `postgres:18`; migrasi data dari PG17 → PG18 via pg_upgrade atau dump-restore.
- **Estimasi:** 1–3 jam
- **Dampak produksi:** Version drift mencegah bug hanya di produksi; upgrade major membawa risiko.

#### INFRA-5 (CRITICAL) — Memori API 256M vs dokumentasi 512M

- **Lokasi:** `docker-compose.prod.yml:128-133`
- **Masalah:** `deploy.resources.limits.memory: 256M` — AGENTS.md dan `deployment.md:273` menyebutkan 512M. @aws-sdk/client-s3 dependency berat; image upload/sharp processing bisa OOM-kill API.
- **Severitas:** **High**
- **Solusi:** Bump limit ke `512M`, reservation ke `256M`.
- **Estimasi:** 5 menit

#### INFRA-6 (CRITICAL) — Tidak ada rotasi log untuk container Postgres produksi

- **Lokasi:** `docker-compose.prod.yml:15-39`
- **Masalah:** Redis, API, web, Nginx, Plausible semuanya memiliki `logging.options.max-size: 10m / max-file: 3`. Postgres adalah satu-satunya layanan produksi tanpa logging block.
- **Severitas:** **High**
- **Solusi:** Tambahkan logging block identik ke service postgres.
- **Estimasi:** 2 menit
- **Dampak produksi:** Log query/error Postgres bisa memenuhi disk (40GB SSD) di hari sibuk.

#### INFRA-7 (CRITICAL) — `depends_on` tanpa `condition: service_healthy`

- **Lokasi:** `docker-compose.prod.yml:111-115 (api → redis)`, `:159-162 (web → api)`, `:204-206 (nginx → web, api)`
- **Masalah:** `api` bergantung pada `redis` dengan `service_started`, bukan `service_healthy`. API mungkin mencoba koneksi ke Redis sebelum Redis siap. Web mulai sebelum API menerima koneksi.
- **Severitas:** **Medium**
- **Solusi:** Ubah semua ke `condition: service_healthy`.
- **Estimasi:** 5 menit

#### INFRA-8 (CRITICAL) — Deploy auto-deploy tanpa gate manual approval

- **Lokasi:** `.github/workflows/deploy.yml:27-34, 115`
- **Masalah:** Triggered oleh `workflow_run` pada `CI: completed` dari `main`. Gate hanya `vars.VPS_ENABLED == 'true'`. Push ke main → CI pass → 5 menit kemudian produksi ditimpa.
- **Severitas:** **High**
- **Solusi:** Tambahkan `environment: production` dengan required reviewers (GitHub Environment approval).
- **Estimasi:** 30 menit

#### INFRA-9 (CRITICAL) — `image prune -a -f` menghapus SEMUA image yang tidak digunakan termasuk kandidat rollback

- **Lokasi:** `.github/workflows/deploy.yml:167, 343`
- **Masalah:** Setelah pull image baru dan start stack, deploy prune SEMUA image yang tidak running. Setelah ini, `PREVIOUS_TAG` hilang. Rollback path (baris 307-310) tidak menemukan image untuk rollback.
- **Severitas:** **Critical**
- **Solusi:** Gunakan `image prune --filter "until=24h"` atau andalkan GHCR untuk rollback (setiap SHA tag disimpan).
- **Estimasi:** 15 menit

#### INFRA-10 (CRITICAL) — `.gitignore` tidak mencakup `backups/` — risiko commit database dump

- **Lokasi:** `.gitignore:36` (hanya `db-backups/` yang tercantum)
- **Masalah:** `scripts/backup.sh` default ke `./backups/`. Jika operator tidak sengaja commit repo setelah menjalankan backup, mereka commit database dump dengan SEMUA data produksi: email, password hash, PII.
- **Severitas:** **Critical**
- **Solusi:** Tambahkan baris `backups/` ke `.gitignore`.
- **Estimasi:** 1 menit
- **Dampak produksi:** Katastropik — kebocoran PII melalui accidental commit.

#### INFRA-11 (HIGH) — Tidak ada backup harian terjadwal

- **Lokasi:** `scripts/backup.sh` (implementasi penuh) — tidak ada cron/systemd timer di mana pun
- **Masalah:** AGENTS.md mengatakan backup harian via `scripts/backup.sh`. Script hanya memiliki instruksi manual usage. Pre-migration backup hanya berjalan saat deploy.
- **Severitas:** **High**
- **Solusi:** Pasang cron/systemd timer atau sidecar container yang menjalankan script setiap hari.
- **Estimasi:** 30 menit–2 jam

#### INFRA-12 (HIGH) — Tidak ada backup untuk Plausible DB atau ClickHouse

- **Lokasi:** `scripts/backup.sh:33` — hanya mengoperasikan `DATABASE_URL`
- **Masalah:** Data analytics Plausible (~1 GB ClickHouse data) tidak memiliki backup otomatis.
- **Severitas:** **High**
- **Solusi:** Perluas `scripts/backup.sh` untuk dump `plausible-db` dan ClickHouse.
- **Estimasi:** 1–2 jam

#### INFRA-13 (HIGH) — Retensi backup di deploy.yml 7 hari vs dokumentasi 30 hari

- **Lokasi:** `.github/workflows/deploy.yml:272-273` — `find ... -mtime +7 -delete`
- **Masalah:** Dokumentasi (`docs/operations/backup.md`, `scripts/backup.sh:21` `RETENTION_DAYS=30`) menyebutkan 30 hari. Pre-migration backup di `db-backups/` dihapus setelah 7 hari.
- **Severitas:** **High**
- **Solusi:** Selaraskan ke `-mtime +30` atau dokumentasikan kebijakan retensi terpisah.
- **Estimasi:** 5 menit

#### INFRA-14 (HIGH) — Dockerfile API dan web berjalan sebagai root — tidak ada `USER` directive

- **Lokasi:** `infrastructure/docker/api/Dockerfile`, `infrastructure/docker/web/Dockerfile`
- **Masalah:** Proses Node di dalam container berjalan sebagai root. Jika ada RCE dependency, penyerang lolos dengan root.
- **Severitas:** **High**
- **Solusi:** Buat user `node`, `USER node`, pastikan `WORKDIR /app` dimiliki oleh node.
- **Estimasi:** 15 menit

#### INFRA-15 (HIGH) — `start.sh` prod branch menggunakan nama package yang salah — dead code

- **Lokasi:** `scripts/start.sh:45, 50, 89, 94, 99`
- **Masalah:** Memanggil `pnpm --filter @specialist/database db:migrate`, `pnpm --filter @specialist/api start`. Nama package aktual adalah `@ahlipanggilan/database` dan `@ahlipanggilan/api`. Prefix `@specialist` tidak muncul di tempat lain. Prod branch `start.sh` adalah dead code.
- **Severitas:** **Critical**
- **Solusi:** Ganti `@specialist` dengan `@ahlipanggilan` di seluruh file.
- **Estimasi:** 5 menit

#### INFRA-16 (MEDIUM) — `IMAGE_OWNER` default tidak konsisten

- **Lokasi:** `docker-compose.prod.yml:74,142` (`${IMAGE_OWNER:-h4nzs}`) vs `.env.prod.example:65` (`IMAGE_OWNER=ahlipanggilan`)
- **Masalah:** Jika operator mengandalkan template `.env.prod.example`, prod compose menarik image dari `ghcr.io/ahlipanggilan/api` — tapi CI publish ke `ghcr.io/${github.repository_owner}/api` (mungkin `h4nzs`).
- **Severitas:** **High** (hanya di first deploy)
- **Solusi:** Setel default compose ke repository owner yang benar.
- **Estimasi:** 2 menit

#### INFRA-17 (MEDIUM) — No `security_opt: no-new-privileges:true` pada container manapun

- **Lokasi:** Seluruh `docker-compose.prod.yml`
- **Masalah:** Child process bisa eskalasi privilege via setuid binary dalam container.
- **Severitas:** **Medium**
- **Solusi:** Tambahkan `security_opt: ['no-new-privileges:true']` ke setiap service.

#### INFRA-18 (MEDIUM) — Tidak ada multi-stage build untuk API/web Dockerfile

- **Lokasi:** `infrastructure/docker/api/Dockerfile`, `web/Dockerfile`
- **Masalah:** Single-stage build mengirimkan dev dependencies (testcontainers, supertest, vitest) ke final image. Ukuran image 1+ GB.
- **Severitas:** **Medium**
- **Solusi:** Builder stage dengan semua deps; runtime stage dengan `pnpm install --prod` saja.
- **Estimasi:** 1–2 jam

#### INFRA-19 (LOW) — Nginx `nginx:alpine` tidak dipin ke versi spesifik

- **Lokasi:** `docker-compose.prod.yml:188`, `docker-compose.yml:88`
- **Masalah:** `nginx:alpine` tracking latest major.
- **Severitas:** **Medium**
- **Solusi:** Pin ke versi spesifik (`nginx:1.27-alpine`) atau pin by digest.

#### INFRA-20 (LOW) — Tidak ada Cloudflare cache purge saat post-deploy

- **Lokasi:** `.github/workflows/deploy.yml` — tidak ada panggilan Cloudflare API
- **Masalah:** Stale HTML mungkin bertahan di Cloudflare edge setelah deploy baru.
- **Severitas:** **High**
- **Solusi:** Tambahkan step deploy final: `curl -X POST ".../purge_cache"`.
- **Estimasi:** 15 menit

### Ringkasan Infrastruktur

Total 102 temuan: 3 Blocker, 5 Critical, 15 High, 30+ Medium, 50+ Low/Cosmetic. Temuan paling kritis: SSL stats subdomain, HSTS nonaktif, tidak ada perpanjangan cert, Cloudflare real-IP, backup tidak bisa dipulihkan, `.gitignore` tidak mencakup `backups/`.

---

## 10. Pas 9: Pengujian

### Statistik

| Lokasi                            | File test/spec | Jumlah tes |
| --------------------------------- | -------------- | ---------- |
| `apps/api/src` (unit)             | 54             | 717        |
| `apps/api/src` (integration)      | 3              | 48         |
| `apps/web/src` (Vitest)           | 51             | 414        |
| `apps/web/tests` (Playwright E2E) | 29             | 267        |
| `packages/analytics/src`          | 10             | 114        |
| `packages/database/src`           | 1              | 9          |
| `packages/shared/src`             | 11             | 233        |
| `packages/ui/src`                 | 34             | 235        |
| `packages/validation/src`         | 24             | 418        |
| **Total**                         | **217**        | **2.455+** |

### Temuan Detil

#### TEST-1 (BLOCKER) — `turbo run test` TIDAK PERNAH menjalankan integration test

- **Lokasi:** `apps/api/vitest.config.ts:6` — `exclude: ['src/**/*.integration.test.ts']`
- **Masalah:** `vitest.config.ts` untuk task `test` default mengecualikan file `*.integration.test.ts`. `turbo.json` hanya mendeklarasikan task `test`. Hasil: `pnpm test` (dan CI "Unit Tests" job) tidak pernah mengeksekusi 3 file integration test yang berisi 48 tes (termasuk 41 tes state machine pemesanan melawan Postgres sungguhan via testcontainers).
- **Mengapa penting:** Tes paling berharga (integrasi DB nyata) tidak pernah berjalan otomatis. Booking lifecycle, RBAC, dan kasus 409/422/429 hidup di sini. CI silent slip.
- **Severitas:** **Blocker**
- **Solusi:** Tambahkan CI job `apps-api-integration` yang menjalankan `pnpm --filter @ahlipanggilan/api test:integration`.
- **Estimasi:** 2 jam
- **Dampak produksi:** Full booking lifecycle terhadap DB nyata tidak terverifikasi oleh CI.

#### TEST-2 (BLOCKER) — Middleware CSRF tidak memiliki pengujian

- **Lokasi:** `apps/api/src/middleware/csrf.ts` — tidak ada `csrf.test.ts`
- **Masalah:** `csrfProtection()` dipasang di setiap request `/api/v1/*` tapi tidak memiliki tes. Bug di CSRF bisa memblokir request browser legitimate atau menerima yang palsu, tanpa safety net otomatis.
- **Severitas:** **Blocker**
- **Solusi:** Tambahkan `csrf.test.ts` yang mencakup: same-origin pass, cross-origin `Origin` → 403 `CSRF_REJECTED`, `/auth/refresh` skip, missing origin policy.
- **Estimasi:** 2 jam

#### TEST-3 (BLOCKER) — Nol pengujian pola serangan keamanan (SQLi, XSS, IDOR, directory traversal)

- **Lokasi:** `apps/api/src/` & `apps/web/tests/` — `grep -rE "sql injection|<script>|xss|csrf|idor|bypass|directory traversal"` mengembalikan **0 hasil**
- **Masalah:** Dokumentasi pengujian (`test-cases-2.md`) menetapkan SEC-001 (SQL Injection), SEC-002 (XSS), SEC-008 (Directory Traversal), SEC-009 (File Upload Script). Tidak ada dalam codebase.
- **Mengapa penting:** Produksi menggunakan PostgreSQL via Drizzle (ORM memitigasi risiko) tapi custom SQL fragments (e.g., `db.execute(sql\`TRUNCATE...\`)`) tetap ada. XSS via konten artikel (TipTap HTML) plausible. IDOR test parsial (hanya 409/403 di bookings).
- **Severitas:** **Blocker**
- **Solusi:** Tambahkan `security.test.ts` dengan payload: `' OR 1=1--`, `UNION SELECT`, `../etc/passwd`, `<script>alert(1)</script>`. Tambahkan matriks IDOR untuk booking/order/payment/customer unowned.
- **Estimasi:** 1–2 hari

#### TEST-4 (BLOCKER) — E2E booking test menggunakan `if (await visible())` + `.catch(() => false)` — regresi lolos dengan status hijau

- **Lokasi:** `apps/web/tests/booking.spec.ts:30-65, 82-91`
- **Masalah:** Setiap langkah di test booking dibungkus `if (await el.isVisible())` sehingga test pass meskipun field tidak ada. Success assertion menggunakan `.catch(() => false)` (baris 59, 43) — flaky silent pass. Ada `waitForTimeout(3000)` (baris 55, 88) yang membuat test flaky di CI lambat.
- **Mengapa penting:** Test ini melaporkan hijau ketika halaman pemesanan rusak. P0 book flow (`E2E-001`) adalah core critical path — dicatat sebagai 100% covered.
- **Severitas:** **Blocker**
- **Solusi:** Ganti `if (await visible())` dengan strict `await expect(locator).toBeVisible()`; hapus `.catch(() => false)`; ganti `waitForTimeout` dengan `expect.poll` atau `page.waitForResponse`.
- **Estimasi:** 2–3 jam per file

#### TEST-5 (CRITICAL) — Coverage thresholds didefinisikan tapi tidak pernah di-enforce

- **Lokasi:** `apps/api/vitest.config.ts:12-23`, `packages/{shared,validation,database,ui}/vitest.config.ts`
- **Masalah:** Thresholds `statements:80, branches:75, functions:80, lines:80` ada di konfigurasi. Tapi `pnpm test` (vitest run) tidak pernah mengoper `--coverage`. Thresholds adalah dead text.
- **Severitas:** **High**
- **Solusi:** Tambahkan `coverage: true` (atau `--coverage.enabled`) ke script test; CI step `pnpm test -- --coverage`; gagalkan build jika thresholds tidak terpenuhi.
- **Estimasi:** 2–4 jam

#### TEST-6 (HIGH) — E2E hanya berjalan di Chromium, bukan Firefox/Safari/Edge

- **Lokasi:** `apps/web/playwright.config.ts:19-24` — hanya project `chromium`
- **Masalah:** Dokumentasi menetapkan Chrome, Firefox, Safari, Edge + Mobile/Tablet/Desktop viewport. CI hanya menginstal `chromium` binary (`ci.yml:123`).
- **Severitas:** **High**
- **Solusi:** Tambahkan project `Desktop Firefox`, `Desktop Safari`, `Desktop Edge`; tambahkan `devices['iPhone SE']`, `devices['iPad Mini']`.
- **Estimasi:** 1–2 hari

#### TEST-7 (HIGH) — 11 komponen UI tidak memiliki pengujian

- **Lokasi:** `packages/ui/src/components/{MediaBrowser, ReadabilityScore, RichTextEditor, SchemaBuilder, SeoAnalyzerPanel, SeoChecklist, SEOEditor, SeoScoreGauge, SnippetPreview, TableSkeleton, TagsInput}.tsx`
- **Masalah:** 11 dari 45 komponen tidak memiliki `.test.tsx`. Ini adalah komponen paling kompleks (rata-rata 234 baris).
- **Severitas:** **High**
- **Solusi:** Tambahkan vitest + RTL tests.
- **Estimasi:** 2 hari

#### TEST-8 (HIGH) — Tidak ada Lighthouse/performance test dalam CI

- **Lokasi:** `.github/workflows/ci.yml` — tidak ada Lighthouse step
- **Masalah:** Dokumentasi pengujian menetapkan target: Performance >90, SEO >95, A11y >90, Best Practice >90. Tidak ada `@lhci/cli`, tidak ada config.
- **Severitas:** **High**
- **Solusi:** Tambahkan `@lhci/cli`, `.lighthouserc.js` dengan thresholds, wire ke CI.
- **Estimasi:** 1 hari

#### TEST-9 (HIGH) — Tidak ada pengujian aksesibilitas otomatis (axe-core)

- **Lokasi:** `apps/web/` — tidak ada `@axe-core/playwright`
- **Masalah:** Hanya ada manual focus/keyboard intent checks. Tidak ada axe violation check.
- **Severitas:** **High**
- **Solusi:** Tambahkan `@axe-core/playwright`; jalankan `AxeBuilder` melawan `/`, `/services`, `/book`, `/dashboard/admin`, `/dashboard/customer`.
- **Estimasi:** 0,5 hari

#### TEST-10 (HIGH) — Isolasi test E2E lemah — tidak ada DB reset antar run

- **Lokasi:** `apps/web/tests/` — tidak ada `global-teardown.ts`, tidak ada `afterEach` truncate
- **Masalah:** Test menggunakan ` serial mode` dan shared mutable state antar test. Run CI dua kali bisa meninggalkan state yang berbeda.
- **Severitas:** **High**
- **Solusi:** Tambahkan `global-teardown.ts` script truncate; atau jalankan seed sebelum setiap sesi Playwright.
- **Estimasi:** 1 hari

#### TEST-11 (MEDIUM) — 8 test di-skip secara kondisional berdasarkan seed availability

- **Lokasi:** `article-creation.spec.ts`, `content-locking.spec.ts`, `lock-list.spec.ts`, `lock-realtime.spec.ts`
- **Masalah:** `test.skip(!exists, 'Seed data not loaded — run pnpm ... first')` — jika seed data tidak dimuat, test silent skip.
- **Severitas:** **Medium**
- **Solusi:** Ganti dengan `test.fail` atau throw error di `beforeAll` sehingga suite gagal keras.

#### TEST-12 (MEDIUM) — Tidak ada pengujian untuk `packages/shared/api-client.ts`, `wa-template.ts`, `utils/logger.ts`, `constants.ts`

- **Lokasi:** File-file kritis di `packages/shared/src/` tanpa `.test.ts` sibling
- **Masalah:** `api-client.ts` digunakan oleh 8+ komponen UI. `constants.ts` berisi `ORDER_STATUS_TRANSITIONS` yang menggerakkan state machine pemesanan.
- **Severitas:** **High**
- **Solusi:** Tambahkan test untuk setiap file kritis.
- **Estimasi:** 1 hari

#### TEST-13 (MEDIUM) — Database package hanya memiliki 1 file test (9 assertions)

- **Lokasi:** `packages/database/src/schema.test.ts`
- **Masalah:** Hanya assert struktur ekspor. Tidak ada tes yang menerapkan migrasi terhadap Postgres sungguhan.
- **Severitas:** **High**
- **Solusi:** Tambahkan `migrations.test.ts` dengan testcontainers: apply all migrations, verify constraints, soft-delete behavior.
- **Estimasi:** 1 hari

#### TEST-14 (MEDIUM) — Pre-commit hook hanya prettier, tidak ada lint/test gate

- **Lokasi:** `.husky/pre-commit` — hanya `pnpm exec lint-staged`
- **Masalah:** Tidak ada ESLint atau focused-test pada staged files.
- **Severitas:** **Low**
- **Solusi:** Tambahkan `eslint` untuk staged `.ts/.tsx` dan `vitest related`.

---

## 11. Pas 10: Penilaian Kesiapan Produksi

### Skor Per Kategori (0–100)

| Domain                        | Skor | Justifikasi                                                                                                                                                                                  |
| ----------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Arsitektur**                | 60   | ADR 0002 dilanggar total (semua SSR); package boundary lemah; `packages/config/` tidak lengkap; analytics scope tidak konsisten                                                              |
| **Backend**                   | 55   | Envelope + Argon2id + validasi bagus; tapi refresh-token race, IDOR, unitPrice bug, audit log tidak diaudit, Redis tidak terkoneksi, 30+ audit gap                                           |
| **Frontend**                  | 55   | Design tokens solid, sitemap; tapi ADR 0002 fatal, 41 komponen oversize, 17 hardcoded fetch, 0 ErrorBoundary, Rules of Hooks violation                                                       |
| **UI/UX**                     | 65   | Tokens, skip-link, focus-visible bagus; tapi 8 homepage sections hidden, 0 aria-live, 0 dark mode, hamburger tidak auto-close                                                                |
| **Database**                  | 55   | FK indexed baik; tapi 3 Blocker + 5 Critical + 11 High — audit fields absent, soft delete absent, metadata drift, tidak ada CHECK constraints                                                |
| **Keamanan**                  | 35   | Argon2id + JWT + RBAC + CSRF + Helmet; tapi 5 Blocker + 10 Critical + 10 High — KYC terbuka, audit log mutable, refresh token replay, IDOR, token JSON body, rate limit mati default         |
| **Performa**                  | 50   | manualChunks + gzip + prefetch; tapi SSR homepage 3 fetch live, CACHE 1 sequence bottleneck, 75 client:load eager, hanya 3 React.lazy, customers tanpa pagination                            |
| **Infrastruktur**             | 45   | Docker compose + nginx komprehensif; tapi SSL stats subdomain blocker, tidak ada cert renewal, tidak ada manual deploy gate, backup tidak bisa direstore, .gitignore gap                     |
| **Testing**                   | 50   | 2.455 tes masih impressive; tapi integration test tidak dijalankan di CI, E2E assertion lemah, 0 security testing, CSRF tidak dites, hanya Chromium, coverage thresholds tidak di-enforce    |
| **Maintainabilitas**          | 45   | TypeScript strict, permission system mature, shared types/validation; tapi 41 file melanggar size limit, `any` di storage.ts, hardcoded prod URL, cyclomatic complexity >30 di beberapa file |
| **DX (Developer Experience)** | 55   | pnpm + Turborepo + Drizzle bagus; tapi 5 dokumen inventory mismatch, TS version skew (analytics TS5 vs TS6), .env.example punya default lemah                                                |

### **Skor Kesiapan Produksi: 42 / 100**

---

## 12. Rekomendasi Deployment: **Memerlukan Pekerjaan Utama**

Selain perbaikan terhadap seluruh temuan level blocker dan critical:

1. Tidak boleh deploy tanpa memvalidasi bahwa skema database berjalan dan cadangan (backup) dapat dipulihkan dari nol.
2. Tidak boleh membuka domain publik hingga: sertifikat SSL Plausible terbit, HSTS diaktifkan, endpoint KYC diamankan dengan autentikasi, `audit_logs` dikunci lewat trigger database, seluruh celah IDOR pada RBAC diperbaiki, refresh-token rotation bersifat atomik, dan password seed default dihapus.
3. Tidak boleh mengandalkan hasil pengujian keamanan end-to-end sampai infrastruktur (docker compose) berjalan normal dan kekurangan pengujian integrasi dilengkapi kembali.

Jendela keputusan setelah pekerjaan selesai adalah **"Siap dengan Perbaikan Minor"** dalam ~3–4 minggu jika tim mengeksekusi prioritas dengan ketat.

---

## 13. Roadmap Prioritas (Risiko Tertinggi → Terendah)

### Fase 0 — Wajib Pra-Deploy (~15 hari kerja-insinyur)

Setiap item harus selesai sebelum produksi:

1. **Backup restore e2e test** — jalankan `scripts/backup.sh` + restore terhadap DB percobaan; perbaiki format; validasi retensi 30 hari. _(DB-3, 1 hari)_
2. **Audit_logs immutability** — trigger `BEFORE UPDATE/DELETE` + revoke grants. _(DR-19/SEC-3, 1 hari)_
3. **KYC media endpoint auth** — `requireAuth` + ownership scoping; signed URLs. _(SEC-4/BE-5, 2 hari)_
4. **SSL `stats.ahlipanggilan.id`** — tambahkan di certbot + cron renewal. _(INFRA-1/INFRA-2, 1 hari)_
5. **HSTS uncomment** — aktifkan di prod.conf. _(SEC-2, 5 menit)_
6. **Security headers Astro** — middleware atau nginx headers. _(SEC-1, 0.5 hari)_
7. **`RATE_LIMIT_DISABLED=false`** di `.env.example`. _(SEC-5, 30 menit)_
8. **Seed guard** — tolak seed di production; hapus fallback `password123`. _(DB-7/DB-8/SEC-16, 4 jam)_
9. **Refresh-token rotation transaksional** — `SELECT FOR UPDATE` atau atomic `UPDATE RETURNING`. _(BE-3/SEC-6, 0.5 hari)_
10. **Stop returning tokens in JSON body** — cookie-only auth. _(SEC-9, 1 hari)_
11. **CSRF — hapus `/auth/refresh` skip; wajib Origin/Referer**. _(SEC-10, 0.5 hari)_
12. **IDOR coverage** — bookings, payments, partners, media. _(BE-4/BE-5/SEC-12/SEC-13, 2 hari)_
13. **Validator `JWT_SECRET`** — minimum length, denylist. _(SEC-11, 2 jam)_
14. **`POST /payments` role restriction**. _(BE-6, 30 menit)_
15. **Fix `unitPrice` bug** — backfill data. _(BE-7, 0.5 hari)_
16. **Migration tag duplikat 0020** — rename + regenerate. _(DB-2, 1 hari)_
17. **Redis `lazyConnect: false`** — integration test. _(BE-1, 0.5 hari)_
18. **`/analytics/*` auth + RBAC**. _(BE-2, 1 jam)_
19. **Astro `output: 'hybrid'`** — prerender publik sesuai ADR 0002. _(FE-1/PERF-1, 2–4 hari)_
20. **`.gitignore` tambahkan `backups/`**. _(INFRA-10, 10 menit)_
21. **CI jalankan `pnpm test:integration`**. _(TEST-1, 2 jam)_
22. **Magic-byte sniffing pada upload**. _(SEC-14, 1 hari)_

### Fase 1 — Minggu 2–3 (~80–150 jam): Pemulihan Kritis & Kepercayaan Dasar

- Tambahkan `createdBy`/`updatedBy`/`deletedBy` ke 43 tabel + backfill
- `BEFORE UPDATE` trigger untuk `updated_at` di semua tabel
- CHECK constraints pada users.role, payments.status, orders.status
- Unique indexes: partner_skills, seo_metadata, partner_profiles.phone, companies.email
- Soft delete di 27 tabel (terutama payments, assignments, partner_documents)
- Resource_locks auto-pembersihan trigger
- Regenerasi snapshot Drizzle
- Perbaiki crawlable booking numbers (high entropy)
- Prarender halaman publik sesuai ADR 0002
- `createServerClient(token)` di SSR; hapus 17+ fetch yang di-hardcode
- `<ErrorBoundary>` di seluruh React islands
- Fix Rules of Hooks violation di useLockPolling
- 3+ integration tests (auth, payments, assignments, notifications)
- CSRF middleware test
- Security attack pattern tests (SQLi, XSS, IDOR, directory traversal)
- Rename `@spesialis/analytics` → `@ahlipanggilan/analytics`
- Bump analytics ke TS ^6.0.3, vitest ^4.1.9
- Manual approval gate di deploy.yml
- Cron backup harian via systemd timer
- Cron perpanjangan SSL mingguan
- `IMAGE_OWNER` alignment
- `cap_drop: ALL` + `no-new-privileges:true` di compose
- `USER node` di Dockerfiles

### Fase 2 — Bulan 2–3: Pemeliharaan & Standar Kelas Industri

- `eslint-plugin-import no-restricted-paths` (UI → database/api forbidden)
- Split 13 komponen >500 baris dan 28+ komponen >200 baris
- Coverage thresholds `--coverage.enabled` + lcov upload
- Playwright Firefox/Safari/Edge + Mobile/Tablet devices
- Ganti `test.skip` dengan `test.fail` untuk seed-missing
- Perbaiki E2E assertion lemah (3+ file)
- `@lhci/cli` + ambang batas Lighthouse
- `@axe-core/playwright` untuk a11y audit
- Size-limit/bundlesize pada chunk kritis
- Sidecar container pg_dump untuk backup + Plausible + ClickHouse backup
- Cloudflare `purge_cache` pada post-deploy
- Pisahkan jaringan Docker backend/frontend
- Analytics migrasi penuh ke `@ahlipanggilan/*`
- Persona Playwright untuk matriks IDOR lintas-role
- Perbaiki state machine pemesanan: tambah langkah `Confirmed` sebenarnya
- Resource_locks cron pembersihan
- Cloudflare real_ip config di Nginx
- `bodyLimit` middleware
- Bump CACHE sequence 1 → 50-100

### Fase 3 — Jangka Panjang (>3 bulan): Penyempurnaan Menyeluruh

- Seluruh temuan medium/low yang tersisa (~150+ temuan)
- Verifikasi target p95 / LCP 500ms dengan Lighthouse di CI
- Backfill 1.000+ baris data dengan nilai `updated_at` yang tidak akurat
- Audit log immutability kriptografis (hash chain) — jika diperlukan untuk audit eksternal
- Penetration testing eksternal sebelum rilis publik penuh

---

## 14. Validasi Severitas & Total Temuan

| Severitas        | Definisi                                                                                                      | Jumlah (estimasi) |
| ---------------- | ------------------------------------------------------------------------------------------------------------- | ----------------- |
| **Blocker**      | Platform diluncurkan → HTTPS down / kebocoran data / data tidak bisa dipulihkan → **tunda peluncuran segera** | 11                |
| **Critical**     | Bug fungsional atau celah keamanan yang bisa dieksploitasi langsung → berisiko insiden <24 jam setelah rilis  | ~30               |
| **High**         | Penting untuk jangka panjang, kepatuhan, dokumentasi → bisa ditahan 1–3 bulan                                 | ~90               |
| **Medium**       | Technical debt, kebersihan kode → prioritas rendah                                                            | ~100              |
| **Low/Cosmetic** | Minor nits, style → backlog                                                                                   | ~200              |

Distribusi per domain:

| Domain          | Blocker | Critical | High   | Medium  | Low     |
| --------------- | ------- | -------- | ------ | ------- | ------- |
| Database        | 3       | 7        | 11     | 15      | 22      |
| Backend         | 2       | 7        | 10     | 20      | 13      |
| Frontend        | 5       | 5        | 15     | 30      | 41      |
| UI/UX           | 1       | 2        | 5      | 10      | 5       |
| Security        | 5       | 11       | 10     | 15      | 11      |
| Performance     | 1       | 3        | 8      | 10      | 5       |
| Infrastructure  | 3       | 5        | 15     | 30      | 49      |
| Testing         | 4       | 5        | 10     | 10      | 4       |
| Architecture    | 1       | 2        | 5      | 5       | 7       |
| Shared Packages | 0       | 3        | 10     | 20      | 40      |
| **Total**       | **25**  | **50**   | **99** | **165** | **197** |

> _Catatan: Beberapa temuan tumpang tindih antar domain (mis. DB-19 = SEC-3, FE-1 = PERF-1, DB-7 = SEC-16). Angka di atas adalah deduplicated estimates._

---

## 15. Catatan Akhir Auditor

**Kesimpulan:** Platform ini memiliki fondasi yang kuat — 2.455 tes, 43 tabel dengan relasi, 208 endpoint API, 45 komponen UI, 29 spesifikasi E2E. Dokumentasi bisnis dan teknis komprehensif.

Namun, **ketidaksesuaian implementasi vs dokumentasi** di setiap level (ADR 0002 SSG violation, inventory mismatch, Redis yang tidak terkoneksi, audit fields absent, backup yang tidak bisa dipulihkan) dan **celah keamanan fundamental** (KYC exposure, audit log mutability, IDOR, token JSON leakage, default weak credentials) menempatkan platform ini pada **skor kesiapan produksi 42/100** — tergolong **"Memerlukan Pekerjaan Utama"**.

Fase 0 (~15 hari kerja) wajib diselesaikan sebelum peluncuran publik. Setelah Fase 0 + 1 selesai (~3–4 minggu), platform akan berada di posisi **"Siap dengan Perbaikan Minor"**. Setelah Fase 2 selesai (2–3 bulan), platform akan mencapai kriteria keamanan dan maintainability kelas industri.

Tidak direkomendasikan untuk meluncurkan `ahlipanggilan.id` ke publik sebelum Fase 0 selesai.
