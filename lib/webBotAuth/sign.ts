import * as ed25519Noble from '@noble/ed25519';

export async function signWithBotAuth(payload: string): Promise<string> {
  const privateKeyHex = process.env.CF_BOT_AUTH_PRIVATE_KEY ?? '';
  if (!privateKeyHex) throw new Error('CF_BOT_AUTH_PRIVATE_KEY not configured');
  const privateKey = Buffer.from(privateKeyHex, 'hex');
  const message = Buffer.from(payload);
  const signature = await ed25519Noble.signAsync(message, privateKey);
  return Buffer.from(signature).toString('base64url');
}
