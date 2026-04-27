import { signRapyd } from './sign';

const BASE_URL = process.env.RAPYD_BASE_URL ?? 'https://sandboxapi.rapyd.net';

export async function rapydRequest<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const bodyStr = body ? JSON.stringify(body) : '';
  const headers = signRapyd({ method, urlPath: path, body: bodyStr });

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: bodyStr || undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Rapyd error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}
