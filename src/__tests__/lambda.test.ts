import { describe, it, expect } from 'vitest';
import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { apiGatewayEventToRequest, webResponseToApiGateway, stripStagePrefix } from '../lambda.js';

type Result = APIGatewayProxyStructuredResultV2;

function makeEvent(overrides: Partial<APIGatewayProxyEventV2> = {}): APIGatewayProxyEventV2 {
  return {
    version: '2.0',
    routeKey: 'POST /mcp',
    rawPath: '/prod/mcp',
    rawQueryString: '',
    headers: { 'content-type': 'application/json' },
    requestContext: {
      accountId: '123',
      apiId: 'abc',
      domainName: 'abc.execute-api.us-east-1.amazonaws.com',
      domainPrefix: 'abc',
      http: { method: 'POST', path: '/prod/mcp', protocol: 'HTTP/1.1', sourceIp: '1.2.3.4', userAgent: 'test' },
      requestId: 'req-1',
      routeKey: 'POST /mcp',
      stage: 'prod',
      time: '01/Jan/2025:00:00:00 +0000',
      timeEpoch: 1735689600000,
    },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'tools/list', id: 1 }),
    isBase64Encoded: false,
    ...overrides,
  } as APIGatewayProxyEventV2;
}

describe('stripStagePrefix', () => {
  it('strips named stage prefix from path', () => {
    const event = makeEvent();
    expect(stripStagePrefix(event)).toBe('/mcp');
  });

  it('leaves path unchanged for $default stage', () => {
    const event = makeEvent({
      rawPath: '/mcp',
      requestContext: { ...makeEvent().requestContext, stage: '$default', http: { ...makeEvent().requestContext.http, path: '/mcp' } },
    });
    expect(stripStagePrefix(event)).toBe('/mcp');
  });

  it('returns "/" when path equals the stage prefix', () => {
    const event = makeEvent({
      rawPath: '/prod',
      requestContext: { ...makeEvent().requestContext, http: { ...makeEvent().requestContext.http, path: '/prod' } },
    });
    expect(stripStagePrefix(event)).toBe('/');
  });

  it('leaves path unchanged when no stage', () => {
    const event = makeEvent({
      requestContext: { ...makeEvent().requestContext, stage: '', http: { ...makeEvent().requestContext.http, path: '/mcp' } },
    });
    expect(stripStagePrefix(event)).toBe('/mcp');
  });
});

describe('apiGatewayEventToRequest', () => {
  it('creates Request with correct method and URL', () => {
    const req = apiGatewayEventToRequest(makeEvent());
    expect(req.method).toBe('POST');
    expect(req.url).toBe('https://localhost/mcp');
  });

  it('includes request headers', () => {
    const req = apiGatewayEventToRequest(makeEvent({ headers: { 'x-custom': 'value' } }));
    expect(req.headers.get('x-custom')).toBe('value');
  });

  it('includes body for POST requests', async () => {
    const body = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' });
    const req = apiGatewayEventToRequest(makeEvent({ body }));
    expect(await req.text()).toBe(body);
  });

  it('decodes base64-encoded body', async () => {
    const original = '{"jsonrpc":"2.0"}';
    const encoded = Buffer.from(original).toString('base64');
    const req = apiGatewayEventToRequest(makeEvent({ body: encoded, isBase64Encoded: true }));
    expect(await req.text()).toBe(original);
  });

  it('does not include body for GET requests', async () => {
    const event = makeEvent({
      requestContext: { ...makeEvent().requestContext, http: { ...makeEvent().requestContext.http, method: 'GET', path: '/prod/mcp' } },
      body: '{"should":"be-ignored"}',
    });
    const req = apiGatewayEventToRequest(event);
    expect(req.method).toBe('GET');
    // GET body should be null/empty
    expect(await req.text()).toBe('');
  });

  it('does not include body for DELETE requests', async () => {
    const event = makeEvent({
      requestContext: { ...makeEvent().requestContext, http: { ...makeEvent().requestContext.http, method: 'DELETE', path: '/prod/mcp' } },
      body: '{"should":"be-ignored"}',
    });
    const req = apiGatewayEventToRequest(event);
    expect(req.method).toBe('DELETE');
    expect(await req.text()).toBe('');
  });

  it('handles missing body', async () => {
    const req = apiGatewayEventToRequest(makeEvent({ body: undefined }));
    expect(await req.text()).toBe('');
  });
});

describe('webResponseToApiGateway', () => {
  it('maps status code', async () => {
    const response = new Response('ok', { status: 200 });
    const result = await webResponseToApiGateway(response) as Result;
    expect(result.statusCode).toBe(200);
  });

  it('maps response body', async () => {
    const response = new Response('{"result":1}', { status: 200 });
    const result = await webResponseToApiGateway(response) as Result;
    expect(result.body).toBe('{"result":1}');
  });

  it('always includes CORS header', async () => {
    const response = new Response('', { status: 200 });
    const result = await webResponseToApiGateway(response) as Result;
    expect((result.headers as Record<string, string>)['Access-Control-Allow-Origin']).toBe('*');
  });

  it('maps response headers', async () => {
    const response = new Response('', { status: 200, headers: { 'content-type': 'application/json' } });
    const result = await webResponseToApiGateway(response) as Result;
    expect((result.headers as Record<string, string>)['content-type']).toBe('application/json');
  });

  it('includes CORS even on error responses', async () => {
    const response = new Response('error', { status: 500 });
    const result = await webResponseToApiGateway(response) as Result;
    expect(result.statusCode).toBe(500);
    expect((result.headers as Record<string, string>)['Access-Control-Allow-Origin']).toBe('*');
  });
});
