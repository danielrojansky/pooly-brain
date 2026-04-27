'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WalletCard } from '@/components/WalletCard';
import { Loader2, Wallet, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface WalletData {
  id: string;
  rail: string;
  balance_cents: number;
  currency: string;
  agent_id: string | null;
  external_id?: string | null;
}

const AGENTS: Record<string, string> = {
  'a1b2c3d4-0000-0000-0000-000000000001': 'shoppingAgent',
  'a1b2c3d4-0000-0000-0000-000000000002': 'textProcessor',
  'a1b2c3d4-0000-0000-0000-000000000003': 'billPayer',
};

export default function TreasuryPage() {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [draggedWallet, setDraggedWallet] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('mock');

  useEffect(() => {
    loadWallets();
  }, []);

  async function loadWallets() {
    setLoading(true);
    try {
      const res = await fetch('/api/treasury/wallets');
      const json = await res.json();
      if (json.ok) {
        setWallets(json.data.wallets);
        setTotalBalance(json.data.totalBalance);
      }
    } finally {
      setLoading(false);
    }
  }

  async function deployWallets() {
    setDeploying(true);
    try {
      const res = await fetch('/api/treasury/deploy-wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 500, rail: activeTab }),
      });
      const json = await res.json();
      if (json.ok) {
        setWallets(json.data.wallets ?? wallets);
        toast.success(`Deployed ${json.data.count} wallets`);
        await loadWallets();
      }
    } finally {
      setDeploying(false);
    }
  }

  function filterByRail(rail: string) {
    if (rail === 'all') return wallets;
    return wallets.filter((w) => w.rail === rail);
  }

  const railWallets = filterByRail(activeTab === 'all' ? 'all' : activeTab);
  const visibleWallets = railWallets.slice(0, 50);

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="text-xs font-mono text-[#94A3B8] mb-1">Scenario 02</div>
          <h1 className="text-2xl font-bold text-[#E2E8F0]">Wallet Farm</h1>
          <p className="text-[#94A3B8] mt-1">Deploy and manage 500 agent wallets across payment rails.</p>
        </div>

        {/* Master Treasury Balance */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-[#3B82F6]/10 rounded-lg p-3">
              <Wallet className="h-6 w-6 text-[#3B82F6]" />
            </div>
            <div>
              <div className="text-sm text-[#94A3B8]">Master Treasury Balance</div>
              <div className="text-2xl font-bold text-[#E2E8F0]">
                ${(totalBalance / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-[#94A3B8]">{wallets.length} wallets</div>
            </div>
          </div>
          <Button className="bg-[#10B981] hover:bg-[#059669] flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Funds
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-[#1E293B] border border-[#334155]">
              <TabsTrigger value="stripe_acp" className="data-[state=active]:bg-[#3B82F6] data-[state=active]:text-white">Stripe Virtual</TabsTrigger>
              <TabsTrigger value="rapyd" className="data-[state=active]:bg-[#10B981] data-[state=active]:text-white">Rapyd Native</TabsTrigger>
              <TabsTrigger value="mock" className="data-[state=active]:bg-[#334155]">Mock</TabsTrigger>
            </TabsList>
            <Button
              data-tour-id="deploy-wallets-btn"
              onClick={deployWallets}
              disabled={deploying}
              className="bg-[#3B82F6] hover:bg-[#2563EB]"
            >
              {deploying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Deploy 500 Wallets
            </Button>
          </div>

          {['stripe_acp', 'rapyd', 'mock'].map((rail) => (
            <TabsContent key={rail} value={rail}>
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
                </div>
              ) : (
                <div
                  data-tour-id="wallet-grid"
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedWallet) {
                      // Drop on grid = unassign
                      toast.info('Drop on an agent badge to assign');
                      setDraggedWallet(null);
                    }
                  }}
                >
                  {visibleWallets.map((w) => (
                    <WalletCard
                      key={w.id}
                      wallet={w}
                      agentName={w.agent_id ? AGENTS[w.agent_id] : undefined}
                      onDragStart={setDraggedWallet}
                    />
                  ))}
                  {railWallets.length > 50 && (
                    <div className="col-span-full text-center text-sm text-[#94A3B8] py-4">
                      +{railWallets.length - 50} more wallets
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
