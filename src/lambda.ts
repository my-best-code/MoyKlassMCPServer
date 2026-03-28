import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createMcpServer } from './server.js';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const path = stripStagePrefix(event);
  const method = event.requestContext.http.method;
  const baseUrl = deriveBaseUrl(event);

  // ── OAuth Discovery (unauthenticated) ─────────────────────────────────────

  if (method === 'GET' && path === '/oauth/resource-metadata') {
    return jsonResponse(200, {
      resource: `${baseUrl}/mcp`,
      authorization_servers: [baseUrl],
      scopes_supported: [],
    });
  }

  if (method === 'GET' && path === '/.well-known/openid-configuration') {
    return jsonResponse(200, {
      issuer: baseUrl,
      authorization_endpoint: `${baseUrl}/oauth/authorize`,
      token_endpoint: `${baseUrl}/oauth/token`,
      registration_endpoint: `${baseUrl}/oauth/register`,
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code'],
      token_endpoint_auth_methods_supported: ['none'],
      code_challenge_methods_supported: ['S256'],
    });
  }

  // ── OAuth Proxy ────────────────────────────────────────────────────────────

  if (method === 'POST' && path === '/oauth/register') {
    return jsonResponse(201, {
      client_id: `proxy-${Date.now()}`,
      grant_types: ['authorization_code'],
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
    });
  }

  if (method === 'GET' && path === '/oauth/authorize') {
    const qs = event.queryStringParameters ?? {};
    const redirectUri = qs['redirect_uri'] ?? '';
    const state = qs['state'] ?? '';
    // Use MCP_AUTH_TOKEN as the authorization code.
    // Claude Desktop will exchange it at /oauth/token to obtain the access_token.
    const code = process.env.MCP_AUTH_TOKEN ?? '';
    const redirect = new URL(redirectUri);
    redirect.searchParams.set('code', code);
    if (state) redirect.searchParams.set('state', state);
    return { statusCode: 302, headers: { Location: redirect.toString() }, body: '' };
  }

  if (method === 'POST' && path === '/oauth/token') {
    const params = new URLSearchParams(parseBody(event));
    const code = params.get('code') ?? '';
    const expectedToken = process.env.MCP_AUTH_TOKEN ?? '';
    if (!expectedToken || code !== expectedToken) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify({ error: 'invalid_grant' }) };
    }
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({ access_token: expectedToken, token_type: 'Bearer', expires_in: 31536000 }),
    };
  }

  // ── MCP Protocol (auth required) ──────────────────────────────────────────

  const expectedToken = process.env.MCP_AUTH_TOKEN;
  const bearerToken = extractBearerToken(event);
  if (expectedToken && bearerToken !== expectedToken) {
    return {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': `Bearer resource_metadata="${baseUrl}/oauth/resource-metadata"`,
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  const server = createMcpServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless — no session state between Lambda invocations
    enableJsonResponse: true,      // return JSON, not SSE stream (required for API Gateway buffering)
  });

  try {
    await server.connect(transport);
    const request = apiGatewayEventToRequest(event);
    const response = await transport.handleRequest(request);
    return await webResponseToApiGateway(response);
  } catch (err) {
    return jsonResponse(500, { error: String(err) });
  } finally {
    await transport.close();
    await server.close();
  }
};

export function apiGatewayEventToRequest(event: APIGatewayProxyEventV2): Request {
  const method = event.requestContext.http.method;

  const headers = new Headers();
  for (const [key, value] of Object.entries(event.headers ?? {})) {
    if (value) headers.set(key, value);
  }

  // API Gateway V2 may base64-encode the body
  let body: string | undefined;
  if (event.body) {
    body = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf-8')
      : event.body;
  }

  // Strip named stage prefix (e.g. /prod/mcp → /mcp)
  const path = stripStagePrefix(event);
  const url = `https://localhost${path}`;

  return new Request(url, {
    method,
    headers,
    body: method !== 'GET' && method !== 'HEAD' && method !== 'DELETE' ? body : undefined,
  });
}

export async function webResponseToApiGateway(response: Response): Promise<APIGatewayProxyResultV2> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': '*', // CORS on all responses, including errors
  };
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  return {
    statusCode: response.status,
    headers,
    body: await response.text(),
  };
}

export function stripStagePrefix(event: APIGatewayProxyEventV2): string {
  const rawPath = event.requestContext.http.path;
  const stage = event.requestContext.stage;
  if (stage && stage !== '$default' && rawPath.startsWith(`/${stage}`)) {
    return rawPath.slice(`/${stage}`.length) || '/';
  }
  return rawPath;
}

function deriveBaseUrl(event: APIGatewayProxyEventV2): string {
  const stage = event.requestContext.stage;
  const prefix = stage && stage !== '$default' ? `/${stage}` : '';
  return `https://${event.requestContext.domainName}${prefix}`;
}

export function extractBearerToken(event: APIGatewayProxyEventV2): string | null {
  const h = event.headers['authorization'] ?? event.headers['Authorization'];
  if (!h) return null;
  const token = h.replace(/^Bearer\s+/i, '').trim();
  return token || null;
}

export function parseBody(event: APIGatewayProxyEventV2): string {
  if (!event.body) return '';
  return event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf-8')
    : event.body;
}

function jsonResponse(statusCode: number, body: unknown): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(body),
  };
}
