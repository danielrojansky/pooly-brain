'use client';

interface Wallet {
  id: string;
  rail: string;
  balance_cents: number;
  currency: string;
  agent_id: string | null;
  external_id?: string | null;
}

interface WalletCardProps {
  wallet: Wallet;
  agentName?: string;
  onDragStart?: (walletId: string) => void;
}

const RAIL_COLORS: Record<string, string> = {
  stripe_acp: 'text-[#3B82F6]',
  rapyd: 'text-[#10B981]',
  vgs_legacy: 'text-[#F59E0B]',
  mock: 'text-[#94A3B8]',
};

export function WalletCard({ wallet, agentName, onDragStart }: WalletCardProps) {
  const truncatedId = wallet.id.slice(0, 8) + '…';
  const balance = (wallet.balance_cents / 100).toFixed(2);
  const railColor = RAIL_COLORS[wallet.rail] ?? 'text-[#94A3B8]';

  return (
    <div
      draggable={!wallet.agent_id}
      onDragStart={() => onDragStart?.(wallet.id)}
      className="bg-[#1E293B] border border-[#334155] rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-[#3B82F6]/50 transition-colors"
    >
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-medium ${railColor}`}>{wallet.rail}</span>
        {wallet.agent_id ? (
          <span className="text-xs bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 rounded-full px-2 py-0.5">
            {agentName ?? 'Assigned'}
          </span>
        ) : (
          <span className="text-xs text-[#94A3B8]">Unassigned</span>
        )}
      </div>
      <div className="font-mono text-xs text-[#94A3B8] mb-1">{truncatedId}</div>
      <div className="text-sm font-semibold text-[#E2E8F0]">
        ${balance} {wallet.currency}
      </div>
    </div>
  );
}
