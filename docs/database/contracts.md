# Contracts

Tabel `contracts` menyimpan kontrak antara platform dan perusahaan korporat.

## Schema

| Column           | Type            | Default           | Description                   |
| ---------------- | --------------- | ----------------- | ----------------------------- |
| id               | uuid            | gen_random_uuid() | Primary key                   |
| company_id       | uuid(companies) | —                 | Perusahaan                    |
| contract_number  | varchar(50)     | —                 | Nomor kontrak (unique)        |
| start_date       | date            | —                 | Tanggal mulai                 |
| end_date         | date            | null              | Tanggal berakhir              |
| status           | varchar(20)     | 'active'          | active / expired / terminated |
| discount_percent | numeric(5,2)    | 0                 | Diskon persentase             |
| discount_amount  | numeric(15,2)   | 0                 | Diskon nominal                |
| notes            | text            | null              | Catatan                       |
| created_at       | timestamptz     | now()             | Audit                         |
| updated_at       | timestamptz     | now()             | Audit                         |
| deleted_at       | timestamptz     | null              | Soft delete                   |

## Indexes

- `contracts_pkey` — Primary key
- `contracts_contract_number_unique` — Unique contract number
- `contracts_company_id_idx` — Filter by company
- `contracts_status_idx` — Filter by status

## Relations

- `company_id` → `companies.id`
- `invoices.contract_id` → `contracts.id`
