import { getPublicJwks } from '@/lib/webBotAuth/jwks';

export async function GET() {
  const jwks = await getPublicJwks();
  return Response.json(jwks, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': 'application/json',
    },
  });
}
