import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { MOCK } from '@/lib/mode';

export async function POST(req: Request) {
  const body = await req.json();

  if (MOCK) {
    return Response.json({
      ok: true,
      data: {
        verified: true,
        credentialId: 'mock_cred_' + crypto.randomUUID().slice(0, 8),
      },
    });
  }

  try {
    const { response, expectedChallenge } = body;
    const result = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: process.env.WEBAUTHN_ORIGIN ?? 'http://localhost:3000',
      expectedRPID: process.env.WEBAUTHN_RP_ID ?? 'localhost',
    });

    if (!result.verified) {
      return Response.json({ ok: false, error: { code: 'VERIFICATION_FAILED' } }, { status: 400 });
    }

    return Response.json({ ok: true, data: { verified: true, registrationInfo: result.registrationInfo } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return Response.json({ ok: false, error: { code: 'VERIFY_ERROR', message: msg } }, { status: 400 });
  }
}
