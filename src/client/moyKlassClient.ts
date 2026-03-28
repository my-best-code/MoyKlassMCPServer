import { getAccessToken, invalidateToken } from '../auth.js';

type Params = Record<string, string | number | boolean | string[] | number[] | Record<string, string> | undefined>;

export async function apiRequest<T>(path: string, params?: Params): Promise<T> {
  const token = await getAccessToken();
  const url = buildUrl(path, params);

  let response = await fetch(url, {
    headers: { 'x-access-token': token },
  });

  if (response.status === 401) {
    // Token expired — refresh once and retry
    invalidateToken();
    const freshToken = await getAccessToken();
    response = await fetch(url, {
      headers: { 'x-access-token': freshToken },
    });
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`CRM API error ${response.status}: ${body}`);
  }

  return response.json() as Promise<T>;
}

function buildUrl(path: string, params?: Params): string {
  const url = new URL(path, process.env.CRM_API_URL ?? 'https://api.moyklass.com');
  if (!params) return url.toString();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      value.forEach(v => url.searchParams.append(key, String(v)));
    } else if (typeof value === 'object') {
      // PHP-style object params: attributes[key]=value
      for (const [k, v] of Object.entries(value as Record<string, string>)) {
        url.searchParams.set(`${key}[${k}]`, String(v));
      }
    } else {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}
