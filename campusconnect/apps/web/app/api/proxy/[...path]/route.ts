import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function handler(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const token = req.cookies.get('access_token')?.value;

  const body = req.method !== 'GET' && req.method !== 'HEAD'
    ? await req.text()
    : undefined;

  try {
    const res = await fetch(`${API_URL}/api/${path}`, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Cookie: `access_token=${token}` } : {}),
      },
      body,
    });

    const data = await res.text();
    const response = new NextResponse(data, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });

    const setCookie = res.headers.get('set-cookie');
    if (setCookie) response.headers.set('set-cookie', setCookie);

    return response;
  } catch {
    return NextResponse.json(
      { message: `Failed to reach API at ${API_URL}` },
      { status: 502 }
    );
  }
}

export { handler as GET, handler as POST, handler as PATCH, handler as DELETE };