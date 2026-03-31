import { z } from 'zod';
import { safeCall } from './helpers.js';
import type { RegisterTool } from './types.js';

export const registerGetUser: RegisterTool = (server, ctx) => {
    server.tool(
        'get_user',
        'Возвращает полную информацию об ученике по его ID: контактные данные, статус, теги, признаки, историю.',
        {
            userId: z.number().int().describe('ID ученика.'),
            includeJoins: z.boolean().optional().describe('Включить в ответ записи ученика в группы.'),
            includePayLink: z.boolean().optional().describe('Включить в ответ ключи оплаты.'),
            includeAvatarLink: z.boolean().optional().describe('Включить в ответ ссылку на фото.'),
        },
        async ({ userId, ...params }) => safeCall(() => ctx.apiRequest(`/v1/company/users/${userId}`, params))
    );
};
