# Articles

Tabel `articles` menyimpan konten artikel/CMS untuk halaman publik.

## Schema

| Column         | Type                     | Default           | Description                  |
| -------------- | ------------------------ | ----------------- | ---------------------------- |
| id             | uuid                     | gen_random_uuid() | Primary key                  |
| title          | varchar(255)             | —                 | Judul artikel                |
| slug           | varchar(255)             | —                 | URL slug (unique)            |
| content        | text                     | —                 | Konten (HTML/Markdown)       |
| excerpt        | text                     | null              | Ringkasan                    |
| cover_media_id | uuid(media)              | null              | Cover image                  |
| category_id    | uuid(article_categories) | null              | Kategori                     |
| status         | varchar(20)              | 'draft'           | draft / published / archived |
| published_at   | timestamptz              | null              | Waktu publish                |
| author_id      | uuid(users)              | null              | Penulis                      |
| created_at     | timestamptz              | now()             | Audit                        |
| updated_at     | timestamptz              | now()             | Audit                        |
| deleted_at     | timestamptz              | null              | Soft delete                  |

## Indexes

- `articles_pkey` — Primary key
- `articles_slug_unique` — Unique slug
- `articles_status_idx` — Filter by status
- `articles_category_id_idx` — Filter by category

## Relations

- `category_id` → `article_categories.id`
- `cover_media_id` → `media.id`
- `author_id` → `users.id`

## Notes

- Hanya status `published` yang tampil di public API.
- Admin dapat melihat semua status.
