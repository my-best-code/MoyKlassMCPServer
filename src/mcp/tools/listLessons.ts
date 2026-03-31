import { z } from 'zod';
import { safeCall } from './helpers.js';
import type { RegisterTool } from './types.js';

export const registerListLessons: RegisterTool = (server, ctx) => {
    server.tool(
        'list_lessons',
        'Возвращает расписание занятий с фильтрацией по дате, группе, аудитории, филиалу, преподавателю, ученику и статусу проведения. Поддерживает постраничный вывод, сортировку и подключение дополнительных данных: записей, пропусков, оценок, заданий.',
        {
            date: z.array(z.string()).max(2).optional()
                .describe('Дата проведения (ISO 8601). Одна дата — точный поиск, две — диапазон [от, до].'),
            lessonId: z.array(z.number().int()).optional().describe('Фильтр по конкретным ID занятий.'),
            classId: z.array(z.number().int()).optional().describe('Фильтр по ID группы.'),
            filialId: z.array(z.number().int()).optional().describe('Фильтр по ID филиала.'),
            roomId: z.array(z.number().int()).optional().describe('Фильтр по ID аудитории.'),
            teacherId: z.array(z.number().int()).optional().describe('Фильтр по ID преподавателя.'),
            userId: z.number().int().optional().describe('Фильтр: занятия, на которые записан ученик с этим ID.'),
            statusId: z.number().int().optional().describe('Статус занятия: 0 — не проведено, 1 — проведено.'),
            includeRecords: z.boolean().optional().describe('Включить записи учеников на занятие.'),
            includeWorkOffs: z.boolean().optional().describe('Включить информацию об отработках и пропусках.'),
            includeMarks: z.boolean().optional().describe('Включить оценки к занятию.'),
            includeTasks: z.boolean().optional().describe('Включить задания к занятию.'),
            includeTaskAnswers: z.boolean().optional().describe('Включить ответы учеников на задания.'),
            includeUserSubscriptions: z.boolean().optional().describe('Включить абонементы учеников.'),
            includeParams: z.boolean().optional().describe('Включить дополнительные параметры занятия.'),
            offset: z.number().int().optional().describe('Смещение для постраничного вывода.'),
            limit: z.number().int().optional().describe('Максимальное количество записей в ответе.'),
            sort: z.enum(['id', 'date', 'status', 'createdAt', 'maxStudents', 'roomId', 'classId', 'filialId', 'beginTime', 'endTime']).optional()
                .describe('Поле для сортировки.'),
            sortDirection: z.enum(['asc', 'desc']).optional().describe('Направление сортировки.'),
        },
        async (params) => safeCall(() => ctx.apiRequest('/v1/company/lessons', params))
    );
};
