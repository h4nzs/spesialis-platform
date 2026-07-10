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

Commission

Partner

Security

WhatsApp

Sitemap

SEO Permissions

Email

Storage

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

# Sitemap Settings (category: `sitemap`)

| Key                             | Default | Description                         |
| ------------------------------- | ------- | ----------------------------------- |
| sitemap_static_pages_priority   | 1.0     | Prioritas halaman statis di sitemap |
| sitemap_static_pages_changefreq | weekly  | Frekuensi perubahan halaman statis  |
| sitemap_services_priority       | 0.8     | Prioritas halaman layanan           |
| sitemap_services_changefreq     | weekly  | Frekuensi perubahan halaman layanan |
| sitemap_articles_priority       | 0.7     | Prioritas halaman artikel           |
| sitemap_articles_changefreq     | weekly  | Frekuensi perubahan halaman artikel |
| sitemap_blog_listing_priority   | 0.8     | Prioritas halaman blog listing      |
| sitemap_blog_listing_changefreq | daily   | Frekuensi perubahan blog listing    |
| sitemap_cms_pages_priority      | 0.6     | Prioritas halaman CMS               |
| sitemap_cms_pages_changefreq    | monthly | Frekuensi perubahan halaman CMS     |
| indexnow_key                    | —       | IndexNow API key (UUID v4)          |
| indexnow_enabled                | false   | Aktifkan IndexNow auto-ping         |

# SEO Permissions (category: `seo_permissions`)

Key format: `perm_{feature}` → middleware mapping: `perm_seo_meta` → `seo.meta`

| Key                       | Default Roles                       | Description                  |
| ------------------------- | ----------------------------------- | ---------------------------- |
| perm_seo_meta             | admin, super_admin, content_manager | Izin mengelola SEO metadata  |
| perm_seo_bulk             | admin, super_admin                  | Izin SEO bulk edit           |
| perm_seo_audit            | admin, super_admin, content_manager | Izin mengakses SEO audit     |
| perm_seo_redirects        | admin, super_admin                  | Izin mengelola redirects     |
| perm_seo_404_monitor      | admin, super_admin, content_manager | Izin memantau 404 errors     |
| perm_seo_indexnow         | admin, super_admin                  | Izin mengelola IndexNow      |
| perm_seo_schema           | admin, super_admin, content_manager | Izin mengelola Schema Markup |
| perm_seo_sitemap_settings | admin, super_admin                  | Izin mengatur sitemap        |

Empty value = revoke all non-admin roles.

---

# Examples (general)

booking.max_photo

booking.default_duration

company.name

company.phone

whatsapp.admin_number

storage.disk

---

# Business Rules

Seluruh konfigurasi dapat diubah melalui API/Settings panel.

Tidak memerlukan deploy ulang.
