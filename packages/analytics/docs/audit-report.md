# Audit Report — Backend API vs Frontend UI Coverage

## Methodology

- Audit semua API route files → extract endpoints
- Audit semua frontend page files → list UI pages
- Cross-reference → identify gaps (API exists but no UI page)
- Analyze Sidebar nav entries → check if all UI pages are linked

## Results

### ✅ Fully Covered (API + UI + Sidebar)

| Domain                    | API Endpoints                              | UI Page                                      | Sidebar                   |
| ------------------------- | ------------------------------------------ | -------------------------------------------- | ------------------------- |
| Admin Dashboard           | GET /admin/dashboard                       | /dashboard/admin/index.astro                 | ✅ Ringkasan              |
| Admin Bookings            | GET/POST/PATCH admin/orders + bookings     | /dashboard/admin/bookings.astro              | ✅ Booking                |
| Admin Partners            | CRUD admin/partners                        | /dashboard/admin/partners.astro              | ✅ Partner                |
| Admin Customers           | CRUD customers                             | /dashboard/admin/customers.astro             | ✅ Customer               |
| Admin Users               | CRUD admin/users                           | /dashboard/admin/users.astro                 | ✅ User                   |
| Admin Services            | CRUD admin/services                        | /dashboard/admin/services.astro              | ✅ Layanan                |
| Admin Service Categories  | CRUD admin/service-categories              | /dashboard/admin/service-categories.astro    | ✅ Kategori (Layanan)     |
| Admin Articles            | CRUD admin/articles + new/edit             | /dashboard/admin/articles.astro + new + edit | ✅ Artikel                |
| Admin Article Categories  | CRUD admin/articles/categories             | /dashboard/admin/articles/categories.astro   | ✅ Kategori (Artikel) NEW |
| Admin Pillar Clusters     | GET admin/articles/pillar-overview + links | /dashboard/admin/pillar-clusters.astro       | ✅ Cluster Visualizer     |
| Admin Contracts           | CRUD admin/contracts                       | /dashboard/admin/contracts.astro + detail    | ✅ Kontrak                |
| Admin Invoices            | CRUD admin/invoices                        | /dashboard/admin/invoices.astro + detail     | ✅ Invoice                |
| Admin FAQ                 | CRUD admin/faq                             | /dashboard/admin/faq.astro                   | ✅ FAQ                    |
| Admin Testimonials        | CRUD admin/testimonials                    | /dashboard/admin/testimonials.astro          | ✅ Testimoni              |
| Admin CMS Pages           | CRUD admin/cms-pages                       | /dashboard/admin/cms-pages.astro             | ✅ Halaman                |
| Admin Media               | CRUD media                                 | /dashboard/admin/media.astro                 | ✅ Media                  |
| Admin SEO Redirects       | CRUD admin/redirects                       | /dashboard/admin/seo/redirects.astro         | ✅ Redirect (di SEO)      |
| Admin SEO Audit           | GET admin/seo/audit                        | /dashboard/admin/seo/audit.astro             | ✅ SEO Audit (di SEO)     |
| Admin SEO 404 Monitor     | CRUD admin/page-errors                     | /dashboard/admin/seo/404-monitor.astro       | ✅ 404 Monitor (di SEO)   |
| Admin SEO Bulk Edit       | POST admin/seo/bulk                        | /dashboard/admin/seo/bulk-edit.astro         | ✅ Bulk SEO (di SEO)      |
| Admin Reports             | GET admin/reports                          | /dashboard/admin/reports.astro               | ✅ Laporan                |
| Admin Penalties           | CRUD admin/penalties                       | /dashboard/admin/penalties.astro             | ✅ Penalty                |
| Admin Funnels             | GET/POST analytics/funnels                 | /dashboard/admin/funnels.astro               | ✅ Funnel                 |
| Admin Settings            | GET/PATCH admin/settings                   | /dashboard/admin/settings.astro              | ✅ Pengaturan             |
| Admin Audit Logs          | GET admin/audit-logs                       | /dashboard/admin/audit-logs.astro            | ✅ Audit Log              |
| Admin Coverage Areas      | CRUD admin/coverage-areas                  | /dashboard/admin/coverage-areas.astro        | ✅ Area Layanan           |
| Admin Service Suggestions | GET/PATCH/DELETE admin/service-suggestions | /dashboard/admin/service-suggestions.astro   | ✅ Usulan Layanan         |
| Customer Dashboard        | GET /customers/me                          | /dashboard/customer/index.astro              | ✅ Ringkasan              |
| Customer Orders           | GET bookings                               | /dashboard/customer/orders.astro             | ✅ Pesanan                |
| Customer Addresses        | CRUD addresses                             | /dashboard/customer/addresses.astro          | ✅ Alamat                 |
| Customer Reviews          | POST/GET reviews                           | /dashboard/customer/reviews.astro            | ✅ Ulasan                 |
| Customer Complaints       | POST/GET complaints                        | /dashboard/customer/complaints.astro         | ✅ Komplain               |
| Customer Settings         | PATCH customers/me                         | /dashboard/customer/settings.astro           | ✅ Pengaturan             |
| Partner Dashboard         | GET partners/me                            | /dashboard/partner/index.astro               | ✅ Ringkasan              |
| Partner Jobs              | GET partners/me/jobs                       | /dashboard/partner/jobs.astro                | ✅ Pekerjaan              |
| Partner Availability      | PATCH partners/me                          | /dashboard/partner/availability.astro        | ✅ Ketersediaan           |
| Partner Earnings          | GET partners/me/earnings                   | /dashboard/partner/earnings.astro            | ✅ Pendapatan             |
| Partner Penalties         | GET partners/me/penalties                  | /dashboard/partner/penalties.astro           | ✅ Penalty                |
| Partner Reviews           | GET partners/:id/reviews                   | /dashboard/partner/reviews.astro             | ✅ Ulasan                 |
| Partner Settings          | PATCH partners/me                          | /dashboard/partner/settings.astro            | ✅ Pengaturan             |
| Corporate Dashboard       | GET companies/me                           | /dashboard/corporate/index.astro             | ✅ Ringkasan              |
| Corporate Orders          | GET bookings (corporate)                   | /dashboard/corporate/orders.astro            | ✅ Pesanan                |
| Corporate Invoices        | GET invoices (corporate)                   | /dashboard/corporate/invoices.astro          | ✅ Invoice                |
| Corporate Contract        | GET/ PATCH contracts                       | /dashboard/corporate/contracts.astro         | ✅ Kontrak                |
| Corporate Branches        | CRUD companies/branches                    | /dashboard/corporate/branches.astro          | ✅ Cabang                 |
| Corporate Settings        | PATCH companies                            | /dashboard/corporate/settings.astro          | ✅ Pengaturan             |

### ❌ GAP: API Exists But No UI Page

#### Gap 1: Corporate Inquiries Management (Admin)

- **API:** `apps/api/src/routes/corporate-inquiries.ts`
  - `POST /api/v1/corporate-inquiries` — submit inquiry (public, via corporate page)
  - `GET /api/v1/corporate-inquiries` — list all inquiries (admin only)
  - `GET /api/v1/corporate-inquiries/:id` — get inquiry detail (admin)
  - `PATCH /api/v1/corporate-inquiries/:id` — update status (admin)
- **UI:** Tidak ada halaman admin untuk melihat/mengelola inquiries
- **Impact:** Admin tidak bisa melihat daftar leads corporate atau mengubah statusnya
- **Sidebar:** Tidak ada link

#### Gap 2: Partner Documents Upload (Partner Dashboard)

- **API:** `apps/api/src/routes/partners.ts`
  - `GET /api/v1/partners/me/documents` — list documents
  - `POST /api/v1/partners/me/documents` — upload document
  - `DELETE /api/v1/partners/me/documents/:documentId` — delete document
- **UI:** Tidak ada halaman/komponen untuk upload dokumen di partner dashboard
- **Impact:** Partner tidak bisa upload dokumen persyaratan (KTP, foto, dll)
- **Sidebar:** Tidak ada link

#### Gap 3: Audit Logs (Other Roles)

- **API:** `apps/api/src/routes/audit-logs.ts`
  - `GET /api/v1/admin/audit-logs` — list logs
- **UI:** Halaman `/dashboard/admin/audit-logs.astro` sudah ada ✅
- **BUT:** Hanya di Sidebar admin/super_admin. Role lain tidak bisa akses
- **Status: ✅ Covered for admin, no gap for other roles (expected)**

#### Gap 4: Public Tracking Page Detail

- **API:** `apps/api/src/routes/bookings.ts`
  - `GET /api/v1/bookings/tracking/:bookingNumber` — public tracking
- **UI:** Halaman `/tracking.astro` sudah ada, tapi mungkin perlu component yang lebih rich
- **Status: ✅ Minimal covered**

#### Gap 5: CMS Revalidation

- **API:** `apps/api/src/routes/cms-revalidation.ts`
  - `POST /api/v1/cms/revalidate` — trigger CMS cache revalidation
- **UI:** Tidak ada UI button untuk trigger revalidation manual (mungkin hanya internal/CMS hook)
- **Impact:** Admin tidak bisa manual trigger revalidate cache
- **Sidebar:** Tidak ada link
- **Note:** Mungkin sengaja internal-only

#### Gap 6: Partner Skills Management (Partner Dashboard)

- **API:** `apps/api/src/routes/partners.ts`
  - `GET /api/v1/partners/me/skills` — list skills
  - `POST /api/v1/partners/me/skills` — add skill
  - `DELETE /api/v1/partners/me/skills/:skillId` — remove skill
- **UI:** Tidak ada halaman/komponen untuk manage skills di partner dashboard
- **Impact:** Partner tidak bisa menambahkan/mengelola keahlian mereka
- **Sidebar:** Tidak ada link
- **Note:** Admin bisa mengelola skills partner dari AdminPartners

#### Gap 7: Partner Dashboard — No dedicated "Documents/Skills" sidebar links

- Sidebar partner cuma punya: Ringkasan, Pekerjaan, Ketersediaan, Pendapatan, Penalty, Ulasan, Pengaturan
- **Missing from sidebar:** Dokumen, Keahlian (Skills)

#### Gap 8: Dispatcher & Finance Dashboards Minimal

- **Dispatcher:** Hanya `/dashboard/dispatcher/index.astro` — satu halaman overview, tidak ada sub-pages
- **Finance:** Hanya `/dashboard/finance/index.astro` — satu halaman overview
- **API:** Banyak endpoint yang relevan (bookings, reports, orders) tapi tidak ada UI spesifik untuk dispatcher/finance

#### Gap 9: Sitemap Settings (Admin)

- **API:** `apps/api/src/routes/sitemap-settings.ts`
  - `GET /api/v1/admin/sitemap-settings` — get settings
  - Likely PATCH as well
- **UI:** Tidak ada halaman/komponen untuk sitemap settings
- **Impact:** Admin tidak bisa mengatur sitemap priority/changefreq dari UI
- **Sidebar:** Tidak ada link
- **Note:** Mungkin di dalam halaman Settings? Perlu dicek

#### Gap 10: IndexNow Management (Admin)

- **API:** `apps/api/src/routes/indexnow.ts`
  - `GET /api/v1/admin/indexnow/key` — get/regenerate key
  - `GET /api/v1/admin/indexnow/logs` — view ping logs
- **UI:** Tidak ada halaman/komponen untuk IndexNow management
- **Impact:** Admin tidak bisa mengelola IndexNow key atau melihat log ping
- **Sidebar:** Tidak ada link
- **Note:** Mungkin di dalam halaman Settings? Perlu dicek

#### Gap 11: SEO Schema Builder (Admin)

- **API:** `apps/api/src/routes/seo.ts` — CRUD untuk SEO metadata
- **UI:** SchemaBuilder component ada di `@ahlipanggilan/ui` dan digunakan di ArticleEditor
- **BUT:** Tidak ada halaman khusus untuk manage schema markup secara global
- **Impact:** Admin tidak bisa manage schema terpusat
- **Status: Partial — available in ArticleEditor only**

## Summary of Critical Gaps

### 🔴 HIGH Priority

1. **Corporate Inquiries Management** — Admin tidak bisa lihat/kelola leads corporate
2. **Partner Documents** — Partner tidak bisa upload dokumen
3. **Partner Skills** — Partner tidak bisa manage keahlian

### 🟡 MEDIUM Priority

4. **IndexNow Management** — Admin tidak bisa manage IndexNow key/log
5. **Sitemap Settings** — Admin tidak bisa atur sitemap dari UI
6. **Finance Dashboard** — Minimal, hanya overview
7. **Dispatcher Dashboard** — Minimal, hanya overview

### 🟢 LOW Priority

8. **CMS Revalidation** — Mungkin internal only
9. **SEO Schema Builder (Global)** — Hanya tersedia di ArticleEditor
10. **Tracking Page Detail** — Minimal coverage already
