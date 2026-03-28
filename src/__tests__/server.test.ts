import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createMcpServer } from '../server.js';

vi.mock('../client/moyKlassClient.js', () => ({
  apiRequest: vi.fn().mockResolvedValue([]),
}));

import { apiRequest } from '../client/moyKlassClient.js';
const mockApiRequest = vi.mocked(apiRequest);

const EXPECTED_TOOLS = [
  'list_joins',
  'get_join',
  'list_users',
  'get_user',
  'list_user_tags',
  'list_tasks',
  'get_task',
  'list_courses',
  'list_classes',
  'get_class',
  'list_lessons',
  'get_lesson',
  'list_lesson_records',
  'get_lesson_record',
  'list_user_subscriptions',
  'get_user_subscription',
];

async function createConnectedPair() {
  const server = createMcpServer();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: 'test-client', version: '1.0.0' });
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  return { server, client };
}

describe('createMcpServer — tool registration', () => {
  it('registers exactly 16 tools', async () => {
    const { server, client } = await createConnectedPair();
    const { tools } = await client.listTools();
    expect(tools).toHaveLength(16);
    await client.close();
    await server.close();
  });

  it('registers all expected tool names', async () => {
    const { server, client } = await createConnectedPair();
    const { tools } = await client.listTools();
    const names = tools.map(t => t.name);
    for (const expected of EXPECTED_TOOLS) {
      expect(names, `missing tool: ${expected}`).toContain(expected);
    }
    await client.close();
    await server.close();
  });

  it('every tool has a non-empty description', async () => {
    const { server, client } = await createConnectedPair();
    const { tools } = await client.listTools();
    for (const tool of tools) {
      expect(tool.description, `${tool.name} has no description`).toBeTruthy();
    }
    await client.close();
    await server.close();
  });

  it('pagination tools expose offset and limit params', async () => {
    const { server, client } = await createConnectedPair();
    const { tools } = await client.listTools();
    const paginated = ['list_joins', 'list_users', 'list_tasks', 'list_lessons',
                       'list_lesson_records', 'list_user_subscriptions'];
    for (const name of paginated) {
      const tool = tools.find(t => t.name === name)!;
      const props = (tool.inputSchema as { properties: Record<string, unknown> }).properties;
      expect(props, `${name} missing offset`).toHaveProperty('offset');
      expect(props, `${name} missing limit`).toHaveProperty('limit');
    }
    await client.close();
    await server.close();
  });
});

describe('tool execution', () => {
  beforeEach(() => {
    mockApiRequest.mockResolvedValue([{ id: 1 }]);
  });

  it('list_classes calls apiRequest with /v1/company/classes', async () => {
    const { server, client } = await createConnectedPair();
    await client.callTool({ name: 'list_classes', arguments: {} });
    expect(mockApiRequest).toHaveBeenCalledWith('/v1/company/classes', expect.any(Object));
    await client.close();
    await server.close();
  });

  it('get_class calls apiRequest with path including classId', async () => {
    const { server, client } = await createConnectedPair();
    await client.callTool({ name: 'get_class', arguments: { classId: 42 } });
    expect(mockApiRequest).toHaveBeenCalledWith('/v1/company/classes/42', expect.any(Object));
    await client.close();
    await server.close();
  });

  it('list_joins calls apiRequest with /v1/company/joins', async () => {
    const { server, client } = await createConnectedPair();
    await client.callTool({ name: 'list_joins', arguments: { limit: 5 } });
    expect(mockApiRequest).toHaveBeenCalledWith('/v1/company/joins', expect.objectContaining({ limit: 5 }));
    await client.close();
    await server.close();
  });

  it('get_user calls apiRequest with correct userId path', async () => {
    const { server, client } = await createConnectedPair();
    await client.callTool({ name: 'get_user', arguments: { userId: 99 } });
    expect(mockApiRequest).toHaveBeenCalledWith('/v1/company/users/99', expect.any(Object));
    await client.close();
    await server.close();
  });

  it('list_user_tags calls apiRequest with no params', async () => {
    const { server, client } = await createConnectedPair();
    await client.callTool({ name: 'list_user_tags', arguments: {} });
    expect(mockApiRequest).toHaveBeenCalledWith('/v1/company/userTags');
    await client.close();
    await server.close();
  });

  it('returns tool result as JSON text content', async () => {
    mockApiRequest.mockResolvedValue([{ id: 7, name: 'Group' }]);
    const { server, client } = await createConnectedPair();
    const result = await client.callTool({ name: 'list_classes', arguments: {} });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(JSON.parse(text)).toEqual([{ id: 7, name: 'Group' }]);
    await client.close();
    await server.close();
  });

  it('returns isError=true when apiRequest throws', async () => {
    mockApiRequest.mockRejectedValueOnce(new Error('CRM API error 500: crash'));
    const { server, client } = await createConnectedPair();
    const result = await client.callTool({ name: 'list_classes', arguments: {} });
    expect(result.isError).toBe(true);
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    expect(text).toContain('CRM API error 500');
    await client.close();
    await server.close();
  });
});
