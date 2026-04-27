import * as ed25519Noble from '@noble/ed25519';

export async function getPublicJwks(): Promise<{ keys: unknown[] }> {
  const privateKeyHex = process.env.CF_BOT_AUTH_PRIVATE_KEY ?? '';
  const kid = process.env.CF_BOT_AUTH_KID ?? 'pooly-bot-auth-key';

  if (!privateKeyHex) {
    return {
      keys: [
        {
          kty: 'OKP',
          crv: 'Ed25519',
          kid,
          use: 'sig',
          alg: 'EdDSA',
          x: 'placeholder_public_key_base64url',
        },
      ],
    };
  }

  const privateKey = Buffer.from(privateKeyHex, 'hex');
  const publicKey = await ed25519Noble.getPublicKeyAsync(privateKey);
  const x = Buffer.from(publicKey).toString('base64url');

  return {
    keys: [
      {
        kty: 'OKP',
        crv: 'Ed25519',
        kid,
        use: 'sig',
        alg: 'EdDSA',
        x,
      },
    ],
  };
}
