# Database Documentation

# Table: services

Version: 1.0

---

# Purpose

Master seluruh layanan.

Admin dapat menambah Service baru tanpa deploy.

---

# Columns

id

category_id

name

slug

short_description

description

base_price

estimated_duration

warranty_days

thumbnail

is_active

is_featured

display_order

created_at

updated_at

deleted_at

---

# Relationship

categories

↓

services

1:N

---

services

↓

order_items

1:N

---

services

↓

seo_metadata

1:1

---

# Business Rules

Slug unik.

Harga dasar hanya estimasi.

Service dapat di-nonaktifkan.

Service dapat Featured.

---

# Index

slug

category_id

is_active

display_order

---

# Example

Cleaning AC

Service AC

Isi Freon

Bongkar Pasang AC

Instalasi AC

Plumbing

Cleaning

Electrical
