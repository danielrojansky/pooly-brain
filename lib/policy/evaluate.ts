export interface Policy {
  id: string;
  limits: { maxPerTxCents: number; maxDailyCents: number };
  merchantAllowlist: string[];
  priority: string;
  configHash: string;
}

export interface TxIntent {
  amountCents: number;
  merchantUrl: string;
}

export interface Decision {
  decision: 'allow' | 'deny';
  reasons: string[];
  policyVersion: string;
}

export function evaluatePolicy(policy: Policy, tx: TxIntent): Decision {
  const reasons: string[] = [];

  if (tx.amountCents > policy.limits.maxPerTxCents) {
    reasons.push(`AMOUNT_EXCEEDS_PER_TX: ${tx.amountCents} > ${policy.limits.maxPerTxCents}`);
  }

  const matchesAllowlist = policy.merchantAllowlist.some((pattern) => {
    if (pattern.startsWith('*.')) return tx.merchantUrl.endsWith(pattern.slice(1));
    return tx.merchantUrl === pattern || tx.merchantUrl.includes(pattern);
  });

  if (!matchesAllowlist) {
    reasons.push(`MERCHANT_NOT_ALLOWLISTED: ${tx.merchantUrl}`);
  }

  return reasons.length === 0
    ? { decision: 'allow', reasons: ['ALL_CHECKS_PASSED'], policyVersion: policy.configHash }
    : { decision: 'deny', reasons, policyVersion: policy.configHash };
}
