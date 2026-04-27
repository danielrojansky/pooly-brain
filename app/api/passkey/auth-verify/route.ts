import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { MOCK } from '@/lib/mode';

export async function POST(req: Request) {
  const body = await req.json();

  if (MOCK) {
    return Response.json({
      ok: true,
      data: {
        assertion: 'mock_assertion_' + crypto.randomUUID().slice(0, 12),
        verified: true,
      },
    });
  }

  try {
    const { response, expectedChallenge, credentialPublicKey, credentialID, counter } = body;

    const result = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: process.env.WEBAUTHN_ORIGIN ?? 'http://localhost:3000',
      expectedRPID: process.env.WEBAUTHN_RP_ID ?? 'localhost',
      authenticator: {
        credentialID: credentialID,
        credentialPublicKey: Buffer.from(credentialPublicKey, 'base64'),
        counter: counter ?? 0,
      },
    });

    return Response.json({ ok: true, data: { verified: result.verified, assertion: response.id } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return Response.json({ ok: false, error: { code: 'VERIFY_ERROR', message: msg } }, { status: 400 });
  }
}
