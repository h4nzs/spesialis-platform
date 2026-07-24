# Content Lock Mechanism — Redis Pub/Sub + SSE

**Terakhir diperbarui:** 2026-07-24

---

## Overview

Sistem content lock mencegah dua admin mengedit resource yang sama secara bersamaan. Ketika seorang admin membuka editor (artikel, CMS page, FAQ), sistem mengunci resource tersebut. Admin lain yang membuka resource yang sama akan mendapat banner peringatan dan hanya bisa melihat (read-only).

### Arsitektur

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BACKEND (Hono API)                            │
│                                                                      │
│  ┌─────────────┐    ┌──────────────────┐    ┌───────────────────┐  │
│  │  REST API    │───▶│  lock-pubsub.ts   │───▶│  Redis Pub/Sub    │  │
│  │  /locks/*    │    │  publishLockEvent │    │  channel:         │  │
│  │              │    │  subscribeLock    │    │  "lock:events"    │  │
│  └─────────────┘    │  Events           │    └────────┬──────────┘  │
│        │            └──────────────────┘             │              │
│        │                                            │              │
│        ▼                                            ▼              │
│  ┌─────────────┐    ┌────────────────────────────────────────────┐  │
│  │  PostgreSQL  │    │  SSE Endpoint (GET /locks/events)          │  │
│  │  resource_   │    │  Subscribe Redis → push ke semua client   │  │
│  │  locks table │    └────────────────┬───────────────────────────┘  │
│  └─────────────┘                     │                              │
│                                       │                              │
└───────────────────────────────────────│──────────────────────────────┘
                                        │ EventSource (SSE)
                                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Astro/React)                        │
│                                                                      │
│  ┌──────────────────┐    ┌────────────────────┐                     │
│  │  lockEventBus.ts   │───▶│  useLockPolling.ts  │                     │
│  │  Global SSE        │    │  React hook        │                     │
│  │  EventSource       │    │  SSE + Polling     │                     │
│  │                    │    │  30s safety net    │                     │
│  └──────────────────┘    └─────────┬──────────┘                     │
│                                     │                                │
│                                     ▼                                │
│                          ┌──────────────────────┐                   │
│                          │  UI Components        │                   │
│                          │  LockBadge (lock icon)│                   │
│                          │  content-lock-widget  │                   │
│                          │  (Web Component)     │                   │
│                          └──────────────────────┘                   │
└─────────────────────────────────────────────────────────────────────┘
```

> **Catatan:** Dokumen ini bagian dari pola arsitektur yang dijelaskan di [architecture.md](./architecture.md).

### Kenapa Redis Pub/Sub + SSE, Bukan Polling Saja?

| Approach         | Latency    | Resource Usage            | Kompleksitas  |
| ---------------- | ---------- | ------------------------- | ------------- |
| Polling 30s saja | ~15s rata² | Rendah (1 req/30s)        | Sangat rendah |
| Polling 1s       | ~500ms     | Tinggi (60 req/menit)     | Rendah        |
| WebSocket        | Real-time  | Sedang (persistent)       | Tinggi        |
| **Redis + SSE**  | **~100ms** | **Rendah (event-driven)** | **Sedang**    |

Redis Pub/Sub + SSE memberikan **update real-time** tanpa overhead WebSocket, dengan safety net polling 30s jika Redis tidak tersedia.

---

## Database Schema

Lock state disimpan di tabel `resource_locks` di PostgreSQL:

```typescript
// packages/database/src/schema/resource-locks.ts
export const resourceLocks = pgTable(
  'resource_locks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    resourceType: varchar('resource_type', { length: 50 }).notNull(), // 'article' | 'cms_page' | 'faq'
    resourceId: uuid('resource_id').notNull(), // UUID resource
    lockedBy: uuid('locked_by')
      .notNull()
      .references(() => users.id), // user id
    lockedAt: timestamp('locked_at').defaultNow().notNull(),
    heartbeatAt: timestamp('heartbeat_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueResourceIdx: uniqueIndex('idx_resource_locks_resource').on(
      table.resourceType,
      table.resourceId,
    ),
  }),
);
```

**Constraint utama:** Unique index pada `(resource_type, resource_id)` — menjamin hanya satu lock per resource.

**TTL:** Lock dianggap expired jika `heartbeatAt` > 60 detik yang lalu (tidak ada TTL database — expiry diperiksa di aplikasi).

---

## Backend Components

### 1. `apps/api/src/lib/lock-pubsub.ts` — Redis Pub/Sub Core

Dua fungsi utama:

#### `publishLockEvent(event)`

Mempublikasikan event ke Redis channel `lock:events`. Best-effort — jika Redis tidak tersedia, event di-drop silently.

```typescript
export function publishLockEvent(event: LockEvent): void {
  const redis = getRedis();
  if (!redis) return;
  redis.publish(LOCK_EVENT_CHANNEL, JSON.stringify(event)).catch(() => {});
}
```

#### `subscribeLockEvents(handler)`

Subscribe ke Redis channel `lock:events`. Mengembalikan fungsi `unsubscribe()`.

Menggunakan **shared subscriber pattern** — hanya SATU koneksi subscriber Redis global. Semua handler disimpan di `Set<LockEventHandler>` dan didistribusikan ke masing-masing.

```typescript
export function subscribeLockEvents(handler: LockEventHandler): () => void {
  listeners.add(handler);
  ensureSubscribed();
  return () => {
    listeners.delete(handler);
  };
}
```

### 2. `apps/api/src/routes/admin/locks.ts` — REST + SSE

#### Lock Endpoints

| Method  | Path                | Fungsi                                      |
| ------- | ------------------- | ------------------------------------------- |
| GET     | `/locks/check`      | Cek status lock satu resource               |
| GET     | `/locks/batch`      | Cek status lock banyak resource (via list)  |
| POST    | `/locks/acquire`    | Ambil kunci (INSERT ON CONFLICT DO NOTHING) |
| POST    | `/locks/heartbeat`  | Perpanjang lock (setiap 30s)                |
| POST    | `/locks/release`    | Lepas kunci (save/cancel)                   |
| POST    | `/locks/takeover`   | Paksa ambil alih kunci (admin override)     |
| **GET** | **`/locks/events`** | **SSE endpoint — real-time lock events**    |

#### Acquire Flow (Race Condition Safe)

```
1. Cleanup expired lock untuk resource ini
2. INSERT dengan onConflictDoNothing()
   └─ Success → Lock acquired 🎉 → publishLockEvent('acquired')
   └─ Conflict → Cek pemegang lock:
          ├─ Diri sendiri → Refresh heartbeat (return success)
          └─ User lain → Return 409 + info pemegang
```

**Atomic INSERT** — menggunakan PostgreSQL unique constraint. Tidak ada TOCTOU (time-of-check-time-of-use) gap.

#### SSE Endpoint (`GET /locks/events`)

```typescript
router.get(
  '/events',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  (c) => {
    return stream(c, async (stream) => {
      // Kirim event koneksi
      await stream.write(`event: connected\ndata: {}\n\n`);

      // Subscribe ke Redis lock events
      const unsubscribe = subscribeLockEvents((event: LockEvent) => {
        stream.write(`event: lock\ndata: ${JSON.stringify(event)}\n\n`).catch(() => {});
      });

      // Cleanup saat disconnect
      stream.onAbort(() => unsubscribe());
    });
  },
);
```

Menggunakan `hono/streaming` — framework-native SSE tanpa library tambahan.

### Lock Event Types

```typescript
interface LockEvent {
  type: 'acquired' | 'released' | 'takeover';
  resourceType: string; // 'article' | 'cms_page' | 'faq'
  resourceId: string; // UUID
  lockedBy?: string; // User ID (untuk acquired/takeover)
  lockedByEmail?: string; // User email (untuk display di UI)
}
```

---

## Frontend Components

### 1. `apps/web/src/lib/lockEventBus.ts` — Global SSE Subscriber

**Module-level singleton** — hanya SATU koneksi EventSource untuk seluruh aplikasi.

```typescript
// Subscribe — mulai koneksi jika ini listener pertama
export function subscribeLockEvents(handler: LockEventHandler): () => void {
  listeners.add(handler);
  if (listeners.size === 1) connect(); // Start SSE
  return () => {
    listeners.delete(handler);
    if (listeners.size === 0) disconnect(); // Close SSE
  };
}
```

**Connection management:**

- Auto-connect saat listener pertama register
- Auto-disconnect saat listener terakhir unsubscribe
- Max 5 reconnect attempts — setelah itu silent fallback
- Guard `typeof EventSource === 'undefined'` untuk SSR safety

### 2. `apps/web/src/lib/useLockPolling.ts` — React Hook

Hook utama yang digunakan komponen dashboard. Menggabungkan **real-time SSE + polling safety net**:

```typescript
export function useLockPolling(ids: string[], resourceType: string, api?: ApiClient): LockMap {
  // ── Polling interval (30s safety net) ──
  useEffect(() => {
    fetchLocks();
    const interval = setInterval(fetchLocks, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchLocks]);

  // ── Real-time via SSE ──
  useEffect(() => {
    if (ids.length === 0) return;
    const unsub = subscribeLockEvents((event: LockEvent) => {
      if (event.resourceType !== resourceTypeRef.current) return;
      setLockMap((prev) => {
        if (!idsRef.current.includes(event.resourceId)) return prev;
        if (event.type === 'released') {
          const next = { ...prev };
          delete next[event.resourceId];
          return next;
        }
        return {
          ...prev,
          [event.resourceId]: { locked: true, lockedByEmail: event.lockedByEmail ?? 'Unknown' },
        };
      });
    });
    return unsub;
  }, [ids.join(',')]); // re-subscribe saat set ID berubah

  return lockMap;
}
```

**Dual-channel update:**

1. **SSE** — update real-time (~100ms latency)
2. **Polling 30s** — safety net jika Redis tidak tersedia / SSE gagal

### 3. `packages/ui/src/components/content-lock-widget.ts` — Web Component

Framework-agnostic Web Component untuk digunakan di halaman **editor individual** (halaman edit artikel/page/FAQ).

> **⚠️ Dua jalur update berbeda:**
>
> - **List page** (lock indicator per row) — menggunakan `useLockPolling` + `lockEventBus` SSE untuk update real-time lock status ikon per baris tabel.
> - **Editor page** (lock lifecycle) — menggunakan `content-lock-widget` dengan REST API langsung (`POST /acquire`, `POST /heartbeat`, `POST /release`).
>
> Keduanya independen — SSE tidak digunakan di editor page.

```html
<content-lock-widget resource-type="article" resource-id="uuid-here" resource-name="Artikel">
  <!-- Editor content — visible hanya jika current user hold lock -->
</content-lock-widget>
```

**Lifecycle:**

```
connectedCallback
  → acquireLock() — POST /locks/acquire
  → startHeartbeat() — interval 30s

disconnectedCallback
  → releaseLock() — POST /locks/release
  → stopHeartbeat()

lock conflict dari user lain
  → LockBanner — "Sedang diedit oleh email@user"
  → Tombol "Ambil Alih" (takeover)
  → Editor content disembunyikan (slot tidak dirender)
```

**Events yang di-dispatch:**

- `lock-acquired`, `lock-conflict`, `lock-lost`
- `lock-released`, `takeover-started`, `takeover-complete`
- `lock-error`

---

## Lock Lifecycle

```
User A buka editor                    User B buka resource sama
       │                                      │
       ▼                                      ▼
  POST /locks/acquire                   POST /locks/acquire
  INSERT ON CONFLICT DO NOTHING         INSERT ON CONFLICT DO NOTHING
       │                                      │
       ▼ (success)                            ▼ (conflict)
  Lock acquired 🎉                        Return 409
       │                                   LockedBy: User A
       │                                   lockedByEmail: ...
       ▼                                      ▼
  ┌─────────────────┐                   ┌─────────────────┐
  │ Editor terbuka   │                   │ LockBanner merah │
  │ Menampilkan slot │                   │ Tombol takeover  │
  └─────────────────┘                   └─────────────────┘
       │
       ├── heartbeat POST /locks/heartbeat (setiap 30s)
       │
       ├── User A selesai → POST /locks/release → lock released
       │
       └── Browser close → lock expired (60s timeout)
                          → User B bisa acquire via refresh
```

**Takeover flow (admin override):**

```
User B klik "Ambil Alih"
  → POST /locks/takeover
  → DELETE lock lama + INSERT lock baru
  → publishLockEvent('takeover') via Redis Pub/Sub
    → User A dapat notifikasi real-time via SSE
    → Banner kuning → banner merah "Kunci diambil alih"
```

---

## Redis Configuration

### Environment Variables

| Variable     | Default     | Deskripsi         |
| ------------ | ----------- | ----------------- |
| `REDIS_HOST` | `localhost` | Redis server host |
| `REDIS_PORT` | `6379`      | Redis server port |

Jika `REDIS_HOST` tidak reachable, sistem **graceful fallback** — semua fitur tetap berfungsi hanya tanpa real-time updates.

### Docker Compose

**Development:** Redis di `docker-compose.yml` dengan profile `cache` — opt-in via `--profile cache`.

**Production:** Redis selalu aktif di `docker-compose.prod.yml`:

```yaml
redis:
  image: redis:8-alpine
  container_name: specialist-redis
  restart: always
  expose: ['6379']
  healthcheck:
    test: ['CMD', 'redis-cli', 'ping']
    interval: 10s
    timeout: 3s
    retries: 5
  volumes:
    - redis_data:/data
  deploy:
    resources:
      limits:
        memory: 64M

api:
  depends_on:
    redis:
      condition: service_started
  environment:
    - REDIS_HOST=redis
    - REDIS_PORT=6379
```

Redis adalah **non-critical dependency** — aplikasi tetap berfungsi tanpa Redis (fallback ke in-memory rate-limit + polling-based lock).

---

## Fallback Mechanism

Ketika Redis tidak tersedia:

| Feature                    | Behavior Without Redis                                         |
| -------------------------- | -------------------------------------------------------------- |
| **Rate limiting**          | Fallback ke in-memory `Map` (10.000 entries max)               |
| **CMS Cache**              | Fallback ke in-memory `MemoryCache`                            |
| **Content Lock – SSE**     | SSE endpoint tidak dapat push event — client tidak connect     |
| **Content Lock – Locking** | **Tetap berfungsi** via PostgreSQL (acquire/release/heartbeat) |
| **Content Lock – UI**      | Polling 30s tetap jalan — update delay maksimal 30s            |

---

## Monitoring & Debugging

### Log Patterns

```
# Redis connect berhasil
[redis] Redis client created

# Redis tidak tersedia (startup)
[redis] host tidak dijangkau — fallback ke in-memory store

# Lock event published
event: 'lock_event', type: 'acquired', resourceType: 'article', resourceId: 'xxx'

# SSE connection
event: 'sse_connected', path: '/api/v1/admin/locks/events'
```

### Metric Penting

| Metric                   | Impact                                    |
| ------------------------ | ----------------------------------------- |
| Redis memory usage       | CMS cache + lock events (predicted < 32M) |
| SSE connection count     | Jumlah admin yang sedang di dashboard     |
| Lock acquire rate        | Seberapa sering admin buka editor         |
| Lock conflict rate (409) | Seberapa sering dua admin bentrok         |

### Debug Checklist

| Problem                  | Possible Cause                      | Check                                     |
| ------------------------ | ----------------------------------- | ----------------------------------------- |
| Lock banner tidak muncul | Redis tidak tersedia                | `docker logs specialist-redis`            |
| SSE tidak connect        | Auth error (401)                    | Browser DevTools → Network → `/events`    |
| Lock tidak release       | Browser crashed / tab force-close   | Tunggu 60s TTL atau manual via DB         |
| Heartbeat gagal (409)    | Lock diambil alih user lain         | Cek `resource_locks` tabel                |
| Duplikasi event          | Multiple Redis subscriber instances | Cek `subscribed` flag di `lock-pubsub.ts` |

---

## API Reference

### `GET /api/v1/admin/locks/check?type={type}&id={id}`

Response (unlocked):

```json
{ "success": true, "data": { "locked": false } }
```

Response (locked by another user):

```json
{
  "success": true,
  "data": {
    "locked": true,
    "lockedBy": "uuid",
    "lockedByEmail": "admin@example.com",
    "lockedByMe": false,
    "lockedAt": "2026-07-24T10:00:00.000Z",
    "heartbeatAt": "2026-07-24T10:00:30.000Z"
  }
}
```

### `GET /api/v1/admin/locks/batch?type={type}&ids=id1,id2,id3`

```json
{
  "success": true,
  "data": {
    "locks": {
      "id1": {
        "locked": true,
        "lockedBy": "uuid",
        "lockedByEmail": "...",
        "lockedByMe": false,
        "lockedAt": "..."
      },
      "id2": {
        "locked": true,
        "lockedBy": "uuid",
        "lockedByEmail": "...",
        "lockedByMe": true,
        "lockedAt": "..."
      },
      "id3": { "locked": false }
    }
  }
}
```

### `POST /api/v1/admin/locks/acquire`

```json
{ "resourceType": "article", "resourceId": "uuid" }
```

Response 201:

```json
{
  "success": true,
  "data": { "acquired": true, "lockId": "uuid" },
  "message": "Sumber daya berhasil dikunci"
}
```

Response 409 (locked by another user):

```json
{
  "success": false,
  "code": "RESOURCE_LOCKED",
  "message": "Sumber daya sedang diedit oleh pengguna lain",
  "lockedBy": "uuid",
  "lockedByEmail": "admin@example.com",
  "lockedAt": "2026-07-24T10:00:00.000Z"
}
```

### `GET /api/v1/admin/locks/events` (SSE)

```
event: connected
data: {}

event: lock
data: {"type":"acquired","resourceType":"article","resourceId":"uuid","lockedBy":"uuid","lockedByEmail":"admin@example.com"}
```

---

## Testing

### Unit Tests

| File                                           | Coverage                        |
| ---------------------------------------------- | ------------------------------- |
| `apps/web/src/lib/useLockPolling.test.ts`      | Lock polling + SSE subscription |
| `apps/web/tests/content-locking.spec.ts`       | E2E: Two users, lock + takeover |
| `apps/web/tests/lock-list.spec.ts`             | E2E: Lock indicators in list    |
| `apps/api/src/middleware/rate-limiter.test.ts` | Redis fallback test             |

### E2E Test Pattern

```typescript
// Two browser contexts simulating two admins
const admin1 = await browser.newPage();
const admin2 = await browser.newPage();

// Admin 1 acquires lock
await admin1.goto('/admin/articles/edit/uuid');
await expect(admin1.locator('[data-testid="lock-banner"]')).not.toBeVisible();

// Admin 2 opens same article → sees lock banner
await admin2.goto('/admin/articles/edit/uuid');
await expect(admin2.locator('[data-testid="lock-banner"]')).toBeVisible();
await expect(admin2.locator('[data-testid="lock-banner"]')).toContainText('admin1@test.com');
```

---

## File Reference

| File                                                | Role                              |
| --------------------------------------------------- | --------------------------------- |
| `apps/api/src/lib/redis.ts`                         | Redis client singleton + fallback |
| `apps/api/src/lib/lock-pubsub.ts`                   | Redis Pub/Sub publish/subscribe   |
| `apps/api/src/routes/admin/locks.ts`                | REST API + SSE streaming endpoint |
| `apps/web/src/lib/lockEventBus.ts`                  | Global EventSource SSE subscriber |
| `apps/web/src/lib/useLockPolling.ts`                | React hook (SSE + polling)        |
| `apps/web/src/lib/useLockPolling.test.ts`           | Unit test untuk hook              |
| `packages/ui/src/components/content-lock-widget.ts` | Web Component widget              |
| `packages/database/src/schema/resource-locks.ts`    | Database schema PostgreSQL        |
| `packages/validation/src/lock.ts`                   | Zod validation schemas            |

---

## Changelog

| Date       | Change           |
| ---------- | ---------------- |
| 2026-07-24 | Dokumentasi awal |
