import { z } from 'zod';
import { safeCall } from './helpers.js';
import type { RegisterTool } from './types.js';

export const registerListClasses: RegisterTool = (server, ctx) => {
    server.tool(
        'list_classes',
        'Возвращает список учебных групп компании. Поддерживает фильтрацию по программе, филиалу, ID группы. Опционально включает изображения, признаки, описание и финансовую статистику.',
        {
            classId: z.array(z.number().int()).optional().describe('Фильтр: получить только указанные группы по их ID.'),
            courseId: z.array(z.number().int()).optional().describe('Фильтр по ID программы.'),
            filialId: z.array(z.number().int()).optional().describe('Фильтр по ID филиала.'),
            includeImages: z.boolean().optional().describe('Включить в ответ изображения групп.'),
            includeAttributes: z.boolean().optional().describe('Включить в ответ дополнительные признаки групп.'),
            includeDescription: z.boolean().optional().describe('Включить в ответ описание группы.'),
            includeStats: z.boolean().optional().describe('Включить в ответ суммарную информацию по долгу и доходу группы.'),
        },
        async (params) => safeCall(() => ctx.apiRequest('/v1/company/classes', params))
    );
};
