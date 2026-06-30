# docs/directus/collections.md

# Directus Collections

Version: 1.0

---

# Overview

Setiap Business Entity direpresentasikan sebagai Directus Collection.

Collection dibagi menjadi dua kategori.

System Collection

Business Collection

---

# Authentication

directus_users

directus_roles

directus_permissions

directus_files

directus_folders

---

# Business Collections

> **Catatan:** Nama Collection Directus = nama tabel database (snake_case).
> Tidak ada collection `customers` atau `partners` — data Customer dan Partner disimpan di `customer_profiles` dan `partner_profiles`.

customer_profiles

partner_profiles

partner_skills

companies

company_users

branches

services

service_categories

orders

order_items

assignments

payments

reviews

complaints

notifications

articles

article_categories

faq

seo_metadata

system_settings

audit_logs

---

# Hidden Collections

order_status_history

partner_availability_logs

payment_logs

notification_logs

---

# Singleton

homepage

company_information

website_settings

seo_settings
