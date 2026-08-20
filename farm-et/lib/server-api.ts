/**
 * Server-side API client for calling the Laravel backend from Next.js API routes.
 * Unlike lib/api.ts (which uses localStorage for the token), this accepts
 * an auth token as an argument — suitable for server-side use.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://farm-et-backend.vercel.app/api';

interface ServerApiOptions {
  token?: string;
  timeout?: number;
}

/**
 * Makes an authenticated GET request to the Laravel API.
 */
export async function serverGet<T = unknown>(
  path: string,
  options: ServerApiOptions = {}
): Promise<T> {
  const { token, timeout = 10000 } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Laravel API error: ${res.status} ${res.statusText}`);
    }

    return (await res.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}
