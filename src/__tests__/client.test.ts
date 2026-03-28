import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock auth before importing client
vi.mock('../auth.js', () => ({
  getAccessToken: vi.fn().mockResolvedValue('test-token'),
  invalidateToken: vi.fn(),
}));

import { apiRequest } from '../client/moyKlassClient.js';
import { getAccessToken, invalidateToken } from '../auth.js';

const mockGetAccessToken = vi.mocked(getAccessToken);
const mockInvalidateToken = vi.mocked(invalidateToken);
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  };
}

beforeEach(() => {
  vi.stubEnv('CRM_API_URL', 'https://crm.test');
  mockGetAccessToken.mockResolvedValue('test-token');
});

describe('apiRequest', () => {
  it('sends x-access-token header with token from getAccessToken', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse([]));

    await apiRequest('/v1/company/classes');

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['x-access-token']).toBe('test-token');
  });

  it('builds URL from path + CRM_API_URL', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse([]));

    await apiRequest('/v1/company/classes');

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toMatch(/^https:\/\/crm\.test\/v1\/company\/classes/);
  });

  it('appends scalar params as query string', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse([]));

    await apiRequest('/v1/company/classes', { limit: 10, offset: 0 });

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toContain('limit=10');
    expect(url).toContain('offset=0');
  });

  it('appends array params as repeated query params', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse([]));

    await apiRequest('/v1/company/classes', { classId: [1, 2, 3] });

    const [url] = mockFetch.mock.calls[0] as [string];
    const parsed = new URL(url);
    expect(parsed.searchParams.getAll('classId')).toEqual(['1', '2', '3']);
  });

  it('serializes object params as PHP-style attributes[key]=value', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse([]));

    await apiRequest('/v1/company/users', { attributes: { birthday: '1990-01-01', name: 'test' } });

    const [url] = mockFetch.mock.calls[0] as [string];
    const parsed = new URL(url);
    expect(parsed.searchParams.get('attributes[birthday]')).toBe('1990-01-01');
    expect(parsed.searchParams.get('attributes[name]')).toBe('test');
  });

  it('skips undefined params', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse([]));

    await apiRequest('/v1/company/classes', { limit: undefined, offset: 0 });

    const [url] = mockFetch.mock.calls[0] as [string];
    const parsed = new URL(url);
    expect(parsed.searchParams.has('limit')).toBe(false);
    expect(parsed.searchParams.get('offset')).toBe('0');
  });

  it('returns parsed JSON on success', async () => {
    const data = [{ id: 1, name: 'Group A' }];
    mockFetch.mockResolvedValueOnce(jsonResponse(data));

    const result = await apiRequest('/v1/company/classes');
    expect(result).toEqual(data);
  });

  it('retries with fresh token on 401', async () => {
    mockGetAccessToken
      .mockResolvedValueOnce('expired-token')
      .mockResolvedValueOnce('fresh-token');

    mockFetch
      .mockResolvedValueOnce(jsonResponse({}, 401))  // first call: 401
      .mockResolvedValueOnce(jsonResponse([{ id: 1 }])); // retry: 200

    const result = await apiRequest<unknown[]>('/v1/company/classes');

    expect(mockInvalidateToken).toHaveBeenCalledOnce();
    expect(mockFetch).toHaveBeenCalledTimes(2);
    const [, retryInit] = mockFetch.mock.calls[1] as [string, RequestInit];
    expect((retryInit.headers as Record<string, string>)['x-access-token']).toBe('fresh-token');
    expect(result).toEqual([{ id: 1 }]);
  });

  it('throws on non-401 error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: () => Promise.resolve('Not found'),
    });

    await expect(apiRequest('/v1/company/classes/9999')).rejects.toThrow('CRM API error 404: Not found');
  });

  it('throws on 500 error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error'),
    });

    await expect(apiRequest('/v1/company/users')).rejects.toThrow('CRM API error 500');
  });
});
