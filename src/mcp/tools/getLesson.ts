import { z } from 'zod';
import { safeCall } from './helpers.js';
import type { RegisterTool } from './types.js';

export const registerGetLesson: RegisterTool = (server, ctx) => {
    server.tool(
        'get_lesson',
        'Возвращает детальную информацию о конкретном занятии по его ID: дата, время, аудитория, преподаватель, группа. Опционально включает записи, пропуски, оценки и задания.',
        {
            lessonId: z.number().int().describe('ID занятия.'),
            includeRecords: z.boolean().optional().describe('Включить записи учеников на занятие.'),
            includeWorkOffs: z.boolean().optional().describe('Включить информацию об отработках и пропусках.'),
            includeMarks: z.boolean().optional().describe('Включить оценки к занятию.'),
            includeTasks: z.boolean().optional().describe('Включить задания к занятию.'),
            includeTaskAnswers: z.boolean().optional().describe('Включить ответы учеников на задания.'),
            includeParams: z.boolean().optional().describe('Включить дополнительные параметры занятия.'),
        },
        async ({ lessonId, ...params }) => safeCall(() => ctx.apiRequest(`/v1/company/lessons/${lessonId}`, params))
    );
};
