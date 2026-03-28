import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { apiRequest } from '../client/moyKlassClient.js';
import { extractBearerToken, stripStagePrefix } from '../lambda.js';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  // ── Auth ───────────────────────────────────────────────────────────────────

  const expectedToken = process.env.MCP_AUTH_TOKEN;
  const bearerToken = extractBearerToken(event);
  if (expectedToken && bearerToken !== expectedToken) {
    return json(401, { error: 'Unauthorized' });
  }

  // ── Routing ────────────────────────────────────────────────────────────────

  const path = stripStagePrefix(event);
  const q = (event.queryStringParameters ?? {}) as Record<string, string>;
  const segments = path.replace(/^\//, '').split('/');
  const [resource, id] = segments;

  try {
    switch (resource) {
      case 'joins':
        return json(200, id
          ? await apiRequest(`/v1/company/joins/${id}`)
          : await apiRequest('/v1/company/joins', q));

      case 'users':
        return json(200, id
          ? await apiRequest(`/v1/company/users/${id}`, q)
          : await apiRequest('/v1/company/users', q));

      case 'userTags':
        return json(200, await apiRequest('/v1/company/userTags'));

      case 'tasks':
        return json(200, id
          ? await apiRequest(`/v1/company/tasks/${id}`)
          : await apiRequest('/v1/company/tasks', q));

      case 'courses':
        return json(200, await apiRequest('/v1/company/courses', q));

      case 'classes':
        return json(200, id
          ? await apiRequest(`/v1/company/classes/${id}`, q)
          : await apiRequest('/v1/company/classes', q));

      case 'lessons':
        return json(200, id
          ? await apiRequest(`/v1/company/lessons/${id}`, q)
          : await apiRequest('/v1/company/lessons', q));

      case 'lessonRecords':
        return json(200, id
          ? await apiRequest(`/v1/company/lessonRecords/${id}`, q)
          : await apiRequest('/v1/company/lessonRecords', q));

      case 'userSubscriptions':
        return json(200, id
          ? await apiRequest(`/v1/company/userSubscriptions/${id}`)
          : await apiRequest('/v1/company/userSubscriptions', q));

      default:
        return json(404, { error: 'Not found' });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = /404/.test(msg) ? 404 : /403/.test(msg) ? 403 : 500;
    return json(status, { error: msg });
  }
};

function json(statusCode: number, body: unknown): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(body),
  };
}

