import { z } from 'zod';
import { safeCall } from './helpers.js';
import type { RegisterTool } from './types.js';

export const registerGetClass: RegisterTool = (server, ctx) => {
    server.tool(
        'get_class',
        'Возвращает детальную информацию о конкретной учебной группе по её ID: программа, филиал, преподаватели, расписание, настройки записи и оплаты.',
        {
            classId: z.number().int().describe('ID группы.'),
            includeAttributes: z.boolean().optional().describe('Включить в ответ дополнительные признаки.'),
            includeStats: z.boolean().optional().describe('Включить в ответ финансовую статистику.'),
            includeDescription: z.boolean().optional().describe('Включить в ответ описание группы.'),
        },
        async ({ classId, ...params }) => safeCall(() => ctx.apiRequest(`/v1/company/classes/${classId}`, params))
    );
};
