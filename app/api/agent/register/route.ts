import { MOCK } from '@/lib/mode';
import { auth } from '@/lib/auth';
import agents from '@/lib/mocks/agents.json';

const ANS_REGEX = /^(mcp|a2a|acp):\/\/[a-zA-Z0-9]+\.[a-zA-Z0-9]+\.[a-zA-Z0-9]+\.v[\d.]+\.[a-zA-Z0-9.]+$/;

export async function POST(req: Request) {
  const body = await req.json();
  const { protocol, agentId, capability, provider, version, extension } = body;

  if (!protocol || !agentId || !capability || !provider || !version || !extension) {
    return Response.json({ ok: false, error: { code: 'MISSING_FIELDS' } }, { status: 400 });
  }

  const ansUri = `${protocol}://${agentId}.${capability}.${provider}.${version}.${extension}`;

  if (!ANS_REGEX.test(ansUri)) {
    return Response.json({ ok: false, error: { code: 'INVALID_ANS_URI', message: ansUri } }, { status: 400 });
  }

  if (MOCK) {
    const agent = {
      id: crypto.randomUUID(),
      user_id: 'u1',
      ans_uri: ansUri,
      protocol,
      agent_id: agentId,
      capability,
      provider,
      version,
      extension,
      fqdn: `${agentId.toLowerCase()}.${provider.toLowerCase()}.${extension}`,
      trust_badge_status: 'pending',
      created_at: new Date().toISOString(),
    };
    return Response.json({ ok: true, data: { agent, ansUri } });
  }

  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ ok: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const { db } = await import('@/lib/db');
    const fqdn = `${agentId.toLowerCase()}.${provider.toLowerCase()}.${extension}`;
    const rows = await db`
      INSERT INTO agents (user_id, ans_uri, protocol, agent_id, capability, provider, version, extension, fqdn)
      VALUES (
        (SELECT id FROM users WHERE email = ${session.user.email}),
        ${ansUri}, ${protocol}, ${agentId}, ${capability}, ${provider}, ${version}, ${extension}, ${fqdn}
      )
      RETURNING *
    `;
    return Response.json({ ok: true, data: { agent: rows.rows[0], ansUri } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return Response.json({ ok: false, error: { code: 'DB_ERROR', message: msg } }, { status: 500 });
  }
}
