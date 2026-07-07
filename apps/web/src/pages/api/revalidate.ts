import type { APIRoute } from 'astro';

const REVALIDATION_TOKEN =
  (import.meta as unknown as { env: Record<string, string | undefined> }).env.REVALIDATION_TOKEN ??
  '';

export const POST: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token || token !== REVALIDATION_TOKEN) {
    return new Response(JSON.stringify({ success: false, message: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = (await request.json()) as {
    collection?: string;
    event?: string;
  };
  const { collection, event } = body;

  console.info('[Astro Revalidation]', { collection, event });

  return new Response(JSON.stringify({ success: true, message: 'Revalidation acknowledged' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
