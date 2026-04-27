import { generateRegistrationOptions } from '@simplewebauthn/server';

export async function POST(req: Request) {
  const { email } = await req.json();

  const options = await generateRegistrationOptions({
    rpName: process.env.WEBAUTHN_RP_NAME ?? 'Financial Brain',
    rpID: process.env.WEBAUTHN_RP_ID ?? 'localhost',
    userID: crypto.randomUUID(),
    userName: email ?? 'demo@example.com',
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'required',
      userVerification: 'required',
    },
  });

  return Response.json({ ok: true, data: options });
}
