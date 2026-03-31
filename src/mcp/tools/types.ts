import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

type Params = Record<string, string | number | boolean | string[] | number[] | Record<string, string> | undefined>;

export interface ToolContext {
  apiRequest: <T>(path: string, params?: Params) => Promise<T>;
}

export type RegisterTool = (server: McpServer, ctx: ToolContext) => void;
