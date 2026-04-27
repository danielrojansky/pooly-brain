import { MOCK } from '@/lib/mode';
import { auth } from '@/lib/auth';
import mockWallets from '@/lib/mocks/wallets.json';

export async function POST(req: Request) {
  const body = await req.json();
  const count = body.count ?? 500;
  const rail = body.rail ?? 'mock';

  if (MOCK) {
    const wallets = mockWallets.slice(0, count);
    return Response.json({ ok: true, data: { count: wallets.length, wallets } });
  }

  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ ok: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const { db } = await import('@/lib/db');

    if (rail === 'rapyd') {
      // Batch create via Rapyd (simplified)
      const wallets = [];
      for (let i = 0; i < count; i += 50) {
        const batch = Math.min(50, count - i);
        for (let j = 0; j < batch; j++) {
          wallets.push({ rail, balance_cents: 0, currency: 'USD' });
        }
        await new Promise((r) => setTimeout(r, 200));
      }
      return Response.json({ ok: true, data: { count: wallets.length } });
    }

    // Insert wallet rows (virtual sub-ledger for stripe)
    const rows = await db`
      INSERT INTO wallets (user_id, rail, balance_cents, currency)
      SELECT
        (SELECT id FROM users WHERE email = ${session.user.email}),
        ${rail},
        floor(random() * 100000 + 1000)::bigint,
        'USD'
      FROM generate_series(1, ${count})
      RETURNING *
    `;

    return Response.json({ ok: true, data: { count: rows.rowCount, wallets: rows.rows } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return Response.json({ ok: false, error: { code: 'DB_ERROR', message: msg } }, { status: 500 });
  }
}
