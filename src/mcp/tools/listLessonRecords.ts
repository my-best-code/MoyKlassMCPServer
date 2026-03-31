import { z } from 'zod';
import { safeCall } from './helpers.js';
import type { RegisterTool } from './types.js';

export const registerListLessonRecords: RegisterTool = (server, ctx) => {
    server.tool(
        'list_lesson_records',
        'Возвращает записи учеников на занятия (журнал посещаемости). Фильтрация по ученику, занятию, группе, дате. Флаги: бесплатное посещение, факт посещения, пробное занятие, пропуск, уважительная причина, оплата. Поддерживает постраничный вывод.',
        {
            userId: z.array(z.number().int()).optional().describe('Фильтр по ID учеников.'),
            lessonId: z.array(z.number().int()).optional().describe('Фильтр по ID занятий.'),
            classId: z.array(z.number().int()).optional().describe('Фильтр по ID группы.'),
            date: z.array(z.string()).max(2).optional()
                .describe('Дата занятия (ISO 8601). Одна дата — точный поиск, две — диапазон.'),
            free: z.boolean().optional().describe('true — только бесплатные посещения.'),
            visit: z.boolean().optional().describe('true — ученик посетил занятие, false — пропустил.'),
            test: z.boolean().optional().describe('true — только пробные записи на занятие.'),
            skip: z.boolean().optional().describe('true — записи, не учитываемые в количестве занятых мест.'),
            goodReason: z.boolean().optional().describe('true — пропуск по уважительной причине.'),
            paid: z.boolean().optional().describe('true — платное занятие, false — бесплатное.'),
            hasBills: z.boolean().optional().describe('true — только оплаченные записи, false — только неоплаченные.'),
            includeBills: z.boolean().optional().describe('Включить данные о списании.'),
            includeUserSubscriptions: z.boolean().optional().describe('Включить абонементы ученика (требует includeBills=true).'),
            includeFamilyRecords: z.boolean().optional().describe('Включить записи участников семьи.'),
            includeLessons: z.boolean().optional().describe('Включить информацию о занятиях.'),
            includeWorkOffs: z.boolean().optional().describe('Включить информацию об отработках.'),
            offset: z.number().int().optional().describe('Смещение для постраничного вывода.'),
            limit: z.number().int().optional().describe('Максимальное количество записей в ответе.'),
        },
        async (params) => safeCall(() => ctx.apiRequest('/v1/company/lessonRecords', params))
    );
};
