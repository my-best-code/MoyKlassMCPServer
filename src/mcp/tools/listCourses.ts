import { z } from 'zod';
import { safeCall } from './helpers.js';
import type { RegisterTool } from './types.js';

export const registerListCourses: RegisterTool = (server, ctx) => {
    server.tool(
        'list_courses',
        'Возвращает список программ обучения компании. Опционально включает вложенные группы и изображения. Можно запросить конкретные программы по массиву ID.',
        {
            courseId: z.array(z.number().int()).optional().describe('Фильтр: получить только указанные программы по их ID.'),
            includeClasses: z.boolean().optional().describe('Включить в ответ список групп каждой программы.'),
            includeImages: z.boolean().optional().describe('Включить в ответ изображения программ.'),
        },
        async (params) => safeCall(() => ctx.apiRequest('/v1/company/courses', params))
    );
};
