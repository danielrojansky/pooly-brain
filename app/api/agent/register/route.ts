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
      ON CONFLICT (ans_uri) DO UPDATE SET
        capability = EXCLUDED.capability,
        provider = EXCLUDED.provider,
        version = EXCLUDED.version,
        extension = EXCLUDED.extension,
        fqdn = EXCLUDED.fqdn
      RETURNING *
    `;
    return Response.json({ ok: true, data: { agent: rows.rows[0], ansUri } });
  } catch (e: unknown) {
    const raw = e instanceof Error ? e.message : 'Unknown error';
    let code = 'DB_ERROR';
    let message = 'Unable to register agent. Try again.';
    if (raw.includes('agents_ans_uri_key') || raw.includes('duplicate key')) {
      code = 'AGENT_EXISTS';
      message = `An agent with URI ${ansUri} is already registered.`;
    } else if (raw.includes('connection') || raw.includes('fetch failed')) {
      code = 'DB_UNAVAILABLE';
      message = 'Database temporarily unavailable. Try again in a moment.';
    }
    return Response.json({ ok: false, error: { code, message } }, { status: 400 });
  }
}
