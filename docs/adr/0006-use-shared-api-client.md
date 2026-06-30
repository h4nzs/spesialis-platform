# ADR-0006

# Use Shared API Client in packages/shared

**Status:** Accepted

**Date:** 2026-06-30

---

## Context

Frontend (Astro + React) dan konsumen lain perlu memanggil Hono API. Tanpa shared client, setiap konsumen akan:

- Duplicate fetch logic
- Duplicate error handling
- Duplicate token management
- Tidak ada single source of truth untuk tipe request/response

---

## Decision

Buat shared API client di `packages/shared/src/api-client.ts` dengan fitur:

- Base URL dari environment variable (`PUBLIC_API_URL`)
- JWT token injection (Authorization header)
- Refresh token rotation otomatis (retry saat 401)
- Typed request/response menggunakan types dari `packages/types`
- Error handling terpusat (parse error response → throw typed error)
- AbortController support (request cancellation)
- Server-side fetch support (Astro SSR — gunakan `fetch` global)
- Client-side fetch (browser native `fetch`)

---

## Reason

- DRY — satu implementasi, semua konsumen pakai.
- Type-safe — request/response divalidasi oleh Zod dari `packages/validation`.
- Token management terpusat — tidak ada kebocoran token.
- Consistent error handling — semua error dalam format yang sama.
- SSR compatible — Astro perlu fetch di server side.

---

## Consequences

Positif:

- Semua frontend (Astro pages + React islands) panggil API dengan cara yang sama.
- Token refresh logic reusable.
- Error handling terstandarisasi.

Negatif:

- Perlu maintenance satu shared library.
- Breaking change di API client berdampak ke semua konsumen (harus versioning).

---

## API Design

```ts
// packages/shared/src/api-client.ts

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  params?: Record<string, string>;
  signal?: AbortSignal;
};

type ApiResponse<T> = {
  success: true;
  message: string;
  data: T;
  pagination?: PaginationMeta;
};

type ApiError = {
  success: false;
  code: string;
  message: string;
  errors?: ValidationError[];
};

class ApiClient {
  constructor(private baseUrl: string) {}

  get<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>>;
  post<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>>;
  patch<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>>;
  delete<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>>;
}

// Instance untuk browser (mengambil token dari cookie/storage)
export const api = new ApiClient(import.meta.env.PUBLIC_API_URL);

// Instance untuk server (mengambil token dari request context)
export function createServerApi(token: string): ApiClient;
```

---
