import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerMcpTools } from './mcp/registerTools.js';
import { apiRequest } from './client/moyKlassClient.js';

export function createMcpServer(): McpServer {
  const server = new McpServer({ name: 'moyklass-mcp-server', version: '1.0.0' });
  registerMcpTools(server, { apiRequest });
  return server;
}
