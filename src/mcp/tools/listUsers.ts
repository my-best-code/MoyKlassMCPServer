import { z } from 'zod';
import { safeCall } from './helpers.js';
import type { RegisterTool } from './types.js';

export const registerListUsers: RegisterTool = (server, ctx) => {
    server.tool(
        'list_users',
        'Возвращает список учеников компании с поддержкой фильтрации по имени (подстрока), телефону (подстрока), email (подстрока), дате создания/изменения, статусу клиента, массиву ID. Поддерживается постраничный вывод и сортировка.',
        {
            userIds: z.array(z.number().int()).optional().describe('Фильтр по конкретным ID учеников.'),
            name: z.string().optional().describe('Поиск по подстроке в имени ученика.'),
            phone: z.string().optional().describe('Поиск по подстроке в номере телефона.'),
            email: z.string().optional().describe('Поиск по подстроке в email.'),
            clientStateId: z.array(z.number().int()).optional().describe('Фильтр по ID статуса клиента.'),
            createdAt: z.array(z.string()).max(2).optional()
                .describe('Дата создания (ISO 8601). Одна дата — точный поиск, две — диапазон.'),
            updatedAt: z.array(z.string()).max(2).optional()
                .describe('Дата изменения (ISO 8601). Одна дата — точный поиск, две — диапазон.'),
            stateChangedAt: z.array(z.string()).max(2).optional()
                .describe('Дата изменения статуса (ISO 8601). Одна дата — точный поиск, две — диапазон.'),
            attributes: z.record(z.string(), z.string()).optional()
                .describe('Поиск по признакам ученика. Объект { "название_признака": "значение" }, например { "birthday": "1990-01-01" }.'),
            includePayLink: z.boolean().optional().describe('Включить в ответ ключи оплаты.'),
            includeAvatarLink: z.boolean().optional().describe('Включить в ответ ссылку на фото.'),
            amoCRMContactId: z.number().int().optional().describe('Фильтр по ID контакта amoCRM.'),
            bitrixContactId: z.number().int().optional().describe('Фильтр по ID контакта Битрикс24.'),
            offset: z.number().int().optional().describe('Смещение для постраничного вывода.'),
            limit: z.number().int().optional().describe('Максимальное количество записей в ответе.'),
            sort: z.enum(['id', 'name', 'createdAt', 'updatedAt']).optional().describe('Поле для сортировки.'),
            sortDirection: z.enum(['asc', 'desc']).optional().describe('Направление сортировки.'),
        },
        async (params) => safeCall(() => ctx.apiRequest('/v1/company/users', params))
    );
};
