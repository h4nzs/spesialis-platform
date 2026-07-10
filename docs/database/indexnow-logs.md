# Database Documentation

# Table: indexnow_logs

Version: 1.0

---

# Purpose

Menyimpan log ping IndexNow untuk monitoring notifikasi konten baru ke search engine.

---

# Columns

| Column      | Type          | Default           | Description                           |
| ----------- | ------------- | ----------------- | ------------------------------------- |
| id          | uuid          | gen_random_uuid() | Primary key                           |
| url         | varchar(1000) | —                 | URL yang di-notifikasi ke IndexNow    |
| status      | varchar(20)   | —                 | Status ping: `success` atau `error`   |
| status_code | integer       | null              | HTTP status code dari IndexNow server |
| destination | varchar(50)   | 'indexnow'        | Destination API (default: indexnow)   |
| response    | text          | null              | Response body dari IndexNow server    |
| created_at  | timestamptz   | now()             | Waktu ping                            |

# Indexes

- `indexnow_logs_pkey` — Primary key
- `idx_indexnow_logs_created_at` — Sorting by time (descending)
- `idx_indexnow_logs_status` — Filter by success/error
- `idx_indexnow_logs_url` — Pencarian by URL

# Business Rules

- Log dibuat otomatis setiap kali artikel dipublish (via `notifyArticlePublished` di `apps/api/src/lib/indexnow.ts`)
- Stats dashboard: total ping, success count, error count, success rate %
- Admin dapat melihat 50 log terbaru
