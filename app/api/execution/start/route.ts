import { MOCK } from '@/lib/mode';
import { auth } from '@/lib/auth';
import { evaluatePolicy } from '@/lib/policy/evaluate';
import mockPolicies from '@/lib/mocks/policies.json';

export async function POST(req: Request) {
  const body = await req.json();
  const { agentId, amountCents, merchantUrl, rail } = body;

  if (!agentId || amountCents === undefined || !merchantUrl) {
    return Response.json({ ok: false, error: { code: 'MISSING_FIELDS' } }, { status: 400 });
  }

  const raw = mockPolicies.find((p) => p.agent_id === agentId) ?? mockPolicies[2];
  const policy = {
    id: raw.id,
    limits: { maxPerTxCents: raw.max_per_tx_cents, maxDailyCents: raw.max_daily_cents },
    merchantAllowlist: raw.merchant_allowlist,
    priority: raw.priority,
    configHash: raw.config_hash,
  };
  const decision = evaluatePolicy(policy, { amountCents, merchantUrl });

  if (decision.decision === 'deny') {
    return Response.json({ ok: false, error: { code: 'POLICY_DENIED', data: decision } }, { status: 403 });
  }

  const txId = crypto.randomUUID();
  const challenge = {
    amountCents,
    merchantUrl,
    currency: 'USD',
    nonce: crypto.randomUUID(),
    timestamp: Date.now(),
    agentId,
  };

  if (MOCK) {
    return Response.json({
      ok: true,
      data: {
        txId,
        status: 'authorized',
        policyDecision: decision,
        challenge,
        requiresPasskey: true,
        rail: rail ?? 'vgs_legacy',
      },
    });
  }

  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ ok: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const { db } = await import('@/lib/db');
    await db`
      INSERT INTO transactions (id, agent_id, merchant_url, amount_cents, rail_used, status, policy_decision, challenge_payload)
      VALUES (${txId}, ${agentId}, ${merchantUrl}, ${amountCents}, ${rail ?? 'vgs_legacy'}, 'authorized', ${JSON.stringify(decision)}, ${JSON.stringify(challenge)})
    `;
    return Response.json({ ok: true, data: { txId, status: 'authorized', policyDecision: decision, challenge, requiresPasskey: true } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return Response.json({ ok: false, error: { code: 'DB_ERROR', message: msg } }, { status: 500 });
  }
}
