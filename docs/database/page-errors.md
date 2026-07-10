# Database Documentation

# Table: page_errors

Version: 1.0

---

# Purpose

Menyimpan log 404 errors untuk monitoring broken links.

---

# Columns

| Column     | Type         | Default           | Description                    |
| ---------- | ------------ | ----------------- | ------------------------------ |
| id         | uuid         | gen_random_uuid() | Primary key                    |
| path       | varchar(500) | —                 | URL path yang menghasilkan 404 |
| referer    | varchar(500) | null              | Halaman asal pengunjung        |
| user_agent | varchar(500) | null              | User agent browser             |
| count      | integer      | 1                 | Jumlah error terjadi           |
| first_seen | timestamptz  | now()             | Pertama kali error             |
| last_seen  | timestamptz  | now()             | Terakhir kali error            |

# Indexes

- `page_errors_pkey` — Primary key
- `idx_page_errors_path` — Pencarian by path
- `idx_page_errors_last_seen` — Sorting by last occurrence

# Business Rules

- Entry dibuat otomatis oleh middleware `redirectCheck` di `apps/api/src/middleware/redirect-check.ts`
- Jika path sudah ada, `count` di-increment dan `last_seen` diupdate
- Admin dapat menghapus individual entry atau clear all
- Stats tersedia: total errors, top 10 paths, errors in last 24h
