# MoyKlass MCP Server

MCP (Model Context Protocol) сервер для [МойКласс CRM](https://moyklass.com). Позволяет AI-агентам (Claude Desktop, Claude Code, ChatGPT и другим MCP-клиентам) читать данные CRM на естественном языке.

**Итерация 1: только чтение (GET-эндпоинты).**

**Стек:** TypeScript · MCP SDK 1.27+ · AWS Lambda (Node.js 24) · API Gateway V2 · SAM

---

## Инструменты (16 tools)

| Инструмент | Эндпоинт | Описание |
|---|---|---|
| `list_joins` | `GET /v1/company/joins` | Список записей учеников в группы с фильтрацией |
| `get_join` | `GET /v1/company/joins/{id}` | Детали записи в группу |
| `list_users` | `GET /v1/company/users` | Поиск учеников по имени, телефону, email, тегам |
| `get_user` | `GET /v1/company/users/{id}` | Полная информация об ученике |
| `list_user_tags` | `GET /v1/company/userTags` | Список тегов учеников |
| `list_tasks` | `GET /v1/company/tasks` | Список задач с фильтрацией |
| `get_task` | `GET /v1/company/tasks/{id}` | Детали задачи |
| `list_courses` | `GET /v1/company/courses` | Список программ обучения |
| `list_classes` | `GET /v1/company/classes` | Список учебных групп |
| `get_class` | `GET /v1/company/classes/{id}` | Детали группы |
| `list_lessons` | `GET /v1/company/lessons` | Расписание занятий с фильтрацией |
| `get_lesson` | `GET /v1/company/lessons/{id}` | Детали занятия |
| `list_lesson_records` | `GET /v1/company/lessonRecords` | Журнал посещаемости |
| `get_lesson_record` | `GET /v1/company/lessonRecords/{id}` | Детали записи на занятие |
| `list_user_subscriptions` | `GET /v1/company/userSubscriptions` | Абонементы учеников |
| `get_user_subscription` | `GET /v1/company/userSubscriptions/{id}` | Детали абонемента |

---

## Установка и локальная разработка

### 1. Клонирование и зависимости

```bash
git clone <repo-url>
cd MoyKlass
npm install
```

### 2. Переменная окружения

Создайте `.env` или экспортируйте переменную:

```bash
export MOYKLASS_API_KEY=ваш_api_ключ
# Опционально, по умолчанию https://api.moyklass.com
export CRM_API_URL=https://api.moyklass.com
```

API-ключ находится в настройках компании в МойКласс → Интеграции → API.

### 3. Запуск в stdio-режиме

```bash
MOYKLASS_API_KEY=ваш_ключ npm run dev
```

При старте сервер автоматически получает `accessToken` через `POST /v1/company/auth/getToken` и кэширует его. При получении ошибки 401 токен обновляется автоматически.

### 4. Тестирование через MCP Inspector

```bash
npm run build          # tsc → build/
npx @modelcontextprotocol/inspector build/index.js
```

Откроется браузерный инспектор на `http://localhost:5173` для ручного вызова инструментов.

---

## Подключение к Claude Desktop

### Локально (stdio)

```bash
npm run build   # собрать один раз
```

`~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "moyklass": {
      "command": "node",
      "args": ["/абсолютный/путь/к/MoyKlass/build/index.js"],
      "env": {
        "MOYKLASS_API_KEY": "ваш_api_ключ"
      }
    }
  }
}
```

Перезапустите Claude Desktop. В интерфейсе появится значок инструментов.

### Remote (Lambda)

```json
{
  "mcpServers": {
    "moyklass": {
      "transport": "http",
      "url": "https://xxx.execute-api.eu-central-1.amazonaws.com/prod/mcp"
    }
  }
}
```

---

## Деплой на AWS Lambda

### 1. Предварительные требования

```bash
# AWS CLI + SAM CLI
brew install awscli aws-sam-cli

# Аутентификация AWS
aws configure
```

### 2. Сборка

```bash
npm run build:lambda   # → dist/lambda.js (~780 KB)
```

### 3. Деплой

```bash
sam deploy --guided
```

SAM запросит параметры при первом деплое:

| Параметр | Описание |
|---|---|
| `MoyKlassApiKey` | API-ключ МойКласс |
| `CrmApiUrl` | Base URL (по умолчанию `https://api.moyklass.com`) |

После деплоя SAM выведет `McpUrl` — URL для подключения MCP-клиентов.

### 4. Повторный деплой

```bash
npm run build:lambda
sam deploy   # использует сохранённую конфигурацию
```

---

## Архитектура

```
AI-клиент (Claude Desktop / ChatGPT)
  │
  │  POST /mcp  (MCP JSON-RPC)
  ▼
API Gateway HTTP API
  │
  ▼
Lambda (Node.js 24)
  ├── apiGatewayEventToRequest()       — адаптер Lambda ↔ Web Request
  ├── WebStandardStreamableHTTPServerTransport
  │     sessionIdGenerator: undefined  — stateless (нет хранилища сессий)
  │     enableJsonResponse: true       — JSON вместо SSE (для API Gateway)
  ├── McpServer  →  tool handler
  │     └── apiRequest()
  │           ├── getAccessToken()     — кэш токена в памяти Lambda container
  │           │     POST /v1/company/auth/getToken  (при промахе кэша)
  │           └── fetch()  →  МойКласс CRM API
  └── cleanup: transport.close() + server.close()
```

### Аутентификация

При старте Lambda-контейнера (cold start) или при истечении токена:
1. Сервер вызывает `POST /v1/company/auth/getToken` с `MOYKLASS_API_KEY`
2. Полученный `accessToken` кэшируется в памяти модуля (работает между warm invocations)
3. Токен подставляется в заголовок `x-access-token` всех запросов
4. При ответе `401 Unauthorized` — токен инвалидируется и немедленно обновляется

### Stateless Streamable HTTP

Каждый Lambda-вызов полностью независим: создаёт свой `McpServer` и транспорт, обрабатывает запрос и уничтожается. Нет shared state, нет сессий, автоматическое горизонтальное масштабирование.

---

## Сборка

```bash
npm run build          # tsc → build/  (для stdio)
npm run build:lambda   # esbuild → dist/lambda.js  (для Lambda)
npm run typecheck      # проверка типов без компиляции
npm run dev            # tsx watch src/index.ts  (hot reload)
```

---

## Переменные окружения

| Переменная | Обязательная | По умолчанию | Описание |
|---|---|---|---|
| `MOYKLASS_API_KEY` | Да | — | API-ключ компании МойКласс |
| `CRM_API_URL` | Нет | `https://api.moyklass.com` | Base URL CRM API |

---

## Добавление нового инструмента

1. Найти GET-эндпоинт в `docs/openapi.json`
2. Добавить метод в `src/client/moyKlassClient.ts` (если нужна специфичная обработка) или вызывать `apiRequest` напрямую
3. Зарегистрировать инструмент в `src/server.ts` через `server.tool(name, description, zodSchema, handler)`
4. Запустить `npm run typecheck`
