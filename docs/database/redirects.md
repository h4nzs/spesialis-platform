# Database Documentation

# Table: redirects

Version: 1.0

---

# Purpose

Menyimpan konfigurasi URL redirect (301/302).

---

# Columns

| Column      | Type         | Default           | Description                     |
| ----------- | ------------ | ----------------- | ------------------------------- |
| id          | uuid         | gen_random_uuid() | Primary key                     |
| source_path | varchar(500) | —                 | Path asal (contoh: /old-page)   |
| target_path | varchar(500) | —                 | Path tujuan (contoh: /new-page) |
| status_code | integer      | 301               | HTTP status code (301 atau 302) |
| is_active   | boolean      | true              | Apakah redirect aktif           |
| notes       | text         | null              | Catatan internal                |
| created_at  | timestamptz  | now()             | Audit                           |
| updated_at  | timestamptz  | now()             | Audit                           |

# Indexes

- `redirects_pkey` — Primary key
- `idx_redirects_source_path` — Pencarian source path (unique)
- `idx_redirects_active` — Filter by active status

# Business Rules

- Duplicate source path tidak diizinkan (409 CONFLICT)
- Hanya redirect dengan `is_active = true` yang dieksekusi oleh middleware
- Path harus dimulai dengan `/`
- Status code: 301 (Permanent) atau 302 (Temporary)
- Middleware `redirectCheck` otomatis menjalankan redirect saat 404 terjadi
