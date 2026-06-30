# Database Design

Project: Specialist Platform

Version: 1.0

---

# 1. Overview

Database menggunakan PostgreSQL 18.

Seluruh schema mengikuti prinsip:

- Normalized
- Foreign Key
- Soft Delete
- Audit Friendly

---

# 2. Naming Convention

Database

snake_case

Table

snake_case

Column

snake_case

Foreign Key

customer_id

partner_id

service_id

---

# 3. Primary Key

Semua tabel menggunakan:

UUID

Contoh.

id UUID PRIMARY KEY

---

# 4. Audit Fields

Semua tabel memiliki.

created_at

updated_at

deleted_at

created_by

updated_by

deleted_by

---

# 5. Main Tables

users

customer_profiles

partner_profiles

companies

addresses

services

service_categories

orders

order_items

assignments

payments

reviews

complaints

notifications

media

articles

faq

seo_metadata

audit_logs

system_settings

---

# 6. Relationships

User

↓

Customer Profile

↓

Orders

↓

Assignments

↓

Payments

↓

Reviews

---

Partner

↓

Assignments

↓

Orders

---

Service

↓

Order Items

---

Company

↓

Branches

↓

Orders

---

# 7. Soft Delete

Menggunakan deleted_at.

Data tidak dihapus permanen.

---

# 8. Index

Semua Foreign Key memiliki Index.

Search Column memiliki Index.

Booking Number memiliki Unique Index.

Email memiliki Unique Index.

Phone memiliki Unique Index.

---

# 9. Transactions

Booking.

↓

Assignment.

↓

Payment.

Menggunakan Database Transaction.

---

# 10. Migration

Semua perubahan Database menggunakan Migration.

Tidak diperbolehkan mengubah Database Production secara manual.

---

# 11. Backup

Daily Backup.

Retention.

30 hari.

---

# 12. Future

Read Replica.

Partitioning.

Sharding apabila diperlukan.
