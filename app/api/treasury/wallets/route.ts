import { MOCK } from '@/lib/mode';
import { auth } from '@/lib/auth';
import mockWallets from '@/lib/mocks/wallets.json';

export async function GET() {
  if (MOCK) {
    const totalBalance = mockWallets.reduce((sum, w) => sum + w.balance_cents, 0);
    return Response.json({ ok: true, data: { wallets: mockWallets, totalBalance } });
  }

  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ ok: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const { db } = await import('@/lib/db');
    const rows = await db`
      SELECT w.* FROM wallets w
      JOIN users u ON w.user_id = u.id
      WHERE u.email = ${session.user.email}
      ORDER BY w.created_at DESC
    `;
    const totalBalance = (rows.rows as Array<{ balance_cents: number }>).reduce((sum, w) => sum + Number(w.balance_cents), 0);
    return Response.json({ ok: true, data: { wallets: rows.rows, totalBalance } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return Response.json({ ok: false, error: { code: 'DB_ERROR', message: msg } }, { status: 500 });
  }
}
