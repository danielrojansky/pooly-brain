import { MOCK } from '@/lib/mode';
import { evaluatePolicy } from '@/lib/policy/evaluate';
import mockPolicies from '@/lib/mocks/policies.json';

export async function POST(req: Request) {
  const body = await req.json();
  const { agentId, amountCents, merchantUrl } = body;

  if (!agentId || amountCents === undefined || !merchantUrl) {
    return Response.json({ ok: false, error: { code: 'MISSING_FIELDS' } }, { status: 400 });
  }

  if (MOCK) {
    const raw = mockPolicies.find((p) => p.agent_id === agentId) ?? mockPolicies[0];
    const policy = {
      id: raw.id,
      limits: {
        maxPerTxCents: raw.max_per_tx_cents,
        maxDailyCents: raw.max_daily_cents,
      },
      merchantAllowlist: raw.merchant_allowlist,
      priority: raw.priority,
      configHash: raw.config_hash,
    };
    const decision = evaluatePolicy(policy, { amountCents, merchantUrl });
    return Response.json({ ok: true, data: decision });
  }

  try {
    const { db } = await import('@/lib/db');
    const rows = await db`
      SELECT * FROM policies WHERE agent_id = ${agentId} ORDER BY created_at DESC LIMIT 1
    `;
    if (!rows.rows[0]) {
      return Response.json({
        ok: false,
        error: { code: 'NO_POLICY', message: `No policy found for agent ${agentId}. Create one first.` },
      }, { status: 404 });
    }
    const raw = rows.rows[0];
    const policy = {
      id: raw.id,
      limits: { maxPerTxCents: raw.max_per_tx_cents, maxDailyCents: raw.max_daily_cents },
      merchantAllowlist: raw.merchant_allowlist,
      priority: raw.priority,
      configHash: raw.config_hash,
    };
    const decision = evaluatePolicy(policy, { amountCents, merchantUrl });
    return Response.json({ ok: true, data: decision });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return Response.json({ ok: false, error: { code: 'DB_ERROR', message: msg } }, { status: 500 });
  }
}
