// Lightweight fetch wrapper tailored for Django backends
// - Base URL comes from `VITE_API_BASE_URL`
// - Sends credentials for cookie-based auth
// - Adds CSRF header on unsafe methods if a CSRF cookie is present

const CSRF_COOKIE = import.meta.env.VITE_API_CSRF_COOKIE_NAME || 'csrftoken';
const CSRF_HEADER = import.meta.env.VITE_API_CSRF_HEADER_NAME || 'X-CSRFToken';

export const isApiEnabled = (): boolean => {
  return Boolean(import.meta.env.VITE_API_BASE_URL);
};

export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(';').shift() || null;
  return null;
}

type ApiOptions = RequestInit & { rawPath?: string };

export interface ApiResponse<T> {
  ok: true;
  status: number;
  data: T;
}

export async function apiFetch<T = unknown>(path: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
  const base = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (!base) {
    throw new Error('API base URL not configured (VITE_API_BASE_URL)');
  }

  const url = options.rawPath ? path : `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  const method = (options.method || 'GET').toUpperCase();

  const headers: HeadersInit = {
    'Accept': 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  };

  // Add CSRF token for unsafe methods if cookie exists
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const token = getCookie(CSRF_COOKIE);
    if (token && !(CSRF_HEADER in headers)) {
      (headers as Record<string, string>)[CSRF_HEADER] = token;
    }
  }

  const res = await fetch(url, {
    credentials: 'include', // needed for Django session auth
    ...options,
    headers,
  });

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const error = new Error('API request failed') as Error & { status?: number; data?: unknown };
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return { ok: true, status: res.status, data: data as T };
}
