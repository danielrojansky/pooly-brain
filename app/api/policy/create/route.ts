import { MOCK } from '@/lib/mode';
import { auth } from '@/lib/auth';
import { hashPolicy } from '@/lib/policy/hash';

export async function POST(req: Request) {
  const body = await req.json();
  const { agentId, maxPerTxCents, maxDailyCents, merchantAllowlist, priority } = body;

  const configHash = hashPolicy({ agentId, maxPerTxCents, maxDailyCents, merchantAllowlist, priority });

  if (MOCK) {
    return Response.json({
      ok: true,
      data: {
        policy: {
          id: crypto.randomUUID(),
          agent_id: agentId,
          max_per_tx_cents: maxPerTxCents,
          max_daily_cents: maxDailyCents,
          merchant_allowlist: merchantAllowlist,
          priority,
          config_hash: configHash,
          created_at: new Date().toISOString(),
        },
        configHash,
      },
    });
  }

  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ ok: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const { db } = await import('@/lib/db');
    const rows = await db`
      INSERT INTO policies (user_id, agent_id, max_per_tx_cents, max_daily_cents, merchant_allowlist, priority, config_hash)
      VALUES (
        (SELECT id FROM users WHERE email = ${session.user.email}),
        ${agentId}, ${maxPerTxCents}, ${maxDailyCents},
        ${JSON.stringify(merchantAllowlist)}, ${priority}, ${configHash}
      )
      RETURNING *
    `;
    return Response.json({ ok: true, data: { policy: rows.rows[0], configHash } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return Response.json({ ok: false, error: { code: 'DB_ERROR', message: msg } }, { status: 500 });
  }
}
