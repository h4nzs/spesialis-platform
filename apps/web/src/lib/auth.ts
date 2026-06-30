import { createBrowserClient, type ApiClient } from '@specialist/shared';
import type { User } from '@specialist/types';

const TOKEN_KEY = 'spesialis_access_token';
const USER_KEY = 'spesialis_user';

let clientInstance: ApiClient | null = null;

export function getApiClient(): ApiClient {
  if (!clientInstance) {
    clientInstance = createBrowserClient();
  }
  return clientInstance;
}

export function getStoredUser(): User | null {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getStoredToken();
}

export function saveAuth(user: User, token: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  getApiClient().getTokenStore().clearTokens();
}

export function redirectToDashboard(): void {
  window.location.href = '/';
}

export function redirectToLogin(): void {
  clearAuth();
  window.location.href = '/login';
}
