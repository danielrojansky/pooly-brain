export interface TourStep {
  page: string;
  targetId: string;
  tooltip: string;
  action: { type: 'click' | 'type' | 'wait'; value?: string };
  dwellMs: number;
}

export const TOUR_STEPS: TourStep[] = [
  {
    page: '/onboarding',
    targetId: 'protocol-select',
    tooltip: 'Select the agent protocol — MCP is most common for Claude-based agents.',
    action: { type: 'click' },
    dwellMs: 1500,
  },
  {
    page: '/onboarding',
    targetId: 'agent-id-input',
    tooltip: "Enter the agent's unique ID. This becomes part of its verifiable ANS URI.",
    action: { type: 'type', value: 'shoppingAgent' },
    dwellMs: 1800,
  },
  {
    page: '/onboarding',
    targetId: 'capability-input',
    tooltip: 'The capability domain — what this agent does.',
    action: { type: 'type', value: 'retail' },
    dwellMs: 1200,
  },
  {
    page: '/onboarding',
    targetId: 'provider-input',
    tooltip: "Your organization's name — the agent's owner.",
    action: { type: 'type', value: 'acme' },
    dwellMs: 1200,
  },
  {
    page: '/onboarding',
    targetId: 'verify-domain-btn',
    tooltip: 'GoDaddy ANS verifies domain ownership via DNS-01 challenge.',
    action: { type: 'click' },
    dwellMs: 2000,
  },
  {
    page: '/onboarding',
    targetId: 'create-passkey-btn',
    tooltip:
      "Bind a hardware passkey to this agent's principal. Every transaction requires a fresh signature.",
    action: { type: 'click' },
    dwellMs: 2500,
  },
  {
    page: '/treasury',
    targetId: 'deploy-wallets-btn',
    tooltip:
      "Deploy 500 agent wallets in one click. Stripe's 3-wallet limit is bypassed with a virtual sub-ledger.",
    action: { type: 'click' },
    dwellMs: 2000,
  },
  {
    page: '/treasury',
    targetId: 'wallet-grid',
    tooltip: '500 wallets, each assignable to an agent. Drag any card to assign it.',
    action: { type: 'wait' },
    dwellMs: 1500,
  },
  {
    page: '/policy',
    targetId: 'max-per-tx-input',
    tooltip: 'Set the per-transaction spending cap.',
    action: { type: 'type', value: '500' },
    dwellMs: 1200,
  },
  {
    page: '/policy',
    targetId: 'merchant-allowlist-input',
    tooltip: 'Add allowed merchant domains. Wildcards supported.',
    action: { type: 'type', value: '*.aws.amazon.com' },
    dwellMs: 1500,
  },
  {
    page: '/policy',
    targetId: 'priority-high',
    tooltip: 'High priority — infrastructure payments execute first.',
    action: { type: 'click' },
    dwellMs: 1000,
  },
  {
    page: '/policy',
    targetId: 'deploy-policy-btn',
    tooltip:
      'Deploy the policy. A SHA-256 config hash is generated for tamper-evident audit.',
    action: { type: 'click' },
    dwellMs: 2000,
  },
  {
    page: '/execution',
    targetId: 'agent-selector',
    tooltip: 'Select the agent that will execute this purchase.',
    action: { type: 'click' },
    dwellMs: 1200,
  },
  {
    page: '/execution',
    targetId: 'amount-input',
    tooltip: 'The purchase amount — will be checked against the policy.',
    action: { type: 'type', value: '299' },
    dwellMs: 1200,
  },
  {
    page: '/execution',
    targetId: 'trigger-btn',
    tooltip:
      'The Financial Brain evaluates policy, requests mandate signing, then routes execution.',
    action: { type: 'click' },
    dwellMs: 3000,
  },
  {
    page: '/execution',
    targetId: 'terminal-log',
    tooltip:
      "Watch the VGS forward proxy intercept the real card alias and substitute it at egress. The merchant's CDE never sees a real PAN.",
    action: { type: 'wait' },
    dwellMs: 3000,
  },
  {
    page: '/audit',
    targetId: 'tx-table',
    tooltip:
      'Every transaction is logged with its policy decision, passkey assertion, and full audit trail.',
    action: { type: 'click' },
    dwellMs: 2000,
  },
];
