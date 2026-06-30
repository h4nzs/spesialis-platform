# Database Documentation

# Table: system_settings

Version: 1.0

---

# Purpose

Menyimpan konfigurasi sistem.

---

# Categories

General

Booking

Partner

SEO

Email

WhatsApp

Storage

Security

Invoice

Company

---

# Columns

id

category

key

value

description

updated_by

updated_at

---

# Example

booking.max_photo

booking.default_duration

company.name

company.phone

seo.default_title

seo.default_description

whatsapp.admin_number

storage.disk

---

# Business Rules

Seluruh konfigurasi dapat diubah melalui Directus.

Tidak memerlukan deploy ulang.
