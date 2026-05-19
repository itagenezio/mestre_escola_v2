/**
 * Helper de chamadas à API — prepende automaticamente o BASE_PATH em produção.
 *
 * Em desenvolvimento local: NEXT_PUBLIC_BASE_PATH não está definido → usa caminho relativo normal.
 * Em produção (VPS):        NEXT_PUBLIC_BASE_PATH=/mestre → requisições ficam em /mestre/api/...
 */

const BASE_PATH =
  typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_BASE_PATH ?? '') : '';

/** fetch simples com base path */
export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${BASE_PATH}${path}`, init);
}

/** fetch que retorna JSON já tipado; lança erro em caso de status não-OK */
export async function apiJson<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, init);
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${msg}`);
  }
  return res.json() as Promise<T>;
}

/** Atalho para POST com body JSON */
export function apiPost<T = unknown>(path: string, body: unknown): Promise<T> {
  return apiJson<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/** Atalho para PUT com body JSON */
export function apiPut<T = unknown>(path: string, body: unknown): Promise<T> {
  return apiJson<T>(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/** Atalho para DELETE */
export function apiDelete(path: string): Promise<unknown> {
  return apiJson(path, { method: 'DELETE' });
}
