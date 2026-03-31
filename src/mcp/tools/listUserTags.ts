import { safeCall } from './helpers.js';
import type { RegisterTool } from './types.js';

export const registerListUserTags: RegisterTool = (server, ctx) => {
    server.tool(
        'list_user_tags',
        'Возвращает список всех доступных тегов учеников в компании.',
        {},
        async () => safeCall(() => ctx.apiRequest('/v1/company/userTags'))
    );
};
