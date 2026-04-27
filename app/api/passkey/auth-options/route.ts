import { generateAuthenticationOptions } from '@simplewebauthn/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  const { txContext } = await req.json();

  let challenge: string | undefined;
  if (txContext) {
    const canonical = JSON.stringify(txContext, Object.keys(txContext).sort());
    challenge = crypto.createHash('sha256').update(canonical).digest('base64url');
  }

  const options = await generateAuthenticationOptions({
    rpID: process.env.WEBAUTHN_RP_ID ?? 'localhost',
    userVerification: 'required',
    ...(challenge ? { challenge } : {}),
  });

  return Response.json({ ok: true, data: options });
}
