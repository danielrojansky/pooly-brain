import { MOCK } from '@/lib/mode';
import { auth } from '@/lib/auth';
import mockTx from '@/lib/mocks/transactions.json';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ txId: string }> }
) {
  const { txId } = await params;

  if (MOCK) {
    const tx = mockTx.find((t) => t.id === txId) ?? mockTx[0];
    return Response.json({ ok: true, data: tx });
  }

  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ ok: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const { db } = await import('@/lib/db');
    const rows = await db`SELECT * FROM transactions WHERE id = ${txId}`;
    if (!rows.rows[0]) {
      return Response.json({ ok: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
    }
    return Response.json({ ok: true, data: rows.rows[0] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return Response.json({ ok: false, error: { code: 'DB_ERROR', message: msg } }, { status: 500 });
  }
}
