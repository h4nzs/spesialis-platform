# Content Locking Mechanism

> **Last updated:** July 2026
> **Scope:** API (`apps/api`), Frontend (`apps/web`), Shared UI (`packages/ui`), Validation (`packages/validation`), Database (`packages/database`)

---

## 1. Overview

Content locking mencegah dua admin mengedit resource yang sama secara bersamaan (race condition pada save). Saat seorang admin membuka editor artikel/CMS page/FAQ, sistem mengakuisisi lock. Admin lain yang membuka resource yang sama akan mendapat banner peringatan dan tidak bisa menyimpan.

**Flow dasar:**

```
User A buka editor → acquire lock → [edit] → [save/cancel] → release lock
User B buka editor → 409 LOCKED     → [takeover]         → acquire lock (force)
```

**Lock timeout:** 60 detik tanpa heartbeat → lock otomatis expired.

**Heartbeat:** Frontend mengirim heartbeat setiap 30 detik untuk menjaga lock tetap hidup.

**Resource types:** `article`, `cms_page`, `faq`

---

## 2. Database Schema

**File:** `packages/database/src/schema/resource-locks.ts`

```sql
CREATE TABLE resource_locks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type VARCHAR(50)  NOT NULL,   -- 'article' | 'cms_page' | 'faq'
  resource_id   UUID         NOT NULL,   -- ID resource yang dikunci
  locked_by     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  locked_at     TIMESTAMP    NOT NULL DEFAULT NOW(),  -- waktu akuisisi
  heartbeat_at  TIMESTAMP    NOT NULL DEFAULT NOW(),  -- last heartbeat

  -- Unique constraint: hanya satu lock per resource
  CONSTRAINT idx_resource_locks_resource UNIQUE (resource_type, resource_id)
);
```

**Relasi:** `locked_by` → `users(id)` dengan `ON DELETE CASCADE`.

**Unique constraint** `(resource_type, resource_id)` menjamin atomicity — tidak mungkin dua user memegang lock pada resource yang sama.

---

## 3. API Endpoints

**File:** `apps/api/src/routes/admin/locks.ts`

Semua endpoint requires role `admin`, `super_admin`, atau `content_manager`.

| Method | Path                                          | Deskripsi                       |
| ------ | --------------------------------------------- | ------------------------------- |
| GET    | `/admin/locks/check?type=article&id=xxx`      | Cek status lock satu resource   |
| GET    | `/admin/locks/batch?type=article&ids=id1,id2` | Cek status lock banyak resource |
| POST   | `/admin/locks/acquire`                        | Akuisisi lock (atomic)          |
| POST   | `/admin/locks/takeover`                       | Paksa ambil alih lock           |
| POST   | `/admin/locks/release`                        | Lepas lock                      |
| POST   | `/admin/locks/heartbeat`                      | Perpanjang lock timeout         |

### 3.1 GET `/admin/locks/check`

Cek apakah suatu resource sedang dikunci.

**Query params:** `type` (string), `id` (UUID)

**Response sukses (unlocked):**

```json
{ "success": true, "data": { "locked": false } }
```

**Response sukses (locked oleh user lain):**

```json
{
  "success": true,
  "data": {
    "locked": true,
    "lockedBy": "uuid-user",
    "lockedByEmail": "admin@example.com",
    "lockedByMe": false,
    "lockedAt": "2026-07-24T10:00:00.000Z",
    "heartbeatAt": "2026-07-24T10:00:30.000Z"
  }
}
```

### 3.2 GET `/admin/locks/batch`

Cek status lock untuk banyak resource sekaligus. Dipakai oleh `useLockPolling` untuk menampilkan indikator lock di tabel list.

**Query params:** `type` (string), `ids` (comma-separated UUIDs)

**Response:**

```json
{
  "success": true,
  "data": {
    "locks": {
      "uuid-1": {
        "locked": true,
        "lockedBy": "uuid",
        "lockedByEmail": "a@b.com",
        "lockedByMe": false,
        "lockedAt": "..."
      },
      "uuid-2": {
        "locked": false,
        "lockedBy": "",
        "lockedByEmail": "",
        "lockedByMe": false,
        "lockedAt": ""
      }
    }
  }
}
```

### 3.3 POST `/admin/locks/acquire`

Akuisisi lock dengan atomic INSERT + ON CONFLICT DO NOTHING.

**Race condition safety:** Dua user yang acquire bersamaan → database unique constraint menjamin hanya satu yang berhasil. Tidak ada TOCTOU (time-of-check-time-of-use) gap.

**Flow:**

1. Cleanup expired lock untuk resource ini (jika ada)
2. `INSERT INTO resource_locks ... ON CONFLICT DO NOTHING RETURNING`
3. Jika insert berhasil → ✅ lock acquired
4. Jika gagal (conflict):
   - Cek pemegang lock
   - Kalau diri sendiri → refresh heartbeat (re-acquire)
   - Kalau user lain → return **409 RESOURCE_LOCKED** dengan `lockedByEmail`

**Request body:**

```json
{ "resourceType": "article", "resourceId": "uuid-xxx" }
```

**Response 201 (acquired):**

```json
{ "success": true, "data": { "acquired": true, "lockId": "uuid-lock" } }
```

**Response 409 (locked by other):**

```json
{
  "success": false,
  "code": "RESOURCE_LOCKED",
  "message": "Sumber daya sedang diedit oleh pengguna lain",
  "lockedBy": "uuid-user",
  "lockedByEmail": "admin@example.com",
  "lockedAt": "2026-07-24T10:00:00.000Z"
}
```

### 3.4 POST `/admin/locks/takeover`

Paksa ambil alih lock dari user lain.

**Flow:**

1. DELETE lock yang ada (tanpa filter user — siapapun pemegangnya)
2. INSERT lock baru untuk current user

Tidak ada validasi kepemilikan — siapapun bisa takeover. Ini intentional untuk fleksibilitas admin.

**Request body:** Sama seperti acquire.

### 3.5 POST `/admin/locks/release`

Lepas lock. Hanya menghapus lock milik current user (filter `lockedBy = userId`).

Jika lock sudah expired atau sudah di-takeover (tidak ada row yang match), tetap return success — best-effort.

**Request body:**

```json
{ "resourceType": "article", "resourceId": "uuid-xxx" }
```

### 3.6 POST `/admin/locks/heartbeat`

Perpanjang `heartbeat_at` ke waktu sekarang. Dipanggil frontend setiap 30 detik.

Jika lock sudah di-takeover (return 409 LOCK_LOST), frontend akan menampilkan banner "Kunci telah diambil alih".

**Response 409:**

```json
{
  "success": false,
  "code": "LOCK_LOST",
  "message": "Kunci telah hilang atau diambil alih pengguna lain"
}
```

---

## 4. Validation Schemas

**File:** `packages/validation/src/lock.ts`

```typescript
export const RESOURCE_TYPES = ['article', 'cms_page', 'faq'] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const acquireLockSchema = z.object({
  resourceType: z.enum(RESOURCE_TYPES),
  resourceId: z.string().uuid(),
});

export const releaseLockSchema = z.object({
  resourceType: z.enum(RESOURCE_TYPES),
  resourceId: z.string().uuid(),
});

export const heartbeatLockSchema = z.object({
  resourceType: z.enum(RESOURCE_TYPES),
  resourceId: z.string().uuid(),
});
```

Ketiga schema identik — `resourceType` (enum) + `resourceId` (UUID).

---

## 5. Frontend Hooks

### 5.1 `useContentLock`

**File:** `apps/web/src/lib/useContentLock.ts`

Hook utama untuk manajemen lock di editor components.

```typescript
function useContentLock(
  resourceType?: ResourceType,
  resourceId?: string | null,
): {
  // State
  locked: boolean; // true jika resource dikunci oleh user lain
  lockedByEmail?: string; // email pemegang lock
  isLockedByMe: boolean; // true jika kita yang memegang lock
  error: string | null; // error message
  lockLost: boolean; // true jika lock kita di-takeover (dari heartbeat 409)

  // Actions
  release: () => Promise<void>; // lepas lock
  takeover: () => Promise<void>; // ambil alih lock
};
```

**Lifecycle:**

- **Mount:** `acquire()` → `startHeartbeat()` (30s interval)
- **Unmount:** `clearInterval()` → `release()` (best-effort POST)
- **Resource change:** Tidak otomatis re-acquire — editor harus remount dengan `key` prop (lihat §7.3)

**Key design decisions:**

1. **Refs untuk nilai mutable** (`resourceIdRef`, `resourceTypeRef`, `lockAcquiredRef`, `heartbeatRef`) — interval heartbeat harus membaca nilai terbaru tanpa re-create interval.

2. **Closure untuk cleanup** — cleanup effect menggunakan nilai `id` dan `rt` dari closure, bukan ref. Ini menjamin cleanup selalu me-release lock yang benar meskipun resource berubah mid-lifecycle.

3. **Skip jika `resourceType`/`resourceId` null** — hook tidak melakukan acquire/release apapun jika parameter tidak diberikan (misalnya untuk form create baru).

**Pattern penggunaan di editor:**

```tsx
const lock = useContentLock(editingId ? 'article' : undefined, editingId);

// Conditional render untuk banner
{
  lock.locked && !lock.isLockedByMe && (
    <LockBanner
      type="locked"
      resourceName="Artikel"
      lockedByEmail={lock.lockedByEmail}
      onTakeover={() => lock.takeover()}
      onBack={handleCancel}
    />
  );
}
{
  lock.lockLost && <LockBanner type="lockLost" resourceName="Artikel" />;
}

// Submit button disabled saat locked
<Button type="submit" disabled={lock.locked || submitting}>
  {lock.locked ? 'Tidak Dapat Menyimpan' : 'Simpan'}
</Button>;
```

### 5.2 `useLockPolling`

**File:** `apps/web/src/lib/useLockPolling.ts`

Hook untuk polling status lock dari halaman list (tabel). Setiap 30 detik memanggil `/admin/locks/batch`.

```typescript
function useLockPolling(
  ids: string[], // resource IDs yang tampil di halaman
  resourceType: string, // 'article' | 'cms_page' | 'faq'
  api?: ApiClient, // optional, reuse client instance
): LockMap; // { [resourceId]: { locked, lockedByEmail } }
```

**Key design decisions:**

1. **ids via ref** — array `ids` disimpan di `useRef`, jadi interval tidak perlu re-created setiap kali ids berubah (misalnya saat pagination).

2. **Silent error** — error API di-catch dan diabaikan karena lock status bersifat kosmetik (tidak kritikal).

3. **Empty ids** — jika `ids.length === 0`, langsung set lockMap ke `{}` tanpa panggil API.

**Integration di halaman list:**

```tsx
function ArticleList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const ids = articles.map((a) => a.id);
  const locks = useLockPolling(ids, 'article');

  return (
    <table>
      {articles.map((a) => (
        <tr key={a.id}>
          <td>
            {locks[a.id]?.locked && <LockBadge email={locks[a.id].lockedByEmail} />}
            {a.title}
          </td>
          <td>
            <Button
              disabled={locks[a.id]?.locked}
              title={locks[a.id]?.locked ? `Diedit oleh ${locks[a.id].lockedByEmail}` : undefined}
            >
              {locks[a.id]?.locked ? 'Dikunci' : 'Edit'}
            </Button>
          </td>
        </tr>
      ))}
    </table>
  );
}
```

---

## 6. UI Components

### 6.1 `LockBanner`

**File:** `apps/web/src/components/dashboard/admin/LockBanner.tsx`

Banner notifikasi yang muncul di editor ketika resource dikunci oleh user lain.

**Props:**

```typescript
interface LockBannerProps {
  type: 'locked' | 'lockLost';
  resourceName: string; // "Artikel", "Halaman", "FAQ"
  lockedByEmail?: string; // email pemegang lock (hanya untuk type='locked')
  onTakeover?: () => void; // klik "Ambil Alih"
  onBack?: () => void; // klik "Kembali" / "Tutup"
  backLabel?: string; // kustom label tombol back
  compact?: boolean; // mode ringkas (untuk FaqFormModal)
}
```

**Two variants:**

- **`locked`** — warning-yellow: `"{resourceName} sedang diedit oleh {email}"` dengan tombol "Ambil Alih" + "Kembali/Tutup"
- **`lockLost`** — danger-red: `"Kunci telah diambil alih oleh pengguna lain"` — read-only, tidak ada action

**Data testid:** `lock-banner` (locked), `lock-banner-lost` (lockLost)

### 6.2 `LockBadge`

**File:** `packages/ui/src/components/LockBadge.tsx`

Badge kecil di tabel yang menampilkan status lock per row.

```typescript
export interface LockBadgeProps {
  lockedByEmail: string;
}
```

**Behavior:**

- Menampilkan SVG icon gembok (12×12) + email pemegang lock dalam warna `text-warning-700`
- `title="Diedit oleh {email}"` untuk tooltip
- `data-testid="lock-badge"` untuk E2E test

**Usage di tabel list:**

```tsx
// Dari useLockPolling hasil di halaman list:
const lockInfo = lockMap[item.id];
if (!lockInfo?.locked) return <span className="text-text-muted">-</span>;
return <LockBadge lockedByEmail={lockInfo.lockedByEmail} />;
```

**Test:** `packages/ui/src/components/LockBadge.test.tsx`

### 6.3 `<content-lock-widget>` Web Component

**File:** `packages/ui/src/components/content-lock-widget.ts`

Framework-agnostic Web Component untuk content lock lifecycle. Cocok untuk halaman yang tidak menggunakan React.

**Usage:**

```html
<content-lock-widget resource-type="article" resource-id="uuid-here" resource-name="Artikel">
  <!-- Konten editor — hanya tampil jika lock dipegang oleh current user -->
</content-lock-widget>
```

**Events (bubbles + composed):**

| Event               | Detail              | Trigger                          |
| ------------------- | ------------------- | -------------------------------- |
| `lock-acquired`     | —                   | Lock berhasil diakuisisi         |
| `lock-conflict`     | `{ lockedByEmail }` | Resource dikunci user lain       |
| `lock-lost`         | —                   | Lock di-takeover (heartbeat 409) |
| `lock-released`     | —                   | Lock dilepas                     |
| `takeover-started`  | —                   | Takeover dimulai                 |
| `takeover-complete` | —                   | Takeover selesai                 |
| `lock-error`        | `{ message }`       | Error API                        |

**CSS Shadow Parts:** `::part(banner)`, `::part(takeover-btn)`

**Registration:**

```typescript
import { defineContentLockWidget } from '@ahlipanggilan/ui';
defineContentLockWidget(); // registers <content-lock-widget>
```

### 6.4 Takeover Button Shared Utilities

**File:** `packages/ui/src/shared/takeover-button.ts`

Constants dan helper async handler yang dishare antara React LockBanner dan Web Component.

```typescript
export const TAKEOVER_BUTTON_LABELS = {
  default: 'Ambil Alih',
  loading: 'Mengambil alih…',
};

export const TAKEOVER_BUTTON_ARIA = {
  loading: 'Sedang mengambil alih kunci…',
};

// Factory function untuk async click handler dengan loading state
export function createTakeoverHandler(
  action: TakeoverAction,
  setLoading: (v: boolean) => void,
): () => Promise<void>;
```

---

## 7. Integration di Editor Components

### 7.1 ArticleEditor

**File:** `apps/web/src/components/dashboard/admin/ArticleEditor.tsx`

```typescript
// Inisialisasi
const lock = useContentLock(editingId ? 'article' : undefined, editingId);

// Save handler — release lock setelah sukses
async function handleSave(e) {
  // ...validasi, API call...
  await lock.release();
  goBack();
}

// Cancel handler
function handleCancel() {
  lock.release();
  goBack();
}

// Button label conditional
<Button type="submit" disabled={submitting || lock.locked}>
  {lock.locked && !lock.isLockedByMe
    ? 'Tidak Dapat Menyimpan'
    : submitting ? 'Menyimpan...'
    : editingId ? 'Simpan Perubahan'
    : 'Terbitkan Artikel'}
</Button>
```

### 7.2 PageEditor

**File:** `apps/web/src/components/dashboard/admin/PageEditor.tsx`

Pola identik dengan ArticleEditor, hanya berbeda `resourceType: 'cms_page'`.

### 7.3 FaqFormModal (Modal-based)

**File:** `apps/web/src/components/dashboard/admin/FaqFormModal.tsx`

**Special consideration:** Karena FaqFormModal adalah modal yang tetap mounted meskipun tertutup (`open={showModal}`), hook `useContentLock` harus di-trigger ulang saat `editingId` berubah.

**Fix dengan `key` prop** (di `AdminFaq.tsx`):

```tsx
<FaqFormModal
  key={editing || 'new-faq'} // ← remount saat editingId berubah
  open={showModal}
  onClose={handleClose}
  editingId={editing}
  onSaved={handleSaved}
/>
```

Tanpa `key` prop, `useContentLock` tidak akan re-acquire lock saat user mengklik Edit FAQ yang berbeda, karena `useEffect` di hook hanya jalan sekali (dependency array `[acquire, startHeartbeat, api]` stabil).

### 7.4 AdminFaq (List Page)

**File:** `apps/web/src/components/dashboard/admin/AdminFaq.tsx`

Menggabungkan eager import FaqFormModal (tidak pakai `React.lazy` untuk menghindari chunk loading delay di E2E test) + `key` prop untuk remount.

---

## 8. Error Handling

### 8.1 ApiClientError

**File:** `packages/shared/src/errors.ts`

```typescript
class ApiClientError extends Error {
  public readonly code: string;         // e.g. 'RESOURCE_LOCKED', 'LOCK_LOST'
  public readonly status: number;       // HTTP status code
  public readonly errors: ValidationError[] | undefined;
  public readonly response: Record<string, unknown>;  // full JSON body

  constructor(response: ApiErrorResponse, status: number) { ... }
}
```

**Properti `response`** menyimpan full JSON body — berguna untuk mengakses field kustom seperti `lockedByEmail` dari response 409.

### 8.2 Error Flow

| Skenario                  | HTTP Status | Code              | Frontend Behavior                       |
| ------------------------- | ----------- | ----------------- | --------------------------------------- |
| Acquire — locked by other | 409         | `RESOURCE_LOCKED` | Tampilkan LockBanner dengan email       |
| Heartbeat — lock lost     | 409         | `LOCK_LOST`       | Tampilkan lockLost banner               |
| Acquire — network error   | —           | —                 | Show error "Gagal mengunci sumber daya" |
| Release — already gone    | 200         | —                 | Silent success (best-effort)            |

---

## 9. Race Condition Handling

### 9.1 Atomic Acquire

Dua user yang acquire bersamaan:

```
User A: INSERT INTO resource_locks ... ON CONFLICT DO NOTHING RETURNING
User B: INSERT INTO resource_locks ... ON CONFLICT DO NOTHING RETURNING
```

Database unique constraint `(resource_type, resource_id)` menjamin hanya satu user yang berhasil `INSERT`. User yang gagal mendapat hasil `returning` kosong dan mendapat response 409.

### 9.2 Acquire → Heartbeat Gap

Setelah acquire, jika user lain mengambil alih via takeover atau lock expired, heartbeat berikutnya akan return 409. Frontend akan set `lockLost = true` dan menampilkan banner merah.

### 9.3 Takeover → Release

Takeover menghapus lock tanpa filter user. Jika user A sedang melakukan release bersamaan dengan user B yang takeover, release akan gagal (row sudah dihapus) — tapi return success (best-effort).

---

## 10. Testing

### 10.1 Unit Tests

| Test File                                                     | Coverage                                                                         |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `apps/web/src/lib/useContentLock.test.ts`                     | `useContentLock` hook: acquire, release, heartbeat, lock lost, error handling    |
| `apps/web/src/lib/useLockPolling.test.ts`                     | `useLockPolling` hook: initial fetch, polling interval, ref-based ids, empty ids |
| `apps/web/src/components/dashboard/admin/LockBanner.test.tsx` | LockBanner component: render variants, takeover button, compact mode             |
| `packages/ui/src/components/LockBadge.test.tsx`               | LockBadge component: render email, icon, title, styling                          |
| `packages/validation/src/lock.ts` (via test)                  | Validation schemas (via `packages/validation`)                                   |

### 10.2 E2E Tests

| Test File                                | Scenario                                                  | Key Assertions                                                         |
| ---------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------- |
| `apps/web/tests/content-locking.spec.ts` | Two users edit same article — lock banner + takeover flow | Admin1 hold lock, Admin2 sees banner, Admin2 takeover, Admin2 can save |
| `apps/web/tests/lock-list.spec.ts`       | Article list lock indicator                               | Lock badge visible in table, Edit button disabled with "Dikunci"       |
| `apps/web/tests/lock-list.spec.ts`       | CMS pages list lock indicator                             | Same pattern as article                                                |
| `apps/web/tests/lock-list.spec.ts`       | FAQ list lock indicator                                   | Same pattern, but via modal                                            |

---

## 11. Pengembangan: Menambah Resource Type Baru

Untuk menambah resource type baru (misalnya `service` atau `testimonial`):

### 11.1 Database

Tidak perlu perubahan — kolom `resource_type` adalah VARCHAR yang bisa menampung nilai baru.

### 11.2 Validation

**Edit `packages/validation/src/lock.ts`:**

```typescript
export const RESOURCE_TYPES = ['article', 'cms_page', 'faq', 'service'] as const;
```

### 11.3 API Routes

Tidak perlu perubahan — handler di `apps/api/src/routes/admin/locks.ts` sudah generic dengan `resourceType` parameter.

### 11.4 Frontend Hook

Tambah tipe di `useContentLock.ts`:

```typescript
export type ResourceType = 'article' | 'cms_page' | 'faq' | 'service';
```

### 11.5 Editor Component

Ikuti pola yang sama:

```tsx
import { useContentLock } from '../../../lib/useContentLock.ts';
import { LockBanner } from './LockBanner.tsx';

function ServiceEditor({ editingId }: { editingId?: string }) {
  const lock = useContentLock(editingId ? 'service' : undefined, editingId);

  return (
    <>
      {lock.locked && !lock.isLockedByMe && (
        <LockBanner
          type="locked"
          resourceName="Layanan"
          lockedByEmail={lock.lockedByEmail}
          onTakeover={() => lock.takeover()}
          onBack={() => {
            lock.release();
            goBack();
          }}
        />
      )}
      {lock.lockLost && <LockBanner type="lockLost" resourceName="Layanan" />}

      <form onSubmit={handleSave}>
        {/* ... form fields ... */}
        <Button type="submit" disabled={lock.locked}>
          Simpan
        </Button>
      </form>
    </>
  );
}
```

### 11.6 E2E Tests

Tambah test case di `content-locking.spec.ts` atau `lock-list.spec.ts` mengikuti pattern yang sudah ada.

---

## 12. Troubleshooting

### 12.1 "The 'string' argument must be of type string..." Error

**Symptom:** API return 500 saat acquire lock.

**Root cause:** `postgres.js` v3.4.9 tidak bisa serialize `Date` object ketika dilewatkan via Drizzle `sql` template literal.

**Solution:** Gunakan `.toISOString()` untuk mengkonversi Date ke string sebelum digunakan di `sql` template:

```typescript
// ❌ Salah
const cutoff = new Date(Date.now() - LOCK_TIMEOUT_MS);
await db.delete(resourceLocks).where(sql`${resourceLocks.heartbeatAt} < ${cutoff}`);

// ✅ Benar
const cutoff = new Date(Date.now() - LOCK_TIMEOUT_MS).toISOString();
await db.delete(resourceLocks).where(sql`${resourceLocks.heartbeatAt} < ${cutoff}`);
```

### 12.2 Lock Acquire Timeout di E2E Test

**Symptom:** Test `waitForResponse('/admin/locks/acquire')` timeout.

**Possible causes:**

1. React.lazy chunk loading lambat — solusi: ganti ke eager import
2. `useContentLock` effect tidak re-run saat `editingId` berubah — solusi: tambah `key` prop
3. API server error (500) — cek log API server

### 12.3 Duplicate `role="dialog"` di Test

**Symptom:** Locator `[role="dialog"]` menemukan >1 elemen.

**Root cause:** MobileBottomNav selalu render bottom sheet di DOM dengan `role="dialog"` walaupun tertutup.

**Solution:** Conditional render bottom sheet hanya saat `sheetOpen`:

```tsx
{sheetOpen && (
  <div role="dialog" ...>
    ...
  </div>
)}
```

---

## 13. Arsitektur Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (apps/web)                                        │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │ ArticleEditor│    │  PageEditor  │    │ FaqFormModal  │  │
│  │  (React)    │    │   (React)    │    │   (React)     │  │
│  └──────┬───────┘    └──────┬───────┘    └───────┬───────┘  │
│         │                   │                    │          │
│         └───────────────────┼────────────────────┘          │
│                             │                               │
│                    ┌────────▼────────┐                      │
│                    │  useContentLock  │                      │
│                    │    (Hook)       │                      │
│                    └────────┬────────┘                      │
│                             │                               │
│                    ┌────────▼────────┐                      │
│                    │  LockBanner     │                      │
│                    │  (Component)    │                      │
│                    └─────────────────┘                      │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐                      │
│  │ ArticleList  │    │  AdminFaq    │                      │
│  │  (React)    │    │   (React)    │                      │
│  └──────┬───────┘    └──────┬───────┘                      │
│         │                   │                               │
│         └───────────────────┼────────────────────┘          │
│                             │                               │
│                    ┌────────▼────────┐                      │
│                    │ useLockPolling  │                      │
│                    │    (Hook)       │                      │
│                    └────────┬────────┘                      │
│                             │                               │
│                    ┌────────▼────────┐                      │
│                    │   LockBadge     │                      │
│                    │  (Component)    │                      │
│                    └─────────────────┘                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ <content-lock-widget> Web Component                 │    │
│  │ (Framework-agnostic, untuk non-React pages)         │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP (fetch/ApiClient)
┌──────────────────────────▼──────────────────────────────────┐
│  API (apps/api)                                              │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              admin/locks Router (Hono)                  ││
│  │                                                         ││
│  │  GET  /check  → cleanupExpiredLock + query lock         ││
│  │  GET  /batch  → cleanupAllExpiredLocks + bulk query     ││
│  │  POST /acquire → cleanup + INSERT ... ON CONFLICT       ││
│  │  POST /takeover → DELETE + INSERT                       ││
│  │  POST /release → DELETE WHERE lockedBy = userId         ││
│  │  POST /heartbeat → UPDATE heartbeat_at                  ││
│  └──────────────────────┬──────────────────────────────────┘│
└──────────────────────────┬──────────────────────────────────┘
                           │ Drizzle ORM
┌──────────────────────────▼──────────────────────────────────┐
│  Database (PostgreSQL)                                       │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  resource_locks                                         ││
│  │  ┌─────────────────────────────────────────────────┐    ││
│  │  │ id          │ UUID  │ PRIMARY KEY               │    ││
│  │  │ resource_type│ VARCHAR(50) │ NOT NULL            │    ││
│  │  │ resource_id │ UUID  │ NOT NULL                  │    ││
│  │  │ locked_by   │ UUID  │ → users(id) CASCADE       │    ││
│  │  │ locked_at   │ TIMESTAMP │ DEFAULT NOW()          │    ││
│  │  │ heartbeat_at│ TIMESTAMP │ DEFAULT NOW()          │    ││
│  │  │ UNIQUE (resource_type, resource_id)              │    ││
│  │  └─────────────────────────────────────────────────┘    ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```
