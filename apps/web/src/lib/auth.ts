import { createBrowserClient, type ApiClient } from '@specialist/shared';

interface StoredUser {
  id: string;
  email: string;
  role: string;
}

const TOKEN_KEY = 'spesialis_access_token';
const USER_KEY = 'spesialis_user';

let clientInstance: ApiClient | null = null;

export function getApiClient(): ApiClient {
  if (!clientInstance) {
    clientInstance = createBrowserClient();
  }
  return clientInstance;
}

export function getStoredUser(): StoredUser | null {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
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

export function saveAuth(user: StoredUser, token: string): void {
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

const ROLE_DASHBOARD: Record<string, string> = {
  customer: '/dashboard/customer',
  partner: '/dashboard/partner',
  corporate: '/dashboard/corporate',
  admin: '/dashboard/admin',
  super_admin: '/dashboard/admin',
  dispatcher: '/dashboard/admin',
  finance: '/dashboard/admin',
  content_manager: '/dashboard/admin',
};

export function redirectToDashboard(): void {
  const user = getStoredUser();
  const path = user?.role ? ROLE_DASHBOARD[user.role] : '/';
  window.location.href = path ?? '/';
}

export function redirectToLogin(): void {
  clearAuth();
  window.location.href = '/login';
}
