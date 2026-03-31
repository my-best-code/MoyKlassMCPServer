import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ToolContext, RegisterTool } from './tools/types.js';
import { registerListJoins } from './tools/listJoins.js';
import { registerGetJoin } from './tools/getJoin.js';
import { registerListUsers } from './tools/listUsers.js';
import { registerGetUser } from './tools/getUser.js';
import { registerListUserTags } from './tools/listUserTags.js';
import { registerListTasks } from './tools/listTasks.js';
import { registerGetTask } from './tools/getTask.js';
import { registerListCourses } from './tools/listCourses.js';
import { registerListClasses } from './tools/listClasses.js';
import { registerGetClass } from './tools/getClass.js';
import { registerListLessons } from './tools/listLessons.js';
import { registerGetLesson } from './tools/getLesson.js';
import { registerListLessonRecords } from './tools/listLessonRecords.js';
import { registerGetLessonRecord } from './tools/getLessonRecord.js';
import { registerListUserSubscriptions } from './tools/listUserSubscriptions.js';
import { registerGetUserSubscription } from './tools/getUserSubscription.js';

const tools: RegisterTool[] = [
    // ─── Записи в группу (Joins) ──────────────────────────────────────────────
    registerListJoins,
    registerGetJoin,
    // ─── Ученики (Users) ──────────────────────────────────────────────────────
    registerListUsers,
    registerGetUser,
    registerListUserTags,
    // ─── Задачи (Tasks) ───────────────────────────────────────────────────────
    registerListTasks,
    registerGetTask,
    // ─── Программы и Группы (Courses & Classes) ───────────────────────────────
    registerListCourses,
    registerListClasses,
    registerGetClass,
    // ─── Занятия (Lessons) ────────────────────────────────────────────────────
    registerListLessons,
    registerGetLesson,
    registerListLessonRecords,
    registerGetLessonRecord,
    // ─── Абонементы учеников (User Subscriptions) ─────────────────────────────
    registerListUserSubscriptions,
    registerGetUserSubscription,
    // ← добавляй новые инструменты сюда
];

export function registerMcpTools(
    server: McpServer,
    ctx: ToolContext,
): void {
    for (const register of tools) {
        register(server, ctx);
    }
}
