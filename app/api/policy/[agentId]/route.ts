import { MOCK } from '@/lib/mode';
import { auth } from '@/lib/auth';
import mockPolicies from '@/lib/mocks/policies.json';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;

  if (MOCK) {
    const policy = mockPolicies.find((p) => p.agent_id === agentId);
    if (!policy) {
      return Response.json({ ok: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
    }
    return Response.json({ ok: true, data: policy });
  }

  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ ok: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const { db } = await import('@/lib/db');
    const rows = await db`
      SELECT p.* FROM policies p
      JOIN users u ON p.user_id = u.id
      WHERE u.email = ${session.user.email} AND p.agent_id = ${agentId}
      ORDER BY p.created_at DESC
      LIMIT 1
    `;
    if (!rows.rows[0]) {
      return Response.json({ ok: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
    }
    return Response.json({ ok: true, data: rows.rows[0] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return Response.json({ ok: false, error: { code: 'DB_ERROR', message: msg } }, { status: 500 });
  }
}
