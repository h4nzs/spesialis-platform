# docs/directus/extensions.md

# Custom Extensions

## SEO Revalidation Hook

**File:** `apps/cms/src/extensions/seo-revalidation/`

Mengirim POST ke `API_URL /api/v1/cms/revalidate` setiap kali koleksi `cms_*` dibuat/diubah/dihapus.

**Flow:** Directus Hook → fetch API → Astro revalidate page.

**Konfigurasi:** `REVALIDATION_TOKEN` harus sama antara `docker-compose.yml` dan `.env`.

Build: `pnpm cms:build-extensions`

---

## Dashboard Stats Endpoint

**File:** `apps/cms/src/extensions/dashboard-stats/`

Menyediakan endpoint internal Directus untuk menampilkan jumlah entitas per koleksi.

Digunakan oleh widget dashboard Directus.

---

## Planned Extensions

- **WhatsApp Gateway** — Mengirim pesan otomatis via Hono API (channel WhatsApp di `createNotification` sudah siap, tinggal mengisi `WHATSAPP_API_KEY`)
- **Booking Number Generator** — Otomatis nomor booking
- **Assignment Helper** — Membantu Dispatcher
