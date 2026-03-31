import { z } from 'zod';
import { safeCall } from './helpers.js';
import type { RegisterTool } from './types.js';

export const registerGetLessonRecord: RegisterTool = (server, ctx) => {
    server.tool(
        'get_lesson_record',
        'Возвращает детальную информацию о конкретной записи ученика на занятие по её ID.',
        {
            recordId: z.number().int().describe('ID записи на занятие.'),
            includeLesson: z.boolean().optional().describe('Включить информацию о занятии.'),
            includeUserSubscriptions: z.boolean().optional().describe('Включить абонемент ученика.'),
        },
        async ({ recordId, ...params }) => safeCall(() => ctx.apiRequest(`/v1/company/lessonRecords/${recordId}`, params))
    );
};
