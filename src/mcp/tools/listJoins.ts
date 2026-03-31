import { z } from 'zod';
import { safeCall } from './helpers.js';
import type { RegisterTool } from './types.js';

export const registerListJoins: RegisterTool = (server, ctx) => {
    server.tool(
        'list_joins',
        'Возвращает список записей учеников в группы. Поддерживает фильтрацию по дате создания/изменения/смены статуса, филиалу, группе, программе, статусу записи, ученику, сотруднику. Поддерживается постраничный вывод и сортировка.',
        {
            createdAt: z.array(z.string()).max(2).optional()
                .describe('Дата создания (ISO 8601). Одна дата — точный поиск, две даты — диапазон [от, до].'),
            updatedAt: z.array(z.string()).max(2).optional()
                .describe('Дата изменения (ISO 8601). Одна дата — точный поиск, две — диапазон.'),
            stateChangedAt: z.array(z.string()).max(2).optional()
                .describe('Дата изменения статуса записи (ISO 8601). Одна дата — точный поиск, две — диапазон.'),
            filialId: z.array(z.number().int()).optional().describe('Фильтр по ID филиала.'),
            classId: z.array(z.number().int()).optional().describe('Фильтр по ID группы.'),
            courseId: z.array(z.number().int()).optional().describe('Фильтр по ID программы.'),
            statusId: z.number().int().optional().describe('Фильтр по статусу записи.'),
            userId: z.number().int().optional().describe('Фильтр по ID ученика.'),
            managerId: z.number().int().optional().describe('Фильтр по ID ответственного сотрудника.'),
            offset: z.number().int().optional().describe('Смещение для постраничного вывода (по умолчанию 0).'),
            limit: z.number().int().optional().describe('Максимальное количество записей в ответе.'),
            sort: z.enum(['id', 'createdAt', 'updatedAt']).optional().describe('Поле для сортировки.'),
            sortDirection: z.enum(['asc', 'desc']).optional().describe('Направление сортировки.'),
        },
        async (params) => safeCall(() => ctx.apiRequest('/v1/company/joins', params))
    );
};
