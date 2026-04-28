'use client';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TerminalLog, LogEntry } from '@/components/TerminalLog';
import { Loader2, Zap, Check, AlertTriangle, Brain } from 'lucide-react';
import { toast } from 'sonner';

const AGENTS = [
  { id: 'a1b2c3d4-0000-0000-0000-000000000001', name: 'shoppingAgent', ans: 'mcp://shoppingAgent.retail.acme.v1.0.0.example.com' },
  { id: 'a1b2c3d4-0000-0000-0000-000000000002', name: 'textProcessor', ans: 'a2a://textProcessor.documentTranslation.acme.v2.1.hipaa' },
  { id: 'a1b2c3d4-0000-0000-0000-000000000003', name: 'billPayer', ans: 'acp://billPayer.procurement.acme.v1.2.0.corp.com' },
];

interface ExecutionState {
  stage: 'idle' | 'policy' | 'passkey' | 'executing' | 'done' | 'error';
  policyDecision?: { decision: string; reasons: string[] };
  txId?: string;
  trace: LogEntry[];
  receipt?: { merchant: string; amount: number; timestamp: string };
}

interface Prediction {
  decision: 'allow' | 'deny';
  reasons: string[];
}

export default function ExecutionPage() {
  const [agentId, setAgentId] = useState(AGENTS[2].id);
  const [amount, setAmount] = useState('299');
  const [state, setState] = useState<ExecutionState>({ stage: 'idle', trace: [] });
  const [prediction, setPrediction] = useState<Prediction | null>(null);

  const selectedAgent = AGENTS.find((a) => a.id === agentId)!;
  const amountCents = Math.round(parseFloat(amount || '0') * 100);
  const merchantUrl = 'mock-vendor.example/checkout';

  const fetchPrediction = useCallback(async () => {
    if (!amountCents) { setPrediction(null); return; }
    try {
      const res = await fetch('/api/policy/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, amountCents, merchantUrl }),
      });
      const json = await res.json();
      if (json.ok) {
        setPrediction({ decision: json.data.decision, reasons: json.data.reasons });
      } else {
        setPrediction(null);
      }
    } catch {
      setPrediction(null);
    }
  }, [agentId, amountCents]);

  useEffect(() => {
    const t = setTimeout(fetchPrediction, 250);
    return () => clearTimeout(t);
  }, [fetchPrediction]);

  async function trigger() {
    setState({ stage: 'policy', trace: [] });

    // Stage 1: Policy check
    const startRes = await fetch('/api/execution/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, amountCents, merchantUrl, rail: 'vgs_legacy' }),
    });
    const startJson = await startRes.json();

    if (!startJson.ok) {
      const reasons = startJson.error?.data?.reasons ?? [];
      const reasonMsg = reasons.length > 0 ? reasons[0] : (startJson.error?.message ?? 'no reason given');
      setState({
        stage: 'error',
        policyDecision: startJson.error?.data ?? { decision: 'deny', reasons: [reasonMsg] },
        trace: [{ t: 0, msg: `Policy denied: ${reasonMsg}`, type: 'error' }],
      });
      toast.error(`Policy denied: ${reasonMsg}`);
      return;
    }

    setState((s) => ({
      ...s,
      stage: 'passkey',
      policyDecision: startJson.data.policyDecision,
      txId: startJson.data.txId,
      trace: [{ t: 0.1, msg: 'Policy evaluation: ALLOW', type: 'success' }],
    }));

    await new Promise((r) => setTimeout(r, 800));

    // Stage 2: Mock passkey auth
    setState((s) => ({
      ...s,
      stage: 'executing',
      trace: [
        ...s.trace,
        { t: 0.3, msg: 'Passkey mandate signed (mock assertion)', type: 'success' },
      ],
    }));

    // Stage 3: VGS execution
    const execRes = await fetch('/api/execution/legacy-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ txId: startJson.data.txId, amountCents, merchantUrl, vgsAlias: 'tok_5678901234' }),
    });
    const execJson = await execRes.json();

    if (execJson.ok) {
      const trace = execJson.data.trace as LogEntry[];
      // Animate trace entries
      for (let i = 0; i < trace.length; i++) {
        await new Promise((r) => setTimeout(r, 200 + trace[i].t * 300));
        setState((s) => ({ ...s, trace: [...s.trace, trace[i]] }));
      }
      setState((s) => ({
        ...s,
        stage: 'done',
        receipt: execJson.data.receipt,
      }));
      toast.success('Transaction completed');
    } else {
      setState((s) => ({
        ...s,
        stage: 'error',
        trace: [...s.trace, { t: 2, msg: 'Execution failed', type: 'error' }],
      }));
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <div className="text-xs font-mono text-[#94A3B8] mb-1">Scenario 04</div>
          <h1 className="text-2xl font-bold text-[#E2E8F0]">Legacy Checkout</h1>
          <p className="text-[#94A3B8] mt-1">Agent executes a purchase through a legacy checkout with VGS proxy protection.</p>
        </div>

        {/* Controls */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 mb-6 flex flex-wrap items-end gap-4">
          <div className="min-w-[220px]">
            <Label className="text-[#94A3B8] text-xs">Agent</Label>
            <Select value={agentId} onValueChange={(v) => setAgentId(v ?? agentId)}>
              <SelectTrigger data-tour-id="agent-selector" className="bg-[#0F172A] border-[#334155] text-[#E2E8F0] mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1E293B] border-[#334155]">
                {AGENTS.map((a) => (
                  <SelectItem key={a.id} value={a.id} className="text-[#E2E8F0]">{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[#94A3B8] text-xs">Amount ($)</Label>
            <Input
              data-tour-id="amount-input"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-[#0F172A] border-[#334155] text-[#E2E8F0] mt-1 w-32 font-mono"
            />
          </div>
          <Button
            data-tour-id="trigger-btn"
            onClick={trigger}
            disabled={state.stage !== 'idle' && state.stage !== 'done' && state.stage !== 'error'}
            className="bg-[#3B82F6] hover:bg-[#2563EB] flex items-center gap-2"
          >
            {state.stage === 'policy' || state.stage === 'passkey' || state.stage === 'executing' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Trigger Agent Purchase
          </Button>
          {(state.stage === 'done' || state.stage === 'error') && (
            <Button variant="ghost" onClick={() => setState({ stage: 'idle', trace: [] })} className="text-[#94A3B8]">
              Reset
            </Button>
          )}
        </div>

        {/* Predictive Insight */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-[#3B82F6]" />
            <span className="text-sm font-medium text-[#E2E8F0]">Predictive Insight</span>
            <span className="text-xs text-[#94A3B8]">— before execution</span>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[#94A3B8]">Brain prediction for ${amount || '0'} to {merchantUrl}:</span>
              {prediction === null ? (
                <span className="text-[#94A3B8] text-xs">Evaluating…</span>
              ) : prediction.decision === 'allow' ? (
                <span className="flex items-center gap-1 text-[#10B981]"><Check className="h-3 w-3" /> ALLOW</span>
              ) : (
                <span className="flex items-center gap-1 text-[#EF4444]"><AlertTriangle className="h-3 w-3" /> DENY</span>
              )}
              <span className="text-xs text-[#94A3B8]">via {selectedAgent.name} · vgs_legacy rail</span>
            </div>
            {prediction?.decision === 'deny' && prediction.reasons[0] && (
              <div className="font-mono text-xs text-[#EF4444] pl-1">{prediction.reasons[0]}</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mock checkout iframe */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl overflow-hidden">
            <div className="px-4 py-2 border-b border-[#334155] flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <div className="w-3 h-3 rounded-full bg-[#10B981]" />
              </div>
              <span className="text-xs text-[#94A3B8]">mock-vendor.example/checkout</span>
            </div>
            <iframe
              src="/mock-checkout/saas-vendor"
              className="w-full h-[400px] bg-gray-100"
              title="Mock Checkout"
            />
          </div>

          {/* Terminal */}
          <div className="space-y-4">
            <div data-tour-id="terminal-log">
              <TerminalLog entries={state.trace} />
            </div>

            {state.stage === 'done' && state.receipt && (
              <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-4 w-4 text-[#10B981]" />
                  <span className="font-semibold text-[#10B981]">Transaction Complete</span>
                </div>
                <div className="space-y-1 text-sm text-[#94A3B8]">
                  <div>Merchant: {state.receipt.merchant}</div>
                  <div>Amount: ${(state.receipt.amount / 100).toFixed(2)}</div>
                  <div>Time: {new Date(state.receipt.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            )}

            {state.policyDecision && (
              <div className={`rounded-xl p-4 border ${state.policyDecision.decision === 'allow' ? 'bg-[#10B981]/10 border-[#10B981]/30' : 'bg-[#EF4444]/10 border-[#EF4444]/30'}`}>
                <div className="text-xs text-[#94A3B8] mb-1">Policy Decision</div>
                <div className={`font-semibold ${state.policyDecision.decision === 'allow' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                  {state.policyDecision.decision.toUpperCase()}
                </div>
                {state.policyDecision.reasons.map((r, i) => (
                  <div key={i} className="font-mono text-xs text-[#94A3B8] mt-1">{r}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
