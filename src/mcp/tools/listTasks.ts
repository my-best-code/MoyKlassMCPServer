import { z } from 'zod';
import { safeCall } from './helpers.js';
import type { RegisterTool } from './types.js';

export const registerListTasks: RegisterTool = (server, ctx) => {
    server.tool(
        'list_tasks',
        'Возвращает список задач компании с фильтрацией по дате создания, филиалу, группе, ученику, ответственному сотруднику и статусу (завершена / не завершена). Поддерживается постраничный вывод.',
        {
            createdAt: z.array(z.string()).max(2).optional()
                .describe('Дата создания (ISO 8601). Одна дата — точный поиск, две — диапазон.'),
            filialId: z.array(z.number().int()).optional().describe('Фильтр по ID филиала.'),
            classId: z.array(z.number().int()).optional().describe('Фильтр по ID группы.'),
            userId: z.number().int().optional().describe('Фильтр по ID ученика.'),
            managerId: z.number().int().optional().describe('Фильтр по ID ответственного сотрудника.'),
            isComplete: z.boolean().optional().describe('true — только завершённые задачи, false — незавершённые.'),
            offset: z.number().int().optional().describe('Смещение для постраничного вывода.'),
            limit: z.number().int().optional().describe('Максимальное количество записей в ответе.'),
        },
        async (params) => safeCall(() => ctx.apiRequest('/v1/company/tasks', params))
    );
};
