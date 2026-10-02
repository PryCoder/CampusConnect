import { cookies } from 'next/headers';

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { auth?: boolean }
): Promise<T> {
  const { auth = false, ...rest } = init ?? {};

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(rest.headers ?? {}),
  };

  if (auth) {
    const token = cookies().get('access_token')?.value;
    if (token) (headers as Record<string, string>)['Cookie'] = `access_token=${token}`;
  }

  const res = await fetch(`${API_URL}/api${path}`, {
    ...rest,
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message);
  }

  return res.json();
}