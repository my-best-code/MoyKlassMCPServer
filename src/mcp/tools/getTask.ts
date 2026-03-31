import { z } from 'zod';
import { safeCall } from './helpers.js';
import type { RegisterTool } from './types.js';

export const registerGetTask: RegisterTool = (server, ctx) => {
    server.tool(
        'get_task',
        'Возвращает детальную информацию о задаче по её ID.',
        {
            taskId: z.number().int().describe('ID задачи.'),
        },
        async ({ taskId }) => safeCall(() => ctx.apiRequest(`/v1/company/tasks/${taskId}`))
    );
};
