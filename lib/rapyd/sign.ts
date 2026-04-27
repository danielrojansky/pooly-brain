import crypto from 'crypto';

export function signRapyd({
  method,
  urlPath,
  body,
}: {
  method: string;
  urlPath: string;
  body: string;
}): Record<string, string> {
  const salt = crypto.randomBytes(8).toString('hex');
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const accessKey = process.env.RAPYD_ACCESS_KEY!;
  const secretKey = process.env.RAPYD_SECRET_KEY!;
  const toSign =
    method.toLowerCase() + urlPath + salt + timestamp + accessKey + secretKey + body;
  const hmac = crypto.createHmac('sha256', secretKey).update(toSign).digest('hex');
  const signature = Buffer.from(hmac).toString('base64url');
  return {
    access_key: accessKey,
    salt,
    timestamp,
    signature,
    idempotency: crypto.randomUUID(),
    'Content-Type': 'application/json',
  };
}
