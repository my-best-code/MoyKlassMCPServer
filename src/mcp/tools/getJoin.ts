import { z } from 'zod';
import { safeCall } from './helpers.js';
import type { RegisterTool } from './types.js';

export const registerGetJoin: RegisterTool = (server, ctx) => {
    server.tool(
        'get_join',
        'Возвращает детальную информацию о конкретной записи ученика в группу по её ID.',
        {
            joinId: z.number().int().describe('ID записи в группу.'),
        },
        async ({ joinId }) => safeCall(() => ctx.apiRequest(`/v1/company/joins/${joinId}`))
    );
};
