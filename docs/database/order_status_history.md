# Database Documentation

# Table: order_status_history

Version: 1.0

---

# Purpose

Menyimpan riwayat perubahan status Order (immutable log).

Setiap kali status Order berubah, record baru ditambahkan ke tabel ini.

---

# Columns

| Column      | Type        | Nullable | Description       |
| ----------- | ----------- | -------- | ----------------- |
| id          | UUID        | No       | Primary Key       |
| order_id    | UUID        | No       | FK → orders.id    |
| from_status | VARCHAR(40) | Yes      | Status sebelumnya |
| to_status   | VARCHAR(40) | No       | Status baru       |
| changed_by  | UUID        | No       | FK → users.id     |
| note        | TEXT        | Yes      | Catatan perubahan |
| created_at  | TIMESTAMP   | No       | Waktu perubahan   |

---

# Constraints

- order_id NOT NULL
- to_status NOT NULL
- changed_by NOT NULL

---

# Index

- order_id
- created_at

---

# Business Rules

- Record tidak boleh di-update atau dihapus (immutable).
- Setiap transisi status wajib dicatat.
- `from_status` boleh NULL untuk status pertama (Draft).

---

# Relationships

order_status_history → orders (N : 1)

---

# API Dependencies

GET /orders/:id/timeline

---

# UI Dependencies

- Order Detail Page
- Admin Timeline View
