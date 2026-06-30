# Database Documentation

# Table: media

Version: 1.0

---

# Purpose

Media Library.

Seluruh file disimpan di tabel ini.

---

# Columns

id

disk

path

filename

mime_type

extension

size

width

height

uploaded_by

created_at

---

# Disk

Local

Cloudflare R2

---

# Relationships

Media dapat digunakan oleh.

Articles

Services

Orders

Partners

Companies

Review

Complaint

KTP

Avatar

SEO

---

# Business Rules

File fisik berada di Storage.

Database hanya menyimpan Metadata.
