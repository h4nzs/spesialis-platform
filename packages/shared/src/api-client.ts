import type { ApiResponse, ApiError as ApiErrorResponse, PaginationMeta } from '@specialist/types';
import {
  ApiClientError,
  NetworkError,
  SessionExpiredError,
  RequestAbortedError,
} from './errors.ts';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export interface RequestOptions {
  method?: HttpMethod;
  /** JSON body — akan di-serialize otomatis */
  body?: unknown;
  /** FormData body — untuk upload file (menggantikan body JSON) */
  formData?: FormData;
  /** Query params — akan di-append ke URL */
  params?: Record<string, string | number | boolean | undefined | null>;
  /** AbortSignal untuk request cancellation */
  signal?: AbortSignal;
  /** Custom headers (akan di-merge) */
  headers?: Record<string, string>;
  /** Jika true, tidak auto-refresh saat 401 */
  skipAuthRefresh?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Token storage interface — bisa diimplementasikan dengan
 * localStorage, cookie, atau memory (SSR).
 */
export interface TokenStore {
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  setTokens(access: string, refresh: string): void;
  clearTokens(): void;
}

/**
 * Memory-based token store (default untuk SSR / non-browser).
 */
export class MemoryTokenStore implements TokenStore {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  getAccessToken(): string | null {
    return this.accessToken;
  }
  getRefreshToken(): string | null {
    return this.refreshToken;
  }
  setTokens(access: string, refresh: string): void {
    this.accessToken = access;
    this.refreshToken = refresh;
  }
  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
  }
}

/**
 * Browser localStorage-based token store.
 */
export class LocalStorageTokenStore implements TokenStore {
  private readonly accessKey = 'spesialis_access_token';
  private readonly refreshKey = 'spesialis_refresh_token';

  getAccessToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(this.accessKey);
  }
  getRefreshToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(this.refreshKey);
  }
  setTokens(access: string, refresh: string): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(this.accessKey, access);
    localStorage.setItem(this.refreshKey, refresh);
  }
  clearTokens(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(this.accessKey);
    localStorage.removeItem(this.refreshKey);
  }
}

/**
 * Shared API client.
 *
 * Digunakan oleh:
 * - Astro SSR (server-side fetch → inject token dari request context)
 * - React islands (browser fetch → ambil token dari localStorage)
 *
 * Fitur:
 * - Typed request/response
 * - Auto refresh token rotation (retry 401)
 * - AbortController support
 * - Centralized error handling
 * - Pagination support
 */
export class ApiClient {
  private baseUrl: string;
  private tokenStore: TokenStore;
  private refreshEndpoint: string;
  private refreshPromise: Promise<void> | null = null;
  private customFetch: typeof fetch | undefined;

  constructor(options: {
    baseUrl: string;
    tokenStore?: TokenStore;
    refreshEndpoint?: string;
    fetch?: typeof fetch;
  }) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.tokenStore = options.tokenStore ?? new MemoryTokenStore();
    this.refreshEndpoint = options.refreshEndpoint ?? '/api/v1/auth/refresh';
    this.customFetch = options.fetch;
  }

  // ─── Public Helpers ────────────────────────────────────────────

  getTokenStore(): TokenStore {
    return this.tokenStore;
  }

  setBaseUrl(url: string): void {
    this.baseUrl = url.replace(/\/+$/, '');
  }

  // ─── Typed HTTP Methods ────────────────────────────────────────

  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  async post<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'POST' });
  }

  async patch<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PATCH' });
  }

  async put<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PUT' });
  }

  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }

  /**
   * GET request dengan pagination — return data array + pagination meta.
   */
  async getPaginated<T>(path: string, options?: RequestOptions): Promise<PaginatedResponse<T>> {
    const response = await this.rawRequest<T[]>(path, { ...options, method: 'GET' });
    return {
      data: response.data,
      pagination: response.pagination!,
    };
  }

  // ─── Core Request ──────────────────────────────────────────────

  private async request<T>(path: string, options: RequestOptions): Promise<T> {
    const response = await this.rawRequest<T>(path, options);
    return response.data;
  }

  private async rawRequest<T>(
    path: string,
    options: RequestOptions,
  ): Promise<{ data: T; pagination: PaginationMeta | undefined }> {
    const url = this.buildUrl(path, options.params);

    const fetchFn = this.customFetch ?? globalThis.fetch;

    const fetchOptions: RequestInit = {
      method: options.method ?? 'GET',
      headers: this.buildHeaders(options),
      signal: options.signal ?? null,
    };

    if (options.formData) {
      // FormData — jangan set Content-Type, biarkan browser set boundary
      fetchOptions.body = options.formData;
    } else if (
      options.body !== undefined &&
      options.method !== 'GET' &&
      options.method !== 'DELETE'
    ) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    let response = await fetchFn(url.toString(), fetchOptions).catch((err: unknown) => {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new RequestAbortedError();
      }
      throw new NetworkError('Gagal terhubung ke server', err);
    });

    // ── Auto refresh token rotation ────────────────────────────
    if (response.status === 401 && !options.skipAuthRefresh && this.tokenStore.getRefreshToken()) {
      const refreshed = await this.tryRefreshToken();
      if (refreshed) {
        // Retry dengan token baru
        fetchOptions.headers = this.buildHeaders(options);
        response = await fetchFn(url.toString(), fetchOptions).catch((err: unknown) => {
          if (err instanceof DOMException && err.name === 'AbortError') {
            throw new RequestAbortedError();
          }
          throw new NetworkError('Gagal terhubung ke server', err);
        });
      } else {
        this.tokenStore.clearTokens();
        throw new SessionExpiredError();
      }
    }

    return this.handleResponse<T>(response);
  }

  // ─── Response Handling ─────────────────────────────────────────

  private async handleResponse<T>(
    response: Response,
  ): Promise<{ data: T; pagination: PaginationMeta | undefined }> {
    if (response.status === 204) {
      return { data: undefined as T, pagination: undefined };
    }

    let json: unknown;
    try {
      json = await response.json();
    } catch {
      throw new NetworkError('Response bukan JSON yang valid');
    }

    if (!response.ok) {
      const errorResponse = json as ApiErrorResponse;
      throw new ApiClientError(errorResponse, response.status);
    }

    const successResponse = json as ApiResponse<T>;
    return {
      data: successResponse.data,
      pagination: successResponse.pagination,
    };
  }

  // ─── Token Refresh ─────────────────────────────────────────────

  private async tryRefreshToken(): Promise<boolean> {
    // Prevent concurrent refresh calls — gunakan promise yang sama
    if (this.refreshPromise) {
      await this.refreshPromise;
      return !!this.tokenStore.getAccessToken();
    }

    this.refreshPromise = this.executeRefresh().finally(() => {
      this.refreshPromise = null;
    });

    await this.refreshPromise;
    return !!this.tokenStore.getAccessToken();
  }

  private async executeRefresh(): Promise<void> {
    const refreshToken = this.tokenStore.getRefreshToken();
    if (!refreshToken) {
      throw new SessionExpiredError();
    }

    const fetchFn = this.customFetch ?? globalThis.fetch;

    const response = await fetchFn(`${this.baseUrl}${this.refreshEndpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      this.tokenStore.clearTokens();
      throw new SessionExpiredError();
    }

    const json = (await response.json()) as ApiResponse<{
      token: string;
      refreshToken: string;
    }>;

    this.tokenStore.setTokens(json.data.token, json.data.refreshToken);
  }

  // ─── URL Building ──────────────────────────────────────────────

  private buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | undefined | null>,
  ): URL {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${cleanPath}`);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url;
  }

  // ─── Headers ───────────────────────────────────────────────────

  private buildHeaders(options: RequestOptions): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...options.headers,
    };

    // Jangan set Content-Type untuk FormData
    if (!options.formData) {
      headers['Content-Type'] = 'application/json';
    }

    const token = this.tokenStore.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }
}

// ─── Factory Functions ───────────────────────────────────────────

/**
 * Buat instance ApiClient untuk browser.
 * Token diambil dari localStorage.
 */
export function createBrowserClient(baseUrl?: string): ApiClient {
  return new ApiClient({
    baseUrl: baseUrl ?? getDefaultApiUrl(),
    tokenStore: new LocalStorageTokenStore(),
  });
}

/**
 * Buat instance ApiClient untuk server (SSR / Astro).
 * Token di-inject dari request context.
 */
export function createServerClient(
  token: string,
  refreshToken?: string,
  baseUrl?: string,
): ApiClient {
  const store = new MemoryTokenStore();
  store.setTokens(token, refreshToken ?? '');
  return new ApiClient({
    baseUrl: baseUrl ?? getDefaultApiUrl(),
    tokenStore: store,
  });
}

function getDefaultApiUrl(): string {
  // Vite/Astro import.meta.env — tersedia di browser build
  try {
    type MetaWithEnv = { env?: Record<string, string> };
    const meta = import.meta as MetaWithEnv;
    if (meta.env?.PUBLIC_API_URL) {
      return meta.env.PUBLIC_API_URL;
    }
  } catch {
    // import.meta not available
  }

  // Node.js process.env — tersedia di server via globalThis.process
  try {
    const nodeProcess = (globalThis as { process?: { env: Record<string, string | undefined> } })
      .process;
    const url = nodeProcess?.env?.PUBLIC_API_URL;
    if (url) return url;
  } catch {
    // process not available
  }

  return 'http://localhost:3000';
}
