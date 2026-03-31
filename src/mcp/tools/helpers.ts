export function ok(data: unknown) {
    return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

export function err(e: unknown) {
    return { content: [{ type: 'text' as const, text: `Ошибка: ${String(e)}` }], isError: true };
}

export async function safeCall(fn: () => Promise<unknown>) {
    try {
        return ok(await fn());
    } catch (e) { return err(e); }
}
