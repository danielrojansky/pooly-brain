import { MOCK } from '@/lib/mode';
import vgsTrace from '@/lib/mocks/vgs-proxy-trace.json';

export async function POST(req: Request) {
  const body = await req.json();
  const { txId, vgsAlias } = body;

  if (MOCK) {
    return Response.json({
      ok: true,
      data: {
        txId: txId ?? crypto.randomUUID(),
        status: 'completed',
        vgsAlias: vgsAlias ?? 'tok_5678901234',
        trace: vgsTrace,
        receipt: {
          merchant: 'mock-vendor.example/checkout',
          amount: body.amountCents ?? 29900,
          timestamp: new Date().toISOString(),
        },
      },
    });
  }

  // Real VGS proxy execution
  const { vgsForwardRequest } = await import('@/lib/vgs/forward');
  const merchantUrl = body.merchantUrl ?? 'https://mock-vendor.example/api/charge';

  try {
    const res = await vgsForwardRequest(merchantUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alias: vgsAlias, amount: body.amountCents }),
    });

    return Response.json({
      ok: true,
      data: {
        txId,
        status: res.ok ? 'completed' : 'failed',
        trace: vgsTrace,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return Response.json({ ok: false, error: { code: 'VGS_ERROR', message: msg } }, { status: 500 });
  }
}
