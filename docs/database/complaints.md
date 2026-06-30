# Database Documentation

# Table: complaints

Version: 1.0

---

# Purpose

Menyimpan seluruh Complaint Customer.

---

# Columns

id

order_id

customer_id

status

title

description

resolution

resolved_by

resolved_at

created_at

updated_at

---

# Status

Open

Investigating

Resolved

Closed

---

# Relationships

orders

↓

complaints

1:N

---

users

↓

resolved_by

N:1

---

# Business Rules

Complaint hanya dapat dibuat oleh Customer.

Complaint tidak dapat dihapus.

Semua Resolution masuk Audit Log.
