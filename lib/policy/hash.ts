import crypto from 'crypto';

export function hashPolicy(policy: Record<string, unknown>): string {
  const sorted = JSON.stringify(policy, Object.keys(policy).sort());
  return crypto.createHash('sha256').update(sorted).digest('hex').slice(0, 16);
}
