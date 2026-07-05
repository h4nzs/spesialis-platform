# FAQ

Tabel `faq` menyimpan pertanyaan dan jawaban untuk halaman FAQ publik.

## Schema

| Column        | Type        | Default           | Description                                                |
| ------------- | ----------- | ----------------- | ---------------------------------------------------------- |
| id            | uuid        | gen_random_uuid() | Primary key                                                |
| question      | text        | —                 | Pertanyaan                                                 |
| answer        | text        | —                 | Jawaban                                                    |
| category      | varchar(50) | null              | Kategori (booking, akun, pembayaran, mitra, layanan, umum) |
| display_order | integer     | 0                 | Urutan tampilan                                            |
| is_active     | boolean     | true              | Aktif/tidak                                                |
| created_at    | timestamptz | now()             | Audit                                                      |
| updated_at    | timestamptz | now()             | Audit                                                      |
| created_by    | uuid(users) | null              | Pembuat                                                    |
| updated_by    | uuid(users) | null              | Pengubah                                                   |
| deleted_at    | timestamptz | null              | Soft delete                                                |

## Indexes

- `faq_pkey` — Primary key
- `faq_category_idx` — Filter by category
- `faq_display_order_idx` — Sorting

## Relations

- `created_by` → `users.id`
- `updated_by` → `users.id`

## Notes

- Hanya entries dengan `is_active = true` dan `deleted_at IS NULL` yang tampil di public API.
- Admin dapat melihat semua entries termasuk non-active.
- Categories bersifat enum string, bukan foreign key.
