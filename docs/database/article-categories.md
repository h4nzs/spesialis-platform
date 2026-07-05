# Article Categories

Tabel `article_categories` menyimpan kategori untuk konten artikel/CMS.

## Schema

| Column      | Type         | Default           | Description       |
| ----------- | ------------ | ----------------- | ----------------- |
| id          | uuid         | gen_random_uuid() | Primary key       |
| name        | varchar(255) | —                 | Nama kategori     |
| slug        | varchar(255) | —                 | URL slug (unique) |
| description | text         | null              | Deskripsi         |
| created_at  | timestamptz  | now()             | Audit             |
| updated_at  | timestamptz  | now()             | Audit             |

## Indexes

- `article_categories_pkey` — Primary key
- `article_categories_slug_unique` — Unique slug

## Relations

- `articles.category_id` → `article_categories.id`
