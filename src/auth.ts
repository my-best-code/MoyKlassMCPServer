let cachedToken: string | null = null;
let tokenExpiresAt: Date | null = null;

export async function getAccessToken(): Promise<string> {
  if (cachedToken && tokenExpiresAt && new Date() < tokenExpiresAt) {
    return cachedToken;
  }
  return acquireToken();
}

export function invalidateToken(): void {
  cachedToken = null;
  tokenExpiresAt = null;
}

async function acquireToken(): Promise<string> {
  const apiKey = process.env.MOYKLASS_API_KEY ?? '';
  const baseUrl = process.env.CRM_API_URL ?? 'https://api.moyklass.com';

  if (!apiKey) {
    throw new Error('MOYKLASS_API_KEY environment variable is not set');
  }

  const response = await fetch(`${baseUrl}/v1/company/auth/getToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Auth failed ${response.status}: ${body}`);
  }

  const data = await response.json() as { accessToken: string; expiresAt?: string };
  cachedToken = data.accessToken;
  // Set expiry 5 minutes before actual expiry to avoid races
  tokenExpiresAt = data.expiresAt
    ? new Date(new Date(data.expiresAt).getTime() - 5 * 60 * 1000)
    : new Date(Date.now() + 23 * 60 * 60 * 1000); // default: 23h

  return cachedToken;
}
