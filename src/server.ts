import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiRequest } from './client/moyKlassClient.js';

function ok(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

function err(e: unknown) {
  return { content: [{ type: 'text' as const, text: `Ошибка: ${String(e)}` }], isError: true };
}

async function safeCall(fn: () => Promise<unknown>) {
  try {
    return ok(await fn());
  } catch (e) { return err(e); }
}

export function createMcpServer(): McpServer {
  const server = new McpServer({ name: 'moyklass-mcp-server', version: '1.0.0' });

  // ─── Записи в группу (Joins) ────────────────────────────────────────────────

  server.tool(
    'list_joins',
    'Возвращает список записей учеников в группы. Поддерживает фильтрацию по дате создания/изменения/смены статуса, филиалу, группе, программе, статусу записи, ученику, сотруднику. Поддерживается постраничный вывод и сортировка.',
    {
      createdAt: z.array(z.string()).max(2).optional()
        .describe('Дата создания (ISO 8601). Одна дата — точный поиск, две даты — диапазон [от, до].'),
      updatedAt: z.array(z.string()).max(2).optional()
        .describe('Дата изменения (ISO 8601). Одна дата — точный поиск, две — диапазон.'),
      stateChangedAt: z.array(z.string()).max(2).optional()
        .describe('Дата изменения статуса записи (ISO 8601). Одна дата — точный поиск, две — диапазон.'),
      filialId: z.array(z.number().int()).optional().describe('Фильтр по ID филиала.'),
      classId: z.array(z.number().int()).optional().describe('Фильтр по ID группы.'),
      courseId: z.array(z.number().int()).optional().describe('Фильтр по ID программы.'),
      statusId: z.number().int().optional().describe('Фильтр по статусу записи.'),
      userId: z.number().int().optional().describe('Фильтр по ID ученика.'),
      managerId: z.number().int().optional().describe('Фильтр по ID ответственного сотрудника.'),
      offset: z.number().int().optional().describe('Смещение для постраничного вывода (по умолчанию 0).'),
      limit: z.number().int().optional().describe('Максимальное количество записей в ответе.'),
      sort: z.enum(['id', 'createdAt', 'updatedAt']).optional().describe('Поле для сортировки.'),
      sortDirection: z.enum(['asc', 'desc']).optional().describe('Направление сортировки.'),
    },
    async (params) => safeCall(() => apiRequest('/v1/company/joins', params))
  );

  server.tool(
    'get_join',
    'Возвращает детальную информацию о конкретной записи ученика в группу по её ID.',
    {
      joinId: z.number().int().describe('ID записи в группу.'),
    },
    async ({ joinId }) => safeCall(() => apiRequest(`/v1/company/joins/${joinId}`))
  );

  // ─── Ученики (Users) ─────────────────────────────────────────────────────────

  server.tool(
    'list_users',
    'Возвращает список учеников компании с поддержкой фильтрации по имени (подстрока), телефону (подстрока), email (подстрока), дате создания/изменения, статусу клиента, массиву ID. Поддерживается постраничный вывод и сортировка.',
    {
      userIds: z.array(z.number().int()).optional().describe('Фильтр по конкретным ID учеников.'),
      name: z.string().optional().describe('Поиск по подстроке в имени ученика.'),
      phone: z.string().optional().describe('Поиск по подстроке в номере телефона.'),
      email: z.string().optional().describe('Поиск по подстроке в email.'),
      clientStateId: z.array(z.number().int()).optional().describe('Фильтр по ID статуса клиента.'),
      createdAt: z.array(z.string()).max(2).optional()
        .describe('Дата создания (ISO 8601). Одна дата — точный поиск, две — диапазон.'),
      updatedAt: z.array(z.string()).max(2).optional()
        .describe('Дата изменения (ISO 8601). Одна дата — точный поиск, две — диапазон.'),
      stateChangedAt: z.array(z.string()).max(2).optional()
        .describe('Дата изменения статуса (ISO 8601). Одна дата — точный поиск, две — диапазон.'),
      attributes: z.record(z.string(), z.string()).optional()
        .describe('Поиск по признакам ученика. Объект { "название_признака": "значение" }, например { "birthday": "1990-01-01" }.'),
      includePayLink: z.boolean().optional().describe('Включить в ответ ключи оплаты.'),
      includeAvatarLink: z.boolean().optional().describe('Включить в ответ ссылку на фото.'),
      amoCRMContactId: z.number().int().optional().describe('Фильтр по ID контакта amoCRM.'),
      bitrixContactId: z.number().int().optional().describe('Фильтр по ID контакта Битрикс24.'),
      offset: z.number().int().optional().describe('Смещение для постраничного вывода.'),
      limit: z.number().int().optional().describe('Максимальное количество записей в ответе.'),
      sort: z.enum(['id', 'name', 'createdAt', 'updatedAt']).optional().describe('Поле для сортировки.'),
      sortDirection: z.enum(['asc', 'desc']).optional().describe('Направление сортировки.'),
    },
    async (params) => safeCall(() => apiRequest('/v1/company/users', params))
  );

  server.tool(
    'get_user',
    'Возвращает полную информацию об ученике по его ID: контактные данные, статус, теги, признаки, историю.',
    {
      userId: z.number().int().describe('ID ученика.'),
      includeJoins: z.boolean().optional().describe('Включить в ответ записи ученика в группы.'),
      includePayLink: z.boolean().optional().describe('Включить в ответ ключи оплаты.'),
      includeAvatarLink: z.boolean().optional().describe('Включить в ответ ссылку на фото.'),
    },
    async ({ userId, ...params }) => safeCall(() => apiRequest(`/v1/company/users/${userId}`, params))
  );

  server.tool(
    'list_user_tags',
    'Возвращает список всех доступных тегов учеников в компании.',
    {},
    async () => safeCall(() => apiRequest('/v1/company/userTags'))
  );

  // ─── Задачи (Tasks) ──────────────────────────────────────────────────────────

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
    async (params) => safeCall(() => apiRequest('/v1/company/tasks', params))
  );

  server.tool(
    'get_task',
    'Возвращает детальную информацию о задаче по её ID.',
    {
      taskId: z.number().int().describe('ID задачи.'),
    },
    async ({ taskId }) => safeCall(() => apiRequest(`/v1/company/tasks/${taskId}`))
  );

  // ─── Программы и Группы (Courses & Classes) ──────────────────────────────────

  server.tool(
    'list_courses',
    'Возвращает список программ обучения компании. Опционально включает вложенные группы и изображения. Можно запросить конкретные программы по массиву ID.',
    {
      courseId: z.array(z.number().int()).optional().describe('Фильтр: получить только указанные программы по их ID.'),
      includeClasses: z.boolean().optional().describe('Включить в ответ список групп каждой программы.'),
      includeImages: z.boolean().optional().describe('Включить в ответ изображения программ.'),
    },
    async (params) => safeCall(() => apiRequest('/v1/company/courses', params))
  );

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
    async (params) => safeCall(() => apiRequest('/v1/company/classes', params))
  );

  server.tool(
    'get_class',
    'Возвращает детальную информацию о конкретной учебной группе по её ID: программа, филиал, преподаватели, расписание, настройки записи и оплаты.',
    {
      classId: z.number().int().describe('ID группы.'),
      includeAttributes: z.boolean().optional().describe('Включить в ответ дополнительные признаки.'),
      includeStats: z.boolean().optional().describe('Включить в ответ финансовую статистику.'),
      includeDescription: z.boolean().optional().describe('Включить в ответ описание группы.'),
    },
    async ({ classId, ...params }) => safeCall(() => apiRequest(`/v1/company/classes/${classId}`, params))
  );

  // ─── Занятия (Lessons) ───────────────────────────────────────────────────────

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
    async (params) => safeCall(() => apiRequest('/v1/company/lessons', params))
  );

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
    async ({ lessonId, ...params }) => safeCall(() => apiRequest(`/v1/company/lessons/${lessonId}`, params))
  );

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
    async (params) => safeCall(() => apiRequest('/v1/company/lessonRecords', params))
  );

  server.tool(
    'get_lesson_record',
    'Возвращает детальную информацию о конкретной записи ученика на занятие по её ID.',
    {
      recordId: z.number().int().describe('ID записи на занятие.'),
      includeLesson: z.boolean().optional().describe('Включить информацию о занятии.'),
      includeUserSubscriptions: z.boolean().optional().describe('Включить абонемент ученика.'),
    },
    async ({ recordId, ...params }) => safeCall(() => apiRequest(`/v1/company/lessonRecords/${recordId}`, params))
  );

  // ─── Абонементы учеников (User Subscriptions) ────────────────────────────────

  server.tool(
    'list_user_subscriptions',
    'Возвращает список абонементов учеников. Поддерживает фильтрацию по ученику, сотруднику, программе, группе, дате продажи, дате начала/окончания действия, статусу (1-Не активный, 2-Активный, 3-Заморожен, 4-Окончен), внешнему номеру. Поддерживается постраничный вывод.',
    {
      userId: z.number().int().optional().describe('Фильтр по ID ученика.'),
      includeFamilySubs: z.boolean().optional().describe('Включить семейные абонементы (работает при указанном userId).'),
      managerId: z.number().int().optional().describe('Фильтр по ID сотрудника.'),
      externalId: z.union([z.string(), z.array(z.string())]).optional()
        .describe('Пользовательский номер абонемента.'),
      courseId: z.union([z.number().int(), z.array(z.number().int())]).optional()
        .describe('Фильтр по ID программы.'),
      classId: z.union([z.number().int(), z.array(z.number().int())]).optional()
        .describe('Фильтр по ID группы абонемента.'),
      mainClassId: z.union([z.number().int(), z.array(z.number().int())]).optional()
        .describe('Фильтр по ID основной группы абонемента.'),
      sellDate: z.array(z.string()).max(2).optional()
        .describe('Дата продажи (ISO 8601). Одна дата — точный поиск, две — диапазон.'),
      beginDate: z.array(z.string()).max(2).optional()
        .describe('Дата начала действия (ISO 8601). Одна дата — точный поиск, две — диапазон.'),
      endDate: z.array(z.string()).max(2).optional()
        .describe('Дата окончания действия (ISO 8601). Одна дата — точный поиск, две — диапазон.'),
      statusId: z.array(z.number().int()).optional()
        .describe('Статус абонемента: 1 — Не активный, 2 — Активный, 3 — Заморожен, 4 — Окончен.'),
      offset: z.number().int().optional().describe('Смещение для постраничного вывода.'),
      limit: z.number().int().optional().describe('Максимальное количество записей в ответе.'),
    },
    async (params) => safeCall(() => apiRequest('/v1/company/userSubscriptions', params))
  );

  server.tool(
    'get_user_subscription',
    'Возвращает детальную информацию об абонементе ученика по его ID: программа, группа, даты действия, количество занятий, остаток, статус.',
    {
      userSubscriptionId: z.number().int().describe('ID абонемента ученика.'),
    },
    async ({ userSubscriptionId }) => safeCall(() => apiRequest(`/v1/company/userSubscriptions/${userSubscriptionId}`))
  );

  return server;
}
