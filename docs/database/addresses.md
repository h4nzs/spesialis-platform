# Database Documentation

# Table: addresses

Version: 1.0

---

# Purpose

Menyimpan Address milik Customer.

---

# Columns

id

customer_id

label

receiver_name

receiver_phone

province

city

district

postal_code

address

latitude

longitude

is_default

notes

created_at

updated_at

deleted_at

---

# Relationship

customer

↓

addresses

1:N

---

orders

↓

address_id

N:1

---

# Business Rules

Customer dapat memiliki banyak Address.

Hanya satu Address yang menjadi Default.

Order tetap menggunakan Snapshot Address.

Perubahan Address tidak mengubah histori Order.

---

# Index

customer_id

city

province

---

# Example

Home

Office

Apartment

Warehouse
