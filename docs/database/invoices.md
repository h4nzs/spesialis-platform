# Invoices

Tabel `invoices` menyimpan invoice untuk transaksi korporat.

## Schema

| Column         | Type            | Default           | Description                               |
| -------------- | --------------- | ----------------- | ----------------------------------------- |
| id             | uuid            | gen_random_uuid() | Primary key                               |
| order_id       | uuid(orders)    | —                 | Order terkait                             |
| contract_id    | uuid(contracts) | null              | Kontrak terkait                           |
| invoice_number | varchar(50)     | —                 | Nomor invoice (unique)                    |
| amount         | numeric(15,2)   | —                 | Jumlah tagihan                            |
| status         | varchar(20)     | 'draft'           | draft / sent / paid / overdue / cancelled |
| issued_at      | timestamptz     | null              | Tanggal terbit                            |
| paid_at        | timestamptz     | null              | Tanggal dibayar                           |
| due_date       | date            | null              | Jatuh tempo                               |
| notes          | text            | null              | Catatan                                   |
| created_at     | timestamptz     | now()             | Audit                                     |
| updated_at     | timestamptz     | now()             | Audit                                     |
| deleted_at     | timestamptz     | null              | Soft delete                               |

## Indexes

- `invoices_pkey` — Primary key
- `invoices_invoice_number_unique` — Unique invoice number
- `invoices_order_id_idx` — Filter by order
- `invoices_contract_id_idx` — Filter by contract
- `invoices_status_idx` — Filter by status

## Relations

- `order_id` → `orders.id`
- `contract_id` → `contracts.id`
