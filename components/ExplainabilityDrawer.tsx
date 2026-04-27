'use client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Check, X } from 'lucide-react';

interface PolicyDecision {
  decision: 'allow' | 'deny';
  reasons: string[];
  policyVersion?: string;
}

interface Transaction {
  id: string;
  merchant_url: string;
  amount_cents: number;
  rail_used: string;
  status: string;
  policy_decision: PolicyDecision;
  created_at: string;
  vgs_alias?: string;
}

interface ExplainabilityDrawerProps {
  tx: Transaction | null;
  open: boolean;
  onClose: () => void;
}

export function ExplainabilityDrawer({ tx, open, onClose }: ExplainabilityDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="bg-[#1E293B] border-[#334155] text-[#E2E8F0] w-[400px]">
        <SheetHeader>
          <SheetTitle className="text-[#E2E8F0]">Policy Evaluation Trace</SheetTitle>
        </SheetHeader>
        {tx && (
          <div className="mt-4 space-y-4">
            <div className="space-y-1">
              <div className="text-xs text-[#94A3B8]">Transaction</div>
              <div className="font-mono text-xs text-[#E2E8F0]">{tx.id.slice(0, 16)}…</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-[#94A3B8]">Merchant</div>
              <div className="text-sm">{tx.merchant_url}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-[#94A3B8]">Amount</div>
              <div className="text-sm">${(tx.amount_cents / 100).toFixed(2)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-[#94A3B8]">Rail</div>
              <div className="font-mono text-sm">{tx.rail_used}</div>
            </div>
            {tx.policy_decision.policyVersion && (
              <div className="space-y-1">
                <div className="text-xs text-[#94A3B8]">Policy Hash</div>
                <div className="font-mono text-xs text-[#94A3B8]">
                  {tx.policy_decision.policyVersion}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <div className="text-xs text-[#94A3B8]">Evaluation Checklist</div>
              <ol className="space-y-2">
                {tx.policy_decision.reasons.map((reason, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="shrink-0 mt-0.5">
                      {tx.policy_decision.decision === 'allow' || reason === 'ALL_CHECKS_PASSED' ? (
                        <Check className="h-4 w-4 text-[#10B981]" />
                      ) : (
                        <X className="h-4 w-4 text-[#EF4444]" />
                      )}
                    </span>
                    <span className="font-mono text-xs">{reason}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div
              className={`rounded-lg p-3 text-sm font-medium ${
                tx.policy_decision.decision === 'allow'
                  ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30'
                  : 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30'
              }`}
            >
              Decision: {tx.policy_decision.decision.toUpperCase()}
            </div>
            {tx.vgs_alias && (
              <div className="space-y-1">
                <div className="text-xs text-[#94A3B8]">VGS Alias</div>
                <div className="font-mono text-xs text-[#67E8F9]">{tx.vgs_alias}</div>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
