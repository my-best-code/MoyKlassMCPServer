import { z } from 'zod';
import { safeCall } from './helpers.js';
import type { RegisterTool } from './types.js';

export const registerGetUserSubscription: RegisterTool = (server, ctx) => {
    server.tool(
        'get_user_subscription',
        'Возвращает детальную информацию об абонементе ученика по его ID: программа, группа, даты действия, количество занятий, остаток, статус.',
        {
            userSubscriptionId: z.number().int().describe('ID абонемента ученика.'),
        },
        async ({ userSubscriptionId }) => safeCall(() => ctx.apiRequest(`/v1/company/userSubscriptions/${userSubscriptionId}`))
    );
};
