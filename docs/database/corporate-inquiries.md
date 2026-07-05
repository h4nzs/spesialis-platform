# Corporate Inquiries

Tabel `corporate_inquiries` menyimpan inquiry dari perusahaan yang tertarik menggunakan platform.

## Schema

| Column         | Type         | Default           | Description                                            |
| -------------- | ------------ | ----------------- | ------------------------------------------------------ |
| id             | uuid         | gen_random_uuid() | Primary key                                            |
| company_name   | varchar(255) | —                 | Nama perusahaan                                        |
| legal_name     | varchar(255) | null              | Nama legal (sesuai akta)                               |
| email          | varchar(255) | —                 | Email kontak                                           |
| phone          | varchar(50)  | —                 | Nomor HP kontak                                        |
| industry       | varchar(255) | null              | Industri perusahaan                                    |
| employee_count | integer      | null              | Jumlah karyawan                                        |
| notes          | text         | null              | Catatan tambahan                                       |
| status         | varchar(30)  | 'Pending'         | Pending / Contacted / Negotiation / Converted / Closed |
| handled_by     | uuid         | null              | Admin yang menangani                                   |
| handled_at     | timestamp    | null              | Waktu ditangani                                        |
| created_at     | timestamptz  | now()             | Audit                                                  |
| updated_at     | timestamptz  | now()             | Audit                                                  |
| deleted_at     | timestamptz  | null              | Soft delete                                            |

## Indexes

- `corporate_inquiries_pkey` — Primary key
- `idx_corporate_inquiries_status` — Filter by status
- `idx_corporate_inquiries_email` — Lookup by email

## Notes

- Inquiry dibuat melalui endpoint publik (tanpa auth).
- Admin mengubah status mengikuti flow: Pending → Contacted → Negotiation → Converted/Closed.
- Saat status Converted, admin dapat membuat akun perusahaan melalui endpoint `/companies`.
