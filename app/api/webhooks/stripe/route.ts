import { MOCK } from '@/lib/mode';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');

  if (MOCK) {
    return Response.json({ ok: true, received: true });
  }

  if (!sig) {
    return new Response('Missing stripe-signature', { status: 400 });
  }

  const body = await req.text();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    return new Response('Webhook secret not configured', { status: 503 });
  }

  try {
    const { getStripe } = await import('@/lib/stripe');
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(body, sig, secret);

    // Handle delegated checkout finalization
    // event.type may be 'v1.delegated_checkout.finalize_checkout' in newer Stripe versions
    if ((event.type as string) === 'v1.delegated_checkout.finalize_checkout') {
      const data = event.data.object;
      console.log('Delegated checkout finalized:', data);
    }

    return Response.json({ ok: true, received: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return new Response(`Webhook error: ${msg}`, { status: 400 });
  }
}
