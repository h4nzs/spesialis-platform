# Database Documentation

# Table: order_items

Version: 1.0

---

# Purpose

Satu Order dapat memiliki lebih dari satu layanan.

Tabel ini menyimpan detail setiap layanan yang dipesan.

---

# Columns

id

order_id

service_id

service_name_snapshot

quantity

unit_price

subtotal

notes

created_at

updated_at

---

# Relationships

orders

↓

order_items

1:N

---

services

↓

order_items

1:N

---

# Business Rules

Nama Service disimpan sebagai Snapshot.

Perubahan nama Service di masa depan tidak mengubah histori Order.

Harga juga disimpan sebagai Snapshot.

---

# Formula

subtotal

=

quantity

×

unit_price

---

# Constraints

quantity > 0

unit_price >= 0

subtotal >= 0

---

# Index

order_id

service_id
