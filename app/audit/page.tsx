'use client';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExplainabilityDrawer } from '@/components/ExplainabilityDrawer';
import { ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import mockTx from '@/lib/mocks/transactions.json';

const AGENT_NAMES: Record<string, string> = {
  'a1b2c3d4-0000-0000-0000-000000000001': 'shoppingAgent',
  'a1b2c3d4-0000-0000-0000-000000000002': 'textProcessor',
  'a1b2c3d4-0000-0000-0000-000000000003': 'billPayer',
};

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30',
  authorized: 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30',
  denied: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30',
  failed: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30',
};

export default function AuditPage() {
  const [transactions] = useState(mockTx);
  const [filterRail, setFilterRail] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  type AuditTx = {
    id: string;
    agent_id: string;
    wallet_id: string;
    policy_id: string;
    merchant_url: string;
    amount_cents: number;
    rail_used: string;
    status: string;
    policy_decision: { decision: 'allow' | 'deny'; reasons: string[]; policyVersion?: string };
    vgs_alias?: string;
    created_at: string;
  };

  const [selectedTx, setSelectedTx] = useState<AuditTx | null>(null);

  const filtered = transactions.filter((tx) => {
    if (filterRail !== 'all' && tx.rail_used !== filterRail) return false;
    if (filterStatus !== 'all' && tx.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#E2E8F0]">Transaction Audit Log</h1>
          <p className="text-[#94A3B8] mt-1">Every agent transaction with full policy evaluation trace.</p>
        </div>

        <div className="flex gap-3 mb-4">
          <Select value={filterRail} onValueChange={(v) => setFilterRail(v ?? 'all')}>
            <SelectTrigger className="bg-[#1E293B] border-[#334155] text-[#E2E8F0] w-40">
              <SelectValue placeholder="All Rails" />
            </SelectTrigger>
            <SelectContent className="bg-[#1E293B] border-[#334155]">
              <SelectItem value="all">All Rails</SelectItem>
              <SelectItem value="stripe_acp">Stripe ACP</SelectItem>
              <SelectItem value="rapyd">Rapyd</SelectItem>
              <SelectItem value="vgs_legacy">VGS Legacy</SelectItem>
              <SelectItem value="mock">Mock</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v ?? 'all')}>
            <SelectTrigger className="bg-[#1E293B] border-[#334155] text-[#E2E8F0] w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-[#1E293B] border-[#334155]">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="authorized">Authorized</SelectItem>
              <SelectItem value="denied">Denied</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div data-tour-id="tx-table" className="bg-[#1E293B] border border-[#334155] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#334155]">
                  {['Timestamp', 'Agent', 'Merchant', 'Amount', 'Rail', 'Status', 'Decision', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-[#94A3B8] font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-[#334155]/50 hover:bg-[#0F172A]/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedTx(tx as AuditTx)}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-[#94A3B8]">
                      {format(new Date(tx.created_at), 'MMM d, HH:mm')}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#E2E8F0]">
                      {AGENT_NAMES[tx.agent_id] ?? tx.agent_id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#94A3B8] max-w-[180px] truncate">
                      {tx.merchant_url}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#E2E8F0]">
                      ${(tx.amount_cents / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-[#94A3B8]">{tx.rail_used}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs border ${STATUS_COLORS[tx.status] ?? ''}`}>
                        {tx.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={`text-xs border ${
                          tx.policy_decision.decision === 'allow'
                            ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
                            : 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30'
                        }`}
                      >
                        {tx.policy_decision.decision}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight className="h-4 w-4 text-[#334155]" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <ExplainabilityDrawer
          tx={selectedTx}
          open={!!selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      </div>
    </div>
  );
}
