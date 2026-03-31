import { z } from 'zod';
import { safeCall } from './helpers.js';
import type { RegisterTool } from './types.js';

export const registerListUserSubscriptions: RegisterTool = (server, ctx) => {
    server.tool(
        'list_user_subscriptions',
        'Возвращает список абонементов учеников. Поддерживает фильтрацию по ученику, сотруднику, программе, группе, дате продажи, дате начала/окончания действия, статусу (1-Не активный, 2-Активный, 3-Заморожен, 4-Окончен), внешнему номеру. Поддерживается постраничный вывод.',
        {
            userId: z.number().int().optional().describe('Фильтр по ID ученика.'),
            includeFamilySubs: z.boolean().optional().describe('Включить семейные абонементы (работает при указанном userId).'),
            managerId: z.number().int().optional().describe('Фильтр по ID сотрудника.'),
            externalId: z.union([z.string(), z.array(z.string())]).optional()
                .describe('Пользовательский номер абонемента.'),
            courseId: z.union([z.number().int(), z.array(z.number().int())]).optional()
                .describe('Фильтр по ID программы.'),
            classId: z.union([z.number().int(), z.array(z.number().int())]).optional()
                .describe('Фильтр по ID группы абонемента.'),
            mainClassId: z.union([z.number().int(), z.array(z.number().int())]).optional()
                .describe('Фильтр по ID основной группы абонемента.'),
            sellDate: z.array(z.string()).max(2).optional()
                .describe('Дата продажи (ISO 8601). Одна дата — точный поиск, две — диапазон.'),
            beginDate: z.array(z.string()).max(2).optional()
                .describe('Дата начала действия (ISO 8601). Одна дата — точный поиск, две — диапазон.'),
            endDate: z.array(z.string()).max(2).optional()
                .describe('Дата окончания действия (ISO 8601). Одна дата — точный поиск, две — диапазон.'),
            statusId: z.array(z.number().int()).optional()
                .describe('Статус абонемента: 1 — Не активный, 2 — Активный, 3 — Заморожен, 4 — Окончен.'),
            offset: z.number().int().optional().describe('Смещение для постраничного вывода.'),
            limit: z.number().int().optional().describe('Максимальное количество записей в ответе.'),
        },
        async (params) => safeCall(() => ctx.apiRequest('/v1/company/userSubscriptions', params))
    );
};
