import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAccessToken, invalidateToken } from '../auth.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function authResponse(token: string, expiresAt?: string) {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve({ accessToken: token, ...(expiresAt ? { expiresAt } : {}) }),
    text: () => Promise.resolve(''),
  };
}

function errorResponse(status: number, body = 'error') {
  return { ok: false, status, json: () => Promise.resolve({}), text: () => Promise.resolve(body) };
}

beforeEach(() => {
  invalidateToken();
  vi.stubEnv('MOYKLASS_API_KEY', 'test-api-key');
  vi.stubEnv('CRM_API_URL', 'https://test.api.com');
});

describe('getAccessToken', () => {
  it('fetches token from auth endpoint with apiKey from env', async () => {
    mockFetch.mockResolvedValueOnce(authResponse('tok-1'));

    await getAccessToken();

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://test.api.com/v1/company/auth/getToken');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ apiKey: 'test-api-key' });
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });

  it('returns the accessToken from response', async () => {
    mockFetch.mockResolvedValueOnce(authResponse('my-token'));
    expect(await getAccessToken()).toBe('my-token');
  });

  it('caches token and skips second fetch', async () => {
    mockFetch.mockResolvedValueOnce(
      authResponse('cached', new Date(Date.now() + 60 * 60 * 1000).toISOString())
    );

    const first = await getAccessToken();
    const second = await getAccessToken();

    expect(first).toBe('cached');
    expect(second).toBe('cached');
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it('re-fetches after invalidateToken()', async () => {
    mockFetch
      .mockResolvedValueOnce(authResponse('token-1'))
      .mockResolvedValueOnce(authResponse('token-2'));

    await getAccessToken();
    invalidateToken();
    const second = await getAccessToken();

    expect(second).toBe('token-2');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('re-fetches when cached token is expired', async () => {
    // expires in the past
    mockFetch
      .mockResolvedValueOnce(authResponse('old', new Date(Date.now() - 1000).toISOString()))
      .mockResolvedValueOnce(authResponse('new'));

    await getAccessToken();
    const second = await getAccessToken();

    expect(second).toBe('new');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('sets default 23h expiry when expiresAt not in response', async () => {
    mockFetch.mockResolvedValueOnce(authResponse('no-expiry'));
    await getAccessToken();
    // Second call should still hit the cache (within 23h)
    mockFetch.mockResolvedValueOnce(authResponse('should-not-reach'));
    await getAccessToken();
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it('throws when MOYKLASS_API_KEY is not set', async () => {
    vi.stubEnv('MOYKLASS_API_KEY', '');
    await expect(getAccessToken()).rejects.toThrow('MOYKLASS_API_KEY environment variable is not set');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('throws when auth endpoint returns an error', async () => {
    mockFetch.mockResolvedValueOnce(errorResponse(401, 'Invalid key'));
    await expect(getAccessToken()).rejects.toThrow('Auth failed 401: Invalid key');
  });
});
