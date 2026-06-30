# Database Documentation

# Table: reviews

Version: 1.0

---

# Purpose

Menyimpan penilaian Customer.

---

# Columns

id UUID

order_id UUID

customer_id UUID

partner_id UUID

rating NUMERIC(2,1)

review TEXT

created_at TIMESTAMP

updated_at TIMESTAMP

---

# Rating

Rentang: 1.0 — 5.0

Step: 0.5

Contoh: 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0

Tipe: NUMERIC(2,1) — presisi 2 digit total, 1 desimal.

---

# Relationships

orders

↓

reviews

1:1

---

customer_profiles

↓

reviews

1:N

---

partner_profiles

↓

reviews

1:N

---

# Business Rules

Review hanya dapat dibuat apabila Order Completed.

Satu Order hanya memiliki satu Review.

Review tidak dapat diedit setelah Publish.

---

# Index

order_id

partner_id

rating
