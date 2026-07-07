# Directus Extensions

## Status

⚠️ **File system API extensions (hooks/endpoints) are NOT supported** in the Directus 11.6 Docker image (`directus/directus:11.6.0`).

The `@directus/extensions` runtime package required for loading custom hooks/endpoints is not included in the Docker image. The `directus:extension` manifest schema only accepts app extension types (`interface`, `display`, `layout`, `module`, `panel`, `theme`), not `hook` or `endpoint`.

## Alternative: Directus Flows

Instead of custom API extensions, Directus provides built-in **Flows** for automation workflows.

See `docs/directus/flows.md` for documentation on available flows, including:

- **SEO Revalidation Flow** — Replaces the broken `seo-revalidation` hook extension.
- Future flows as needed.

## Previously Attempted Extensions

### SEO Revalidation Hook (Replaced by Flow)

**Old location:** `apps/cms/src/extensions/seo-revalidation/`

Mengirim POST ke `API_URL/api/v1/cms/revalidate` setiap kali koleksi `cms_*` dibuat/diubah/dihapus.

**Replaced by:** Directus Flow "SEO Revalidation — Content Changes"

### Dashboard Stats Endpoint (Not Available)

**Old location:** `apps/cms/src/extensions/dashboard-stats/`

Menyediakan endpoint internal Directus untuk menampilkan jumlah entitas per koleksi.

**Alternative:** Gunakan Hono API endpoint `GET /api/v1/admin/dashboard` yang sudah menyediakan data serupa.

## Setup Flows

```bash
pnpm cms:flows-setup
```

## Extension Development Notes

If upgrading to a Directus version that supports API extensions (e.g., v12+), refer to:

- https://docs.directus.io/guides/extensions/api-extensions/hooks/
- https://docs.directus.io/guides/extensions/api-extensions/endpoints/

## Planned Extensions (Future)

- **WhatsApp Gateway** — Mengirim pesan otomatis via Hono API (channel WhatsApp di `createNotification` sudah siap, tinggal mengisi `WHATSAPP_API_KEY`).
- **Booking Number Generator** — Otomatis nomor booking.
- **Assignment Helper** — Membantu Dispatcher.
