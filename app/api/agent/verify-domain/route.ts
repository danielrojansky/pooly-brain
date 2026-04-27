import { MOCK } from '@/lib/mode';

export async function POST(req: Request) {
  const { agentId, fqdn } = await req.json();

  if (!agentId) {
    return Response.json({ ok: false, error: { code: 'MISSING_AGENT_ID' } }, { status: 400 });
  }

  // Simulate DNS-01 challenge verification delay
  await new Promise((r) => setTimeout(r, 1200));

  if (MOCK) {
    return Response.json({
      ok: true,
      data: {
        verified: true,
        trustBadge: 'verified',
        fqdn: fqdn ?? agentId,
        challenge: '_acme-challenge.' + (fqdn ?? agentId),
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Real GoDaddy ANS verification would go here
  const apiKey = process.env.GODADDY_ANS_API_KEY;
  if (!apiKey) {
    return Response.json({ ok: false, error: { code: 'ANS_NOT_CONFIGURED' } }, { status: 503 });
  }

  return Response.json({ ok: true, data: { verified: true, trustBadge: 'verified' } });
}
