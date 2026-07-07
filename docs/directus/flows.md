# Directus Flows

Version 2

---

## SEO Revalidation Flow

**Status:** ✅ Active

**Trigger:** Event — `items.create`, `items.update`, `items.delete`

**Collections:**

- `cms_articles`
- `cms_faq`
- `cms_pages`
- `cms_homepage_sections`

**Action:** Webhook → `POST http://api:3000/api/v1/cms/revalidate`

**Headers:**

- `Authorization: Bearer {{env.REVALIDATION_TOKEN}}`
- `Content-Type: application/json`

**Body:**

```json
{
  "collection": "{{$trigger.collection}}",
  "event": "{{$trigger.action}}",
  "key": "{{$trigger.key}}"
}
```

**Setup:** `pnpm cms:flows-setup`

**Notes:**

- Menggantikan `seo-revalidation` hook extension yang tidak didukung Directus 11.6 Docker.
- `REVALIDATION_TOKEN` harus sama antara `docker-compose.yml` dan `.env`.

---

## Planned Flows

### Create Booking

Trigger: Order Created

Action: Generate Booking Number → Send Email → Send WhatsApp → Notify Admin

---

### Partner Approved

Trigger: Partner Status Updated

Action: Send Email → Activate Account

---

### Payment Verified

Trigger: Payment Status Updated

Action: Update Order → Notify Customer → Notify Finance

---

### Complaint Created

Trigger: Complaint Created

Action: Notify Admin → Notify Dispatcher
