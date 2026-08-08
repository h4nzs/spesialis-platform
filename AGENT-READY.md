# Panduan Tes Lengkap Kesiapan A2A Agent (End-to-End)

Dokumen ini berisi rangkaian tes nyata yang dipakai untuk memverifikasi A2A
agent (v1.0) benar-benar berfungsi — bukan hanya lolos validasi format card di
web scanner. Web scanner (mis. validator agent card) hanya memeriksa struktur
JSON-LD; kesiapan sebenarnya baru terbukti jika request protokol level
berikutnya berhasil: **GetAgentCard (JSONRPC)**, **REST card**, **SendMessage**,
**SendStreamingMessage (SSE)**, dan verifikasi tanda tangan JWS.

---

## 0. Prasyarat

| Kebutuhan                        | Nilai                                                           |
| -------------------------------- | --------------------------------------------------------------- |
| API berjalan                     | dev: `http://localhost:3000` · prod: `https://ahlipanggilan.id` |
| Env API                          | `BOT_SIGNING_PRIVATE_KEY` (untuk card signature)                |
| Env API (opsional, mode LLM)     | `GEMINI_API_KEY` + `GEMINI_MODEL`                               |
| SDK (untuk verifikasi signature) | `@a2a-js/sdk` — terpasang di `apps/api` & `apps/web`            |

```bash
# Base URL — sesuaikan
B="http://localhost:3000/api/v1/a2a"
# produksi:
B="https://ahlipanggilan.id/api/v1/a2a"
```

Catatan: jika `GEMINI_API_KEY` ada, agent berjalan dalam **mode LLM** (Gemini,
default `gemini-3.1-flash-lite`, override via env `GEMINI_MODEL`). Tanpa key,
agent otomatis jatuh ke **rule router** (deterministik). Kedua mode harus diuji.

---

## 1. Level 1 — Unit & integrasi (lokal)

```bash
pnpm --filter @ahlipanggilan/api vitest run src/lib/a2a
# Harapan: Test Files 3 passed · Tests 16 passed
#   a2a-rule-router.test.ts — routing intent (katalog, biaya, FAQ, coverage)
#   a2a-security.test.ts   — JWS sign/verify agent card
#   a2a-task-store.test.ts — task lifecycle store

pnpm test
# Harapan: Tasks: 8 successful, 8 total (seluruh workspace)
```

---

## 2. Level 2 — Agent Card

### 2a. Card web (`/.well-known/agent-card.json`)

```bash
curl -s http://localhost:4321/.well-known/agent-card.json | node -e "
let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{
  const c=JSON.parse(d);
  console.log('protocolVersion:', c.protocolVersion);
  console.log('agentName:', c.agentName);
  console.log('capabilities:', JSON.stringify(c.capabilities));
  console.log('skills:', c.skills.map(s=>s.id).join(', '));
})"
```

Harapan: `protocolVersion` = `1.0`, capabilities berisi `streaming` dan
`pushNotifications: true`, skills mencakup `search_services`,
`get_service_detail`, `create_booking`, dst.

### 2b. Verifikasi tanda tangan JWS (validasi kriptografi, bukan format)

Jalankan dari `apps/web` (SDK tersedia di sana):

```bash
cd apps/web && pnpm exec tsx -e "
import { verifyAgentCardSignature } from '@a2a-js/sdk';
const card = await fetch('http://localhost:4321/.well-known/agent-card.json').then(r=>r.json());
const dir = await fetch('http://localhost:4321/.well-known/http-message-signatures-directory').then(r=>r.json());
for (const s of card.signatures ?? []) {
  const ok = await verifyAgentCardSignature(card, s, dir);
  console.log(s.header.kid, '->', ok ? 'VALID' : 'INVALID');
}" 2>&1 | grep -v WARN
```

Harapan: setiap signature tercetak `VALID`. Jika `BOT_SIGNING_PRIVATE_KEY`
tidak diset, card tanpa signature — itu juga sah (REST/JSONRPC tetap wajib).

### 2c. REST card (wajib terpublikasi tanpa trailing slash)

```bash
curl -s -m 15 "$B/rest/v1/card" | node -e "
let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{
  const c=JSON.parse(d);
  console.log('status:', c.agentCard?.['@context'] ? 'ok' : 'MALFORMED');
  console.log('capabilities:', JSON.stringify(c.agentCard?.capabilities));
  console.log('signatures:', (c.agentCard?.signatures ?? []).map(s=>s.header?.kid).join(', '));
})"
```

Harapan: `status: ok`, signature muncul dengan KID sesuai public key.
Struktur bungkus: `{ agentCard: {...} }` — salah satu perbedaan vs card web.

---

## 3. Level 3 — GetAgentCard via JSONRPC (transport protokol sebenarnya)

```bash
curl -s -m 15 -X POST "$B" \
  -H "Content-Type: application/json" -H "A2A-Version: 1.0" \
  -d '{"jsonrpc":"2.0","id":1,"method":"GetAgentCard","params":{}}' | node -e "
let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{
  const r=JSON.parse(d);
  console.log('error:', r.error ?? 'tidak ada');
  console.log('card sig:', r.result?.card?.signatures?.length ?? 0);
  console.log('streaming:', r.result?.card?.capabilities?.streaming);
  console.log('pushNotifications:', r.result?.card?.capabilities?.pushNotifications);
})"
```

Harapan: tidak ada `error`; `card.signatures.length >= 1` (di prod), capabilities
`streaming` dan `pushNotifications` `true`. Ini membuktikan endpoint JSONRPC,
routing nginx (`/api/v1/a2a` tanpa trailing slash → 200), dan card ter-sign.

---

## 4. Level 4 — SendMessage (percakapan nyata)

Helper (jangan lupa `id`/`messageId`/`taskId`/`contextId` unik tiap tes):

```bash
t() { curl -s -m 90 -X POST "$B" -H "Content-Type: application/json" -H "A2A-Version: 1.0" \
  -d "{\"jsonrpc\":\"2.0\",\"id\":9,\"method\":\"SendMessage\",\"params\":{\"message\":{\"messageId\":\"msg-9\",\"role\":\"ROLE_USER\",\"parts\":[{\"text\":\"$1\"}]},\"taskId\":\"task-9\",\"contextId\":\"ctx-9\"}}" \
  | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const r=JSON.parse(d);
    const m=r.result?.task?.status?.message ?? r.result?.message;
    console.log('role:', m?.role);
    console.log('reply:', (m?.parts?.[0]?.text ?? '(kosong)').slice(0,300).replace(/\n+/g,' | '));})"; }
```

### 4a. Matriks pengujian (mode rule router — tanpa GEMINI_API_KEY)

| Prompt                            | Tool yang dipicu     | Jawaban harus mengandung                                          |
| --------------------------------- | -------------------- | ----------------------------------------------------------------- |
| `apa saja layanan yang tersedia?` | `search_services`    | daftar layanan + link `ahlipanggilan.id/services/...`             |
| `berapa biaya service ac?`        | `get_service_detail` | `## Service AC`, `Harga dapat dihubungi` (bukan `Rpcall`), durasi |
| `berapa biaya refund?`            | `search_faq`         | hasil FAQ atau arahan `ahlipanggilan.id/faq`                      |
| `apakah kalian melayani bandung?` | `check_coverage`     | `Bandung termasuk area layanan` / saran kota                      |
| `lacak SP-12345`                  | `track_booking`      | status pesanan                                                    |
| `apa warna langit hari ini?`      | — (tidak match)      | intro kemampuan agent                                             |

Catatan hasil tes nyata: `berapa biaya service ac?` → detail + `Harga dapat
dihubungi` (bug lama `Rpcall` sudah diperbaiki); `apa saja layanan...` →
katalog (bug lama "Tidak ada layanan ditemukan" sudah diperbaiki dengan
ekstraksi keyword).

### 4b. Mode LLM (GEMINI_API_KEY terpasang)

| Prompt                                                        | Harapan                                                                                         |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `hai kak, apa kabar?`                                         | sapaan natural Gemini (bukan intro rule yang kaku)                                              |
| `mau booking ac hari ini bisa?`                               | LLM panggil tool layanan lalu **memandu** (lokasi, jenis, jadwal) atau ajak login — bukan error |
| `berapa biaya service ac dan apakah kalian melayani jakarta?` | **dua tool dipanggil paralel** (detail + coverage), jawaban gabungan tanpa error                |

Kritikal: `role` harus `ROLE_AGENT` (nilai enum 2). Jika keluar `UNRECOGNIZED`
atau `ROLE_ASSISTANT`, response tidak valid — hanya `ROLE_USER`/`ROLE_AGENT`
yang diterima SDK.

---

## 5. Level 5 — SendStreamingMessage (SSE real-time)

```bash
curl -s -m 30 -X POST "$B" -H "Content-Type: application/json" -H "A2A-Version: 1.0" \
  -d '{"jsonrpc":"2.0","id":10,"method":"SendStreamingMessage","params":{"message":{"messageId":"msg-10","role":"ROLE_USER","parts":[{"text":"berapa biaya service ac?"}]},"taskId":"task-10","contextId":"ctx-10"}}' \
  | node -e "
let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{
  const evs=d.trim().split('\n').filter(Boolean).map(l=>{
    const r=JSON.parse(l.replace(/^data: /,''));
    const k=Object.keys(r.result??{})[0];
    return { id:r.id, k, state: r.result?.[k]?.status?.state ?? r.result?.status?.state,
             msg:(r.result?.statusUpdate?.status?.message?.parts?.[0]?.text??'').slice(0,60) };
  });
  console.log('events:', evs.length);
  evs.forEach(e=>console.log(e.id, e.k, e.state??'', e.msg?'| '+e.msg:''));
  console.log('ada error?', d.includes('event: error') || d.includes('\"error\"'));
})"
```

Urutan event yang benar (urutan = bagian dari kontrak protokol):

```
10 task            TASK_STATE_WORKING
10 statusUpdate    TASK_STATE_WORKING
10 statusUpdate    TASK_STATE_COMPLETED | <jawaban>
```

Syarat lolos:

- Event pertama harus `task`, baru `statusUpdate` — membalik urutan memicu
  `Stream ordering violation` di sisi klien SDK.
- Jawaban dikirim sebagai pesan di `statusUpdate` (state `COMPLETED`), bukan
  event `message` terpisah.
- Tidak boleh ada `event: error` / objek `error` di akhir stream.

---

## 6. Level 6 — REST message:send

```bash
curl -s -m 15 -o /dev/null -w "HTTP %{http_code}\n" -X POST "$B/rest/v1/message:send" \
  -H "Content-Type: application/json" -H "A2A-Version: 1.0" \
  -d '{"message":{"messageId":"msg-11","role":"ROLE_USER","parts":[{"text":"hai"}]},"taskId":"task-11","contextId":"ctx-11"}'
```

Harapan: `HTTP 201`.

---

## 7. Level 7 — Kesehatan LLM & jejak fallback (jangan lewatkan)

Web scanner tidak akan pernah menangkap ini; dua bug nyata ditemukan justru di
sini: error `thought_signature` (Gemini 400) dan fallback diam-diam ke rule
router.

### 7a. Verifikasi model yang benar-benar dipakai

```bash
# prod (container):
docker exec ahlipanggilan-api sh -c 'echo GEMINI_MODEL=$GEMINI_MODEL'
# Harapan: nilai override dari .env.prod (mis. gemini-3.5-flash-lite).
# Jika env kosong, default kode: gemini-3.1-flash-lite.
```

Prioritas: `GEMINI_MODEL` env > default kode. Ganti default hanya di
`apps/api/src/lib/a2a/a2a-llm.ts` (`DEFAULT_MODEL`).

### 7b. Pastikan tidak ada fallback rahasia

```bash
# kirim beberapa pesan dulu (mis. ulangi tes 4b), lalu:
docker logs ahlipanggilan-api --since 5m 2>&1 | grep "\[a2a\] LLM gagal"
# Harapan: tidak ada output sama sekali.
```

Jika muncul, cek detail error di log:
`docker logs ahlipanggilan-api --since 10m 2>&1 | grep -A 6 "\[a2a\]"`.
Penyebab yang pernah terjadi:

- `400 Function call is missing a thought_signature` → model lama
  (`gemini-2.5-flash` tidak tersedia untuk akun baru); fix: forward
  `thoughtSignature` respons sebagai `thought_signature` di level part
  (sibling `functionCall`), bukan di dalamnya.
- `404 model no longer available to new users` → ganti `DEFAULT_MODEL`.

### 7c. Jalur AUTH_REQUIRED (booking tanpa token)

Jika LLM memanggil `create_booking` tanpa JWT, tool mengembalikan
`AUTH_REQUIRED: ...` dan executor membalas ajakan login
(`ahlipanggilan.id/login`) — tes tanpa header Authorization; harapan: tidak
ada 500, jawaban ramah mengarahkan login.

---

## 8. Checklist Cepat (sebelum rilis / setelah deploy)

```bash
curl -sf "$B/rest/v1/card" >/dev/null && echo "1. REST card: OK"
curl -s -X POST "$B" -H "Content-Type: application/json" -H "A2A-Version: 1.0" \
  -d '{"jsonrpc":"2.0","id":1,"method":"GetAgentCard","params":{}}' | grep -q '"signatures"' && echo "2. GetAgentCard: OK"
curl -s "$(echo $B | sed 's|/api/v1/a2a||')/api/v1/health" | grep -q success && echo "3. API health: OK"
# ...lalu jalankan minimal: satu SendMessage (4a/4b), satu SendStreamingMessage (5), cek log 7b.
```

| #   | Cek                                                       | Hasil |
| --- | --------------------------------------------------------- | ----- |
| 1   | Unit a2a (16 tests) + pnpm test (8/8)                     |       |
| 2   | Card web ter-sign & signature `VALID` (SDK)               |       |
| 3   | REST card 200, tanpa trailing slash                       |       |
| 4   | JSONRPC GetAgentCard 200, `sig >= 1`                      |       |
| 5   | SendMessage: role `ROLE_AGENT`, jawaban sesuai mode       |       |
| 6   | SSE: urutan task → WORKING → COMPLETED, tanpa error       |       |
| 7   | REST message:send 201                                     |       |
| 8   | `GEMINI_MODEL` env terpakai; log `[a2a] LLM gagal` kosong |       |

Semua baris tercentang = agent ready; web scanner hanyalah langkah pertama.
