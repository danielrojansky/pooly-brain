import { MOCK } from '@/lib/mode';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  const body = await req.json();
  const { walletId, amountCents } = body;

  if (MOCK) {
    return Response.json({
      ok: true,
      data: {
        walletId,
        funded: amountCents,
        newBalance: amountCents,
        vgsAlias: 'tok_' + crypto.randomUUID().slice(0, 10),
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
      UPDATE wallets
      SET balance_cents = balance_cents + ${amountCents}
      WHERE id = ${walletId}
      RETURNING *
    `;
    return Response.json({ ok: true, data: rows.rows[0] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return Response.json({ ok: false, error: { code: 'DB_ERROR', message: msg } }, { status: 500 });
  }
}
