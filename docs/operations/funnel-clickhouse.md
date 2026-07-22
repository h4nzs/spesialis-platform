# Funnel Analytics — ClickHouse Query Layer

> **Status:** 🔧 Research Complete — Ready for Implementation \\\
> **Target:** Build self-hosted funnel dashboard sebagai alternatif fitur Plausible Cloud yang tidak tersedia di Community Edition \\\
> **Data Source:** ClickHouse database Plausible (langsung, tanpa melalui Plausible API) \\\
> **Stack:** ClickHouse + Hono API + Astro/React UI (Recharts) \\\
> **Lisensi:** Sepenuhnya legal — query langsung ke database milik sendiri, tanpa reverse engineering kode proprietary Plausible

---

## Daftar Isi

1. [Latar Belakang](#1-latar-belakang)
2. [Arsitektur](#2-arsitektur)
3. [Schema ClickHouse](#3-schema-clickhouse)
4. [Core Funnel Query — windowFunnel](#4-core-funnel-query--windowfunnel)
5. [Query Patterns](#5-query-patterns)
6. [Custom Properties Filtering](#6-custom-properties-filtering)
7. [Analytics Registry (Package)](#7-analytics-registry-package)
8. [Funnel Definitions](#8-funnel-definitions)
9. [API Design](#9-api-design)
10. [Risk & Mitigation](#10-risk--mitigation)
11. [Troubleshooting](#11-troubleshooting)
12. [Referensi](#12-referensi)

---

## 1. Latar Belakang

### Masalah

Plausible **Community Edition** (self-hosted) tidak memiliki fitur **Funnels** — fitur premium yang hanya tersedia di Plausible Cloud berbayar.

| Fitur                     | Community Edition | Cloud (Berbayar) |
| ------------------------- | ----------------- | ---------------- |
| Goals (Custom Events)     | ✅ Ada            | ✅ Ada           |
| Custom Properties         | ✅ Ada            | ✅ Ada           |
| **Funnels**               | ❌ **Tidak ada**  | ✅ Ada           |
| Dashboard, Traffic, Pages | ✅ Ada            | ✅ Ada           |
| Integrations, Imports     | ✅ Ada            | ✅ Ada           |

### Mengapa Tidak Fork Plausible?

Kode Funnel ada di repo Plausible (Elixir/Phoenix) tapi digate secara legal dan build-time. Forking untuk mengaktifkan fitur premium:

| Aspek           | Fork Plausible ❌                           | Build Sendiri ✅                             |
| --------------- | ------------------------------------------- | -------------------------------------------- |
| **Legal**       | Melanggar lisensi proprietary               | ✅ Sepenuhnya legal — query DB milik sendiri |
| **Stack**       | Elixir/Phoenix — bukan stack tim            | ✅ TypeScript/Hono/React — stack tim         |
| **Maintenance** | Harus merge upstream tiap rilis             | ✅ Independen — API sendiri                  |
| **Kustomisasi** | Terbatas pada UI Plausible                  | ✅ Bebas — filter, breakdown, chart kustom   |
| **Integrasi**   | Dashboard terpisah (stats.ahlipanggilan.id) | ✅ Bisa embed langsung di dashboard admin    |

### Pendekatan

Data funnel **sudah ada** di database ClickHouse. Setiap event tracking dari `@spesialis/analytics` SDK (seperti `booking_start`, `booking_submit`, `payment_success`) disimpan di tabel `events_v2`. Tinggal query dan visualisasikan.

```
Plausible ClickHouse → Query langsung → Funnel API (Hono) → Funnel UI (React/Recharts)
                         ↑                          ↑
                read-only connection        embed di dashboard admin
```

---

## 2. Arsitektur

```
┌─────────────────────────────────────────────────────────────────┐
│                         Funnel System                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  packages/analytics/                                              │
│  └── src/                                                        │
│      ├── registry/funnels.ts     ← Funnel definitions            │
│      └── registry/goals.ts       ← Goal definitions              │
│                                                                  │
│  apps/api/                                                       │
│  └── src/                                                        │
│      └── routes/analytics/                                       │
│          ├── funnel.ts           ← POST /api/v1/analytics/funnels │
│          ├── clickhouse.ts       ← Query builder + connection     │
│          └── metrics.ts          ← Aggregate queries (opsional)   │
│                                                                  │
│  apps/web/                                                       │
│  └── src/                                                        │
│      └── components/dashboard/admin/                             │
│          └── FunnelChart.tsx      ← React chart component         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Flow

```
User buka Dashboard Admin → Funnel Tab
         ↓
React → GET /api/v1/analytics/funnels?name=booking&period=30d
         ↓
Hono → ClickHouse query builder → `windowFunnel()` SQL
         ↓
ClickHouse (read-only connection via HTTP)
         ↓
JSON response → Recharts visualisasi
```

### Connection Details

| Parameter | Nilai                                                 |
| --------- | ----------------------------------------------------- |
| Host      | `plausible-clickhouse:8123` (internal Docker network) |
| Protocol  | HTTP (port 8123 — native ClickHouse HTTP interface)   |
| Database  | `plausible`                                           |
| Auth      | None (internal network, tidak diekspos ke luar)       |
| Driver    | `@clickhouse/client` (npm) atau `ch` (npm)            |
| Mode      | Read-only                                             |

> **Keamanan:** Koneksi hanya dari dalam Docker network `specialist`. Tidak perlu auth. Tidak ada port yang di-expose ke host.

---

## 3. Schema ClickHouse

### 3.1 `events_v2` — Tabel Utama

Ini adalah tabel paling penting untuk funnel. Semua event tracking disimpan di sini.

```sql
CREATE TABLE plausible.events_v2
(
    -- Identitas & Waktu
    `timestamp`          DateTime,
    `site_id`            UInt64,
    `user_id`            UInt64,
    `session_id`         UInt64,

    -- Event
    `name`               LowCardinality(String),   -- 'pageview', 'booking_start', 'booking_submit', dll
    `hostname`           String,
    `pathname`           String,

    -- Referrer
    `referrer`           String,
    `referrer_source`    String,

    -- Custom Properties (ARRAY — lihat 3.3 untuk detail)
    `meta.key`           Array(String),
    `meta.value`         Array(String),

    -- Geolokasi
    `country_code`       FixedString(2),

    -- Device & Browser
    `screen_size`        LowCardinality(String),
    `browser`            LowCardinality(String),
    `operating_system`   LowCardinality(String),

    -- UTM Tracking
    `utm_medium`         String,
    `utm_source`         String,
    `utm_campaign`       String,
    `utm_content`        String,
    `utm_term`           String,

    -- Engagement
    `scroll_depth`       UInt8,
    `engagement_time`    UInt32,

    -- Internal (opsional / bisa tidak ada tergantung versi Plausible)
    `revenue_source_currency` String,
    `recovery_id`             UInt64,
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(`timestamp`)
ORDER BY (`site_id`, toDate(`timestamp`), `name`, `user_id`, `timestamp`)
SAMPLE BY `user_id`
```

### 3.2 `sessions_v2` — Tabel Sesi

```sql
CREATE TABLE plausible.sessions_v2
(
    `session_id`         UInt64,
    `user_id`            UInt64,
    `site_id`            UInt64,
    `start`              DateTime,
    `pageviews`          UInt64,
    `events`             UInt64,
    `duration`           UInt32,
    `is_bounce`          UInt8,
    `entry_page`         String,
    `exit_page`          String,

    -- Channel
    `referrer_source`    String,
    `referrer`           String,
    `utm_medium`         String,
    `utm_source`         String,
    `utm_campaign`       String,

    -- Opsional
    `recovery_id`             UInt64,
    `click_id_param`          LowCardinality(String),
)
ENGINE = VersionedCollapsingMergeTree(
    sign,
    (site_id, toStartOfMonth(start), user_id, session_id)
)
```

> **Catatan:** `sessions_v2` menggunakan `VersionedCollapsingMergeTree`. Untuk funnel, kita hampir selalu pakai `events_v2` karena funnel berdasarkan urutan event, bukan session aggregate.

### 3.3 Custom Properties — `meta.key` / `meta.value`

Plausible menyimpan custom properties sebagai **parallel arrays** (bukan object/JSON). Ini penting:

```sql
-- Contoh data di events_v2:
-- name: 'booking_submit'
-- meta.key:   ['booking_id', 'service_id', 'customer_type']
-- meta.value: ['SP-2026-00001', 'SP-SRV-001', 'guest']
```

Relasi antara `meta.key` dan `meta.value` adalah **posisi index**:

| Index | `meta.key`      | `meta.value`    |
| ----- | --------------- | --------------- |
| 1     | `booking_id`    | `SP-2026-00001` |
| 2     | `service_id`    | `SP-SRV-001`    |
| 3     | `customer_type` | `guest`         |

#### Query untuk Filter Berdasarkan Custom Property

```sql
-- Filter: booking_submit dengan customer_type = 'guest'
SELECT count(*)
FROM plausible.events_v2
WHERE name = 'booking_submit'
  AND has(meta.key, 'customer_type')
  AND meta.value[indexOf(meta.key, 'customer_type')] = 'guest'
```

> **PENTING:** Fungsi `has()` harus dipanggil **sebelum** `indexOf()` untuk memastikan property benar-benar ada. `indexOf()` return 0 jika tidak ditemukan, dan `meta.value[0]` akan return default value (string kosong), bukan error.

#### Fungsi ClickHouse yang Berguna

| Fungsi                                       | Kegunaan                                            |
| -------------------------------------------- | --------------------------------------------------- |
| `has(arr, value)`                            | Cek apakah array punya value tertentu               |
| `indexOf(arr, value)`                        | Cari posisi value di array (1-based, 0 = not found) |
| `arrayElement(arr, index)` atau `arr[index]` | Ambil elemen di posisi index                        |
| `arrayFilter(...)`                           | Filter array dengan lambda                          |
| `arrayExists(lambda, arr)`                   | Cek apakah ada elemen yang memenuhi kondisi         |
| `arrayCount(lambda, arr)`                    | Hitung jumlah elemen yang memenuhi kondisi          |

### 3.4 Kolom yang Sering Kurang

Setelah update versi Plausible, sering ada kolom baru yang belum dibuat di tabel. Jika funnel query error "No such column", cek dan tambah kolom berikut:

```sql
-- events_v2
ALTER TABLE plausible.events_v2
    ADD COLUMN IF NOT EXISTS scroll_depth UInt8 AFTER revenue_source_currency,
    ADD COLUMN IF NOT EXISTS recovery_id UInt64 AFTER scroll_depth,
    ADD COLUMN IF NOT EXISTS engagement_time UInt32 AFTER recovery_id;

-- sessions_v2
ALTER TABLE plausible.sessions_v2
    ADD COLUMN IF NOT EXISTS recovery_id UInt64 AFTER channel,
    ADD COLUMN IF NOT EXISTS click_id_param LowCardinality(String) AFTER recovery_id;
```

---

## 4. Core Funnel Query — `windowFunnel`

### 4.1 Cara Kerja `windowFunnel`

ClickHouse memiliki function **`windowFunnel`** yang dirancang khusus untuk funnel analysis:

```sql
windowFunnel(window, [mode, ...])(timestamp, cond1, cond2, cond3, ...)
```

**Parameter:**

| Parameter         | Tipe       | Deskripsi                                                            |
| ----------------- | ---------- | -------------------------------------------------------------------- |
| `window`          | `UInt`     | Time window dalam detik. Semua step harus terjadi dalam rentang ini. |
| `mode` (opsional) | `String`   | `'strict_deduplication'`, `'strict_order'`, `'strict_increase'`      |
| `timestamp`       | `DateTime` | Kolom timestamp untuk mengukur urutan                                |
| `cond1..N`        | `Boolean`  | Kondisi boolean untuk setiap step funnel                             |

**Return value:** `UInt8` — jumlah step yang berhasil dicapai (0 sampai N).

- Step harus terjadi **berurutan** (step 3 harus setelah step 2)
- Jika user loncat dari step 1 ke step 3 (skip step 2) → hanya terhitung sampai step 1
- Semua step harus dalam **time window** yang ditentukan
- **Default mode:** tidak strict — event bisa bersamaan waktunya

### 4.2 Contoh Dasar

```sql
WITH funnel_data AS (
    SELECT
        user_id,
        windowFunnel(3600)(   -- 3600 detik = 1 jam
            timestamp,
            name = 'pageview',          -- Step 1
            name = 'service_view',      -- Step 2
            name = 'booking_start',     -- Step 3
            name = 'booking_submit'     -- Step 4
        ) AS steps
    FROM plausible.events_v2
    WHERE site_id = 1
      AND timestamp >= now() - INTERVAL 30 DAY
      AND timestamp <= now()
    GROUP BY user_id
)
SELECT
    countIf(steps >= 1) AS landing,
    countIf(steps >= 2) AS view_service,
    countIf(steps >= 3) AS start_booking,
    countIf(steps >= 4) AS submit_booking
FROM funnel_data
```

### 4.3 Output Query

| Kolom            | Nilai | Arti                                       |
| ---------------- | ----- | ------------------------------------------ |
| `landing`        | 1,000 | 1,000 user mencapai step 1 (pageview)      |
| `view_service`   | 600   | 600 user lanjut ke step 2 (view service)   |
| `start_booking`  | 300   | 300 user lanjut ke step 3 (start booking)  |
| `submit_booking` | 120   | 120 user lanjut ke step 4 (submit booking) |

**Conversion Rate:** 120/1000 = **12%**

### 4.4 Modes

| Mode                     | Deskripsi                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------- |
| (default)                | Event bisa bersamaan waktunya. Step bisa terjadi di timestamp yang sama.            |
| `'strict_order'`         | Setiap step harus punya timestamp **strictly increasing** (tidak boleh sama)        |
| `'strict_increase'`      | Sama seperti strict_order, tapi event name yang sama di-skip                        |
| `'strict_deduplication'` | Jika event name yang sama muncul di step berbeda, hanya step pertama yang terhitung |

Untuk funnel tracking di Plausible, **default mode** sudah cukup karena setiap event punya nama berbeda di setiap step.

### 4.5 Query untuk Multiple Time Windows

```sql
-- Bandingkan konversi 7 hari vs 30 hari
SELECT
    7 AS period,
    countIf(steps >= 1) AS landing,
    countIf(steps >= 4) AS converted,
    round(countIf(steps >= 4) / countIf(steps >= 1) * 100, 1) AS conversion_rate
FROM (
    SELECT user_id, windowFunnel(3600)(timestamp,
        name = 'booking_start',
        name = 'booking_submit',
        name = 'payment_success'
    ) AS steps
    FROM plausible.events_v2
    WHERE site_id = 1 AND timestamp >= now() - INTERVAL 7 DAY
    GROUP BY user_id
)
UNION ALL
SELECT
    30 AS period, ...
```

---

## 5. Query Patterns

### 5.1 Full Funnel dengan Conversion Rate

```sql
WITH funnel AS (
    SELECT
        user_id,
        windowFunnel(86400)(  -- 24 jam
            timestamp,
            name = 'booking_start',
            name = 'booking_submit',
            name = 'payment_success'
        ) AS steps
    FROM plausible.events_v2
    WHERE site_id = 1
      AND timestamp >= now() - INTERVAL 30 DAY
    GROUP BY user_id
)
SELECT
    steps AS funnel_step,
    count() AS users,
    round(count() / first_value(count()) OVER (ORDER BY steps DESC), 3) AS conversion
FROM funnel
GROUP BY steps
ORDER BY steps ASC
```

Output:

| funnel_step | users | conversion |
| ----------- | ----- | ---------- |
| 1           | 500   | 1.000      |
| 2           | 200   | 0.400      |
| 3           | 80    | 0.160      |

### 5.2 Breakdown per Device / Browser

```sql
WITH funnel AS (
    SELECT
        e.user_id,
        any(e.browser) AS browser,
        windowFunnel(86400)(
            e.timestamp,
            e.name = 'booking_start',
            e.name = 'booking_submit'
        ) AS steps
    FROM plausible.events_v2 e
    WHERE e.site_id = 1
      AND e.timestamp >= now() - INTERVAL 30 DAY
    GROUP BY e.user_id
)
SELECT
    browser,
    countIf(steps >= 1) AS started,
    countIf(steps >= 2) AS submitted,
    round(countIf(steps >= 2) / countIf(steps >= 1) * 100, 1) AS conversion_rate
FROM funnel
GROUP BY browser
ORDER BY started DESC
```

### 5.3 Trend Harian (Time Series)

```sql
SELECT
    toDate(timestamp) AS day,
    countIf(name = 'booking_start') AS starts,
    countIf(name = 'booking_submit') AS submits,
    countIf(name = 'payment_success') AS payments
FROM plausible.events_v2
WHERE site_id = 1
  AND timestamp >= now() - INTERVAL 30 DAY
GROUP BY day
ORDER BY day
```

### 5.4 Breakdown per Property (guest vs registered)

```sql
WITH funnel AS (
    SELECT
        e.user_id,
        -- Ambil customer_type dari event booking_start atau booking_submit
        arrayElement(
            any(meta.value[indexOf(meta.key, 'customer_type')]),
            indexOf(any(meta.key), 'customer_type')
        ) AS customer_type_guess,
        windowFunnel(86400)(
            e.timestamp,
            e.name = 'booking_start',
            e.name = 'booking_submit',
            e.name = 'payment_success'
        ) AS steps
    FROM plausible.events_v2 e
    WHERE e.site_id = 1
      AND e.timestamp >= now() - INTERVAL 30 DAY
      AND (e.name IN ('booking_start', 'booking_submit', 'payment_success'))
    GROUP BY e.user_id
)
SELECT
    multiIf(
        customer_type_guess = '', 'guest',
        customer_type_guess, customer_type_guess,
        'unknown'
    ) AS customer_type,
    countIf(steps >= 1) AS start_booking,
    countIf(steps >= 2) AS submit_booking,
    countIf(steps >= 3) AS payment_success,
    round(countIf(steps >= 3) / countIf(steps >= 1) * 100, 1) AS conversion_rate
FROM funnel
GROUP BY customer_type
ORDER BY start_booking DESC
```

### 5.5 Breakdown User per Step (Detail)

```sql
SELECT
    steps,
    count() AS users,
    uniqExact(user_id) AS unique_users,
    round(uniqExact(user_id) / max(uniqExact(user_id)) OVER () * 100, 1) AS pct
FROM (
    SELECT
        user_id,
        windowFunnel(3600)(
            timestamp,
            name = 'booking_start',
            name = 'booking_submit'
        ) AS steps
    FROM plausible.events_v2
    WHERE site_id = 1
      AND timestamp >= now() - INTERVAL 7 DAY
    GROUP BY user_id
)
GROUP BY steps
ORDER BY steps ASC
```

### 5.6 Funnel Global (No Time Window)

Jika ingin melihat konversi tanpa batas waktu antar step, set window sangat besar:

```sql
windowFunnel(999999999)(
    timestamp,
    name = 'booking_start',
    name = 'booking_submit'
)
```

Ini menghitung user yang **pernah** melakukan booking_start dan kemudian booking_submit, kapan pun itu.

---

## 6. Custom Properties Filtering

### 6.1 Filter Event Berdasarkan Property

```sql
-- Booking submit dengan property tertentu
SELECT count(*)
FROM plausible.events_v2
WHERE name = 'booking_submit'
  AND has(meta.key, 'service_id')
  AND meta.value[indexOf(meta.key, 'service_id')] = 'SP-SRV-001'
  AND site_id = 1
  AND timestamp >= now() - INTERVAL 30 DAY
```

### 6.2 Funnel per Service

```sql
WITH filtered_users AS (
    -- Step 1: Dapatkan user_id yang booking service tertentu
    SELECT DISTINCT user_id
    FROM plausible.events_v2
    WHERE name = 'booking_submit'
      AND has(meta.key, 'service_id')
      AND meta.value[indexOf(meta.key, 'service_id')] = 'SP-SRV-001'
      AND site_id = 1
      AND timestamp >= now() - INTERVAL 30 DAY
),
funnel AS (
    SELECT
        e.user_id,
        windowFunnel(86400)(
            e.timestamp,
            e.name = 'booking_start',
            e.name = 'booking_submit',
            e.name = 'payment_success'
        ) AS steps
    FROM plausible.events_v2 e
    INNER JOIN filtered_users f ON f.user_id = e.user_id
    WHERE e.site_id = 1
      AND e.timestamp >= now() - INTERVAL 30 DAY
    GROUP BY e.user_id
)
SELECT
    countIf(steps >= 1) AS booking_start,
    countIf(steps >= 2) AS booking_submit,
    countIf(steps >= 3) AS payment_success
FROM funnel
```

### 6.3 Helper Functions (TypeScript)

Untuk API layer, buat helper function untuk query property:

```ts
// propertyFilter.ts
export function propertyEquals(key: string, value: string): string {
  return `has(meta.key, '${key}') AND meta.value[indexOf(meta.key, '${key}')] = '${value}'`;
}

export function propertyIn(key: string, values: string[]): string {
  const vals = values.map((v) => `'${v}'`).join(', ');
  return `has(meta.key, '${key}') AND meta.value[indexOf(meta.key, '${key}')] IN (${vals})`;
}

export function propertyHas(key: string): string {
  return `has(meta.key, '${key}')`;
}
```

### 6.4 Peringatan: SQL Injection

Parameter dari user (seperti `service_id`) HARUS di-sanitize. Jangan concatenate langsung:

```ts
// ❌ SALAH — rentan SQL injection
const query = `
  SELECT ... meta.value[indexOf(meta.key, 'service_id')] = '${userInput}'
`;

// ✅ BENAR — gunakan parameter binding ClickHouse
const query = `
  SELECT ... meta.value[indexOf(meta.key, 'service_id')] = {serviceId:String}
`;
// ClickHouse HTTP client binding: { serviceId: userInput }
```

---

## 7. Analytics Registry (Package)

Funnel definitions sudah terdefinisi di `packages/analytics/src/registry/funnels.ts`. Ini adalah **single source of truth** untuk funnel — API funnel query builder harus membaca definisi dari sini.

### 7.1 Struktur Funnel Definition

```ts
interface FunnelDefinition {
  name: string;
  description: string;
  steps: FunnelStep[];
  windowSeconds: number;
  owner: string;
  kpi?: string;
}

interface FunnelStep {
  order: number;
  event: string;
  label: string; // Nama yang ditampilkan di UI
  description: string;
  required: boolean;
}
```

### 7.2 Daftar Funnel (dari Registry)

| Funnel                 | Steps                                                                             | Window   | Owner      |
| ---------------------- | --------------------------------------------------------------------------------- | -------- | ---------- |
| `booking`              | pageview → service_view → booking_start → booking_submit → payment_success        | 1 jam    | product    |
| `booking_core`         | booking_start → booking_submit → payment_success                                  | 24 jam   | product    |
| `partner_registration` | pageview → partner_cta_click → partner_register_start → partner_register_complete | 2 jam    | growth     |
| `corporate_lead`       | pageview → corporate_cta_click → inquiry_start → inquiry_submit                   | 1 jam    | sales      |
| `admin_assignment`     | booking_confirm → booking_assign → partner_job_accept                             | 24 jam   | operations |
| `authentication`       | pageview → register_start → register_complete                                     | 30 menit | product    |
| `search_to_booking`    | search_result → service_view → booking_start → booking_submit                     | 1 jam    | product    |

---

## 8. Funnel Definitions

### 8.1 Booking Funnel (Lengkap)

```
pageview ──→ service_view ──→ booking_start ──→ booking_submit ──→ payment_success
   │              │                │                  │                   │
   ▼              ▼                ▼                  ▼                   ▼
 Landing     Lihat Service    Mulai Booking      Submit Booking      Bayar
```

**KPI:** Booking Conversion Rate > 15%
**Window:** 1 jam antar step

```sql
windowFunnel(3600)(
    timestamp,
    name = 'pageview',
    name = 'service_view',
    name = 'booking_start',
    name = 'booking_submit',
    name = 'payment_success'
)
```

### 8.2 Booking Core Funnel (Ringkas)

```
booking_start ──→ booking_submit ──→ payment_success
```

**KPI:** Payment Success Rate > 85%
**Window:** 24 jam (user bisa checkout belakangan)

```sql
windowFunnel(86400)(
    timestamp,
    name = 'booking_start',
    name = 'booking_submit',
    name = 'payment_success'
)
```

### 8.3 Partner Registration Funnel

```
pageview ──→ partner_cta_click ──→ partner_register_start ──→ partner_register_complete
```

**KPI:** Partner Registration Completion Rate > 20%
**Window:** 2 jam

```sql
windowFunnel(7200)(
    timestamp,
    name = 'pageview',
    name = 'partner_cta_click',
    name = 'partner_register_start',
    name = 'partner_register_complete'
)
```

### 8.4 Corporate Lead Funnel

```
pageview ──→ corporate_cta_click ──→ inquiry_start ──→ inquiry_submit
```

**KPI:** Inquiry to Lead Rate > 30%
**Window:** 1 jam

```sql
windowFunnel(3600)(
    timestamp,
    name = 'pageview',
    name = 'corporate_cta_click',
    name = 'inquiry_start',
    name = 'inquiry_submit'
)
```

### 8.5 Admin Assignment Funnel

```
booking_confirm ──→ booking_assign ──→ partner_job_accept
```

**KPI:** Assignment Rate > 90%
**Window:** 24 jam

```sql
windowFunnel(86400)(
    timestamp,
    name = 'booking_confirm',
    name = 'booking_assign',
    name = 'partner_job_accept'
)
```

### 8.6 Authentication Funnel

```
pageview ──→ register_start ──→ register_complete
```

**KPI:** Registration Conversion > 5%
**Window:** 30 menit

```sql
windowFunnel(1800)(
    timestamp,
    name = 'pageview',
    name = 'register_start',
    name = 'register_complete'
)
```

### 8.7 Search to Booking Funnel

```
search_result ──→ service_view ──→ booking_start ──→ booking_submit
```

**KPI:** Search to Booking Rate > 3%
**Window:** 1 jam

```sql
windowFunnel(3600)(
    timestamp,
    name = 'search_result',
    name = 'service_view',
    name = 'booking_start',
    name = 'booking_submit'
)
```

---

## 9. API Design

### 9.1 Endpoint

```
POST /api/v1/analytics/funnels
```

**Request Body:**

```json
{
  "name": "booking",
  "funnel": {
    "name": "booking_core",
    "steps": [
      { "event": "booking_start", "label": "Mulai Booking" },
      { "event": "booking_submit", "label": "Submit Booking" },
      { "event": "payment_success", "label": "Bayar" }
    ],
    "windowSeconds": 86400
  },
  "period": {
    "start": "2026-06-01",
    "end": "2026-07-22"
  },
  "filters": {
    "customer_type": "guest",
    "service_id": "SP-SRV-001"
  },
  "breakdown": "browser",
  "timezone": "Asia/Jakarta"
}
```

### 9.2 Response

```json
{
  "funnel": {
    "name": "booking_core",
    "label": "Booking (24h)"
  },
  "period": {
    "start": "2026-06-01",
    "end": "2026-07-22"
  },
  "steps": [
    {
      "order": 1,
      "event": "booking_start",
      "label": "Mulai Booking",
      "users": 500,
      "conversion_rate": 100.0,
      "drop_off": 0,
      "drop_off_rate": 0
    },
    {
      "order": 2,
      "event": "booking_submit",
      "label": "Submit Booking",
      "users": 200,
      "conversion_rate": 40.0,
      "drop_off": 300,
      "drop_off_rate": 60.0
    },
    {
      "order": 3,
      "event": "payment_success",
      "label": "Bayar",
      "users": 80,
      "conversion_rate": 16.0,
      "drop_off": 120,
      "drop_off_rate": 60.0
    }
  ],
  "overall_conversion_rate": 16.0,
  "total_users": 500,
  "total_converted": 80,
  "metadata": {
    "query_time_ms": 142,
    "cached": false
  }
}
```

### 9.3 Breakdown Response

Jika `breakdown` dikirim:

```json
{
  "funnel": { ... },
  "steps": [ ... ],
  "breakdown": {
    "by": "browser",
    "segments": [
      {
        "value": "Chrome",
        "users": 300,
        "steps": [ 300, 150, 60 ],
        "conversion_rate": 20.0
      },
      {
        "value": "Mobile Safari",
        "users": 150,
        "steps": [ 150, 40, 15 ],
        "conversion_rate": 10.0
      }
    ]
  }
}
```

### 9.4 Query Builder Pattern

```ts
// ClickHouse query builder — pseudo-code
class FunnelQueryBuilder {
  private steps: string[] = [];
  private window: number = 3600;
  private filters: string[] = [];
  private siteId: number = 1;
  private period: [Date, Date] = [/* ... */];
  private breakdown?: string;

  addStep(eventName: string): this {
    this.steps.push(`name = '${eventName}'`);
    return this;
  }

  setWindow(seconds: number): this {
    this.window = seconds;
    return this;
  }

  addFilter(filter: string): this {
    this.filters.push(filter);
    return this;
  }

  build(): string {
    const conditions = [
      `site_id = {siteId:UInt64}`,
      `timestamp >= {start:DateTime}`,
      `timestamp <= {end:DateTime}`,
      ...this.filters,
    ];

    const steps = this.steps.join(',\n            ');

    return `
      WITH funnel_data AS (
        SELECT
            user_id,
            ${this.breakdown ? `any(e.${this.breakdown}) AS breakdown_value,` : ''}
            windowFunnel(${this.window})(
                timestamp,
                ${steps}
            ) AS steps
        FROM plausible.events_v2 e
        WHERE ${conditions.join('\n          AND ')}
        GROUP BY user_id
      )
      SELECT
          countIf(steps >= 1) AS step_1,
          countIf(steps >= 2) AS step_2,
          ${this.steps.map((_, i) => `countIf(steps >= ${i + 1}) AS step_${i + 1}`).join(',\n          ')}
          ${this.breakdown ? ', breakdown_value' : ''}
      FROM funnel_data
      ${this.breakdown ? 'GROUP BY breakdown_value ORDER BY step_1 DESC' : ''}
    `;
  }
}
```

---

## 10. Risk & Mitigation

### 10.1 Performa ClickHouse

| Risiko                       | Dampak                    | Mitigasi                                                                                      |
| ---------------------------- | ------------------------- | --------------------------------------------------------------------------------------------- |
| Query berat scan banyak data | Slow response, CPU tinggi | Batasi range tanggal (max 90 hari). Paksa partition pruning via `toDate(timestamp)` di WHERE. |
| Query concurrent tinggi      | Resource contention       | Cache hasil funnel (misal 5 menit). Jangan hitung ulang tiap render.                          |
| `windowFunnel` di data besar | Memory tinggi             | Pastikan ORDER BY di tabel sesuai query filter. Tes dengan EXPLAIN sebelum production.        |

### 10.2 Koneksi ClickHouse

| Risiko                                 | Mitigasi                                                                             |
| -------------------------------------- | ------------------------------------------------------------------------------------ |
| Plausible restart → port berubah?      | Connection pooling + retry. ClickHouse listen di 8123 via Docker — stable.           |
| Koneksi tanpa auth di internal network | Pastikan tidak ada port ClickHouse di-expose ke host. Service lain tidak bisa akses. |
| Connection leak                        | Pastikan HTTP client pool size terbatas (max 5). Close response tiap selesai.        |

### 10.3 Data Completeness

| Risiko                                                              | Mitigasi                                                                               |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Kolom baru dari update Plausible                                    | Monitoring + dokumentasi kolom yang harus di-add manual                                |
| Event yang belum masuk karena buffer                                | Plausible punya WriteBuffer dengan delay sampai 5 detik. Funnel data bisa delay kecil. |
| `meta.key` / `meta.value` empty untuk event tanpa custom properties | Gunakan `has()` guard sebelum akses `meta.value[indexOf()]`                            |

### 10.4 Cache Strategy

Rekomendasi: **In-memory cache dengan TTL 5 menit**

```
Request → Cache check (Map<funnelKey, result>)
  ├── Cache HIT (< 5 menit) → return cached
  └── Cache MISS → query ClickHouse → store di cache → return
```

Cache key: hash dari `{name, start, end, filters, breakdown}`

---

## 11. Troubleshooting

### 11.1 Query Error — "No such column"

```sql
Code: 47. DB::Exception: Missing columns: 'recovery_id'
```

**Solusi:** Tambah kolom yang kurang via `ALTER TABLE` (lihat [3.4 Kolom yang Sering Kurang](#34-kolom-yang-sering-kurang)).

### 11.2 Query Slow — Full Scan

```sql
-- ❌ SLOW: Tidak partition pruning
WHERE site_id = 1 AND timestamp >= '2026-01-01'

-- ✅ CEPAT: Partition pruning
WHERE site_id = 1
  AND toDate(timestamp) >= '2026-01-01'
  AND toDate(timestamp) <= '2026-07-22'
```

### 11.3 Conversion Rate 0 atau NULL

**Penyebab:** Funnel steps terlalu strict — user tidak mengikuti urutan yang tepat.

**Cek:** Jalankan query dengan window lebih besar atau tanpa time window:

```sql
-- Bandingkan dengan window 1 jam vs 7 hari vs tanpa limit
windowFunnel(3600)     → booking_submit: 120
windowFunnel(604800)   → booking_submit: 195  (7 hari)
windowFunnel(99999999) → booking_submit: 220  (sepanjang masa)
```

Jika konversi naik signifikan dengan window lebih besar, berarti user butuh waktu lebih lama antar step. Sesuaikan `windowSeconds` di funnel definition.

### 11.4 Data Tidak Muncul — Check Raw Events

```sql
-- Cek apakah event beneran ada di ClickHouse
SELECT name, count(*)
FROM plausible.events_v2
WHERE site_id = 1
  AND timestamp >= now() - INTERVAL 7 DAY
GROUP BY name
ORDER BY count(*) DESC
```

Jika event `booking_start` tidak ada di hasil, berarti tracking belum berfungsi — cek kode tracking di frontend.

### 11.5 Custom Properties Kosong

```sql
-- Cek apakah meta.key terisi
SELECT name, meta.key, meta.value
FROM plausible.events_v2
WHERE name = 'booking_submit'
  AND timestamp >= now() - INTERVAL 7 DAY
LIMIT 5
```

Jika `meta.key` kosong untuk event yang seharusnya punya property, cek provider Plausible SDK di `packages/analytics` — mungkin custom properties tidak terkirim.

### 11.6 EXPLAIN Query

Sebelum deploy query baru, selalu cek execution plan:

```sql
EXPLAIN SELECT ...
FROM plausible.events_v2
WHERE ...
```

Perhatikan:

- **`ReadFromMergeTree`** — bagus, berarti partition pruning jalan
- **`Expression` → `SettingQuotaAndLimits`** — normal
- **`ReadFromStorage` dengan filter tidak efisien** — perlu optimasi WHERE clause

---

## 12. Referensi

### ClickHouse Documentation

| Topik                              | URL                                                                                                |
| ---------------------------------- | -------------------------------------------------------------------------------------------------- |
| `windowFunnel` function            | https://clickhouse.com/docs/en/sql-reference/aggregate-functions/parametric-functions#windowfunnel |
| MergeTree engine                   | https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree                    |
| Array functions (`has`, `indexOf`) | https://clickhouse.com/docs/en/sql-reference/functions/array-functions                             |
| Partition pruning                  | https://clickhouse.com/docs/en/optimize/partition-pruning                                          |
| ClickHouse HTTP interface          | https://clickhouse.com/docs/en/integrations/http                                                   |

### Plausible Documentation

| Topik              | URL                                                  |
| ------------------ | ---------------------------------------------------- |
| Community Edition  | https://github.com/plausible/community-edition       |
| Custom Properties  | https://plausible.io/docs/custom-event-goals         |
| Events API         | https://plausible.io/docs/events-api                 |
| Self-Hosting Guide | https://plausible.io/docs/self-hosting-configuration |

### Project Files

| File                                         | Keterangan                                       |
| -------------------------------------------- | ------------------------------------------------ |
| `packages/analytics/src/registry/funnels.ts` | Funnel definitions (source of truth)             |
| `packages/analytics/src/events/*.ts`         | Event definitions per kategori                   |
| `packages/analytics/src/properties/index.ts` | Property registry                                |
| `docs/operations/plausible-analytics.md`     | Dokumentasi operasional Plausible                |
| `docker-compose.prod.yml`                    | Service `plausible-clickhouse` dengan port 8123  |
| `infrastructure/docker/clickhouse/config.d/` | Konfigurasi ClickHouse (memory, ipv4-only, logs) |

### Tools

| Tool                                  | Fungsi                               | URL                                              |
| ------------------------------------- | ------------------------------------ | ------------------------------------------------ |
| `clickhouse-client`                   | CLI untuk query ClickHouse           | Bawaan image ClickHouse                          |
| `@clickhouse/client`                  | Node.js driver untuk ClickHouse      | https://www.npmjs.com/package/@clickhouse/client |
| `ch` (npm)                            | Node.js ClickHouse driver alternatif | https://www.npmjs.com/package/ch                 |
| `clickhouse-query-builder` (opsional) | Query builder untuk ClickHouse       | —                                                |

> **Catatan:** Untuk driver Node.js, prefer `@clickhouse/client` (official dari ClickHouse). Support TypeScript, HTTP(S) protocol, streaming, dan parameter binding.
