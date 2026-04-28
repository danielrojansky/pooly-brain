'use client';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { PolicyJSONPreview } from '@/components/PolicyJSONPreview';
import { Loader2, Plus, X, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface FormValues {
  agentId: string;
  maxPerTxCents: string;
  maxDailyCents: string;
  priority: string;
}

interface EvalResult {
  decision: 'allow' | 'deny';
  reasons: string[];
  policyVersion?: string;
}

export default function PolicyPage() {
  const [merchants, setMerchants] = useState<string[]>(['*.aws.amazon.com', '*.stripe.com']);
  const [merchantInput, setMerchantInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [configHash, setConfigHash] = useState('');
  const [evalMerchant, setEvalMerchant] = useState('aws.amazon.com/s3');
  const [evalAmount, setEvalAmount] = useState('29900');
  const [evalResult, setEvalResult] = useState<EvalResult | null>(null);
  const [evalLoading, setEvalLoading] = useState(false);

  const { register, control, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      agentId: 'a1b2c3d4-0000-0000-0000-000000000001',
      maxPerTxCents: '50000',
      maxDailyCents: '500000',
      priority: 'high',
    },
  });

  const values = useWatch({ control });

  const policyPreview = {
    agentId: values.agentId,
    limits: {
      maxPerTxCents: parseInt(values.maxPerTxCents ?? '0'),
      maxDailyCents: parseInt(values.maxDailyCents ?? '0'),
    },
    merchantAllowlist: merchants,
    priority: values.priority,
  };

  function addMerchant() {
    if (merchantInput && !merchants.includes(merchantInput)) {
      setMerchants([...merchants, merchantInput]);
      setMerchantInput('');
    }
  }

  async function deployPolicy(data: FormValues) {
    setLoading(true);
    try {
      const res = await fetch('/api/policy/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: data.agentId,
          maxPerTxCents: parseInt(data.maxPerTxCents),
          maxDailyCents: parseInt(data.maxDailyCents),
          merchantAllowlist: merchants,
          priority: data.priority,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setConfigHash(json.data.configHash);
        toast.success('Policy deployed');
      } else {
        toast.error(json.error?.message ?? 'Deployment failed');
      }
    } catch {
      toast.error('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  }

  async function testEvaluation() {
    setEvalLoading(true);
    try {
      const res = await fetch('/api/policy/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: values.agentId,
          amountCents: parseInt(evalAmount),
          merchantUrl: evalMerchant,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setEvalResult(json.data);
      } else {
        // Evaluate route returns 403 with error.data on deny
        if (json.error?.data) {
          setEvalResult(json.error.data);
        } else {
          toast.error(json.error?.message ?? 'Evaluation failed');
        }
      }
    } catch {
      toast.error('Network error');
    } finally {
      setEvalLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="text-xs font-mono text-[#94A3B8] mb-1">Scenario 03</div>
          <h1 className="text-2xl font-bold text-[#E2E8F0]">Policy Engine</h1>
          <p className="text-[#94A3B8] mt-1">Define and deploy spending policies with merchant allowlists.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Rule Builder */}
          <div className="space-y-4">
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6">
              <h2 className="font-semibold text-[#E2E8F0] mb-4">Rule Builder</h2>
              <form onSubmit={handleSubmit(deployPolicy)} className="space-y-4">
                <div>
                  <Label className="text-[#94A3B8] text-xs">Agent ID</Label>
                  <Input {...register('agentId')} className="bg-[#0F172A] border-[#334155] text-[#E2E8F0] mt-1 font-mono text-sm" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#94A3B8] text-xs">Max Per Tx (cents)</Label>
                    <Input
                      data-tour-id="max-per-tx-input"
                      type="number"
                      {...register('maxPerTxCents')}
                      className="bg-[#0F172A] border-[#334155] text-[#E2E8F0] mt-1 font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-[#94A3B8] text-xs">Max Daily (cents)</Label>
                    <Input
                      type="number"
                      {...register('maxDailyCents')}
                      className="bg-[#0F172A] border-[#334155] text-[#E2E8F0] mt-1 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[#94A3B8] text-xs mb-2 block">Merchant Allowlist</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      data-tour-id="merchant-allowlist-input"
                      value={merchantInput}
                      onChange={(e) => setMerchantInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMerchant())}
                      placeholder="*.example.com"
                      className="bg-[#0F172A] border-[#334155] text-[#E2E8F0] font-mono text-sm"
                    />
                    <Button type="button" onClick={addMerchant} size="icon" className="bg-[#334155]">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {merchants.map((m) => (
                      <Badge key={m} variant="secondary" className="bg-[#0F172A] text-[#94A3B8] font-mono text-xs">
                        {m}
                        <button type="button" onClick={() => setMerchants(merchants.filter((x) => x !== m))} className="ml-1 hover:text-[#EF4444]">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-[#94A3B8] text-xs mb-2 block">Priority</Label>
                  <RadioGroup {...register('priority')} defaultValue="high" className="flex gap-4">
                    {['low', 'normal', 'high', 'critical'].map((p) => (
                      <div key={p} className="flex items-center gap-1.5">
                        <RadioGroupItem data-tour-id={`priority-${p}`} value={p} id={`priority-${p}`} className="border-[#334155]" />
                        <Label htmlFor={`priority-${p}`} className="text-[#94A3B8] text-sm capitalize cursor-pointer">{p}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <Button
                  data-tour-id="deploy-policy-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#3B82F6] hover:bg-[#2563EB]"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Deploy Policy
                </Button>

                {configHash && (
                  <div className="bg-[#0F172A] rounded-lg p-3">
                    <div className="text-xs text-[#94A3B8] mb-1">Config Hash (SHA-256)</div>
                    <div className="font-mono text-xs text-[#10B981]">{configHash}</div>
                  </div>
                )}
              </form>
            </div>

            {/* Evaluation */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6">
              <h2 className="font-semibold text-[#E2E8F0] mb-4">Test Evaluation</h2>
              <div className="space-y-3">
                <div>
                  <Label className="text-[#94A3B8] text-xs">Merchant URL</Label>
                  <Input
                    value={evalMerchant}
                    onChange={(e) => setEvalMerchant(e.target.value)}
                    className="bg-[#0F172A] border-[#334155] text-[#E2E8F0] mt-1 font-mono text-sm"
                  />
                </div>
                <div>
                  <Label className="text-[#94A3B8] text-xs">Amount (cents)</Label>
                  <Input
                    type="number"
                    value={evalAmount}
                    onChange={(e) => setEvalAmount(e.target.value)}
                    className="bg-[#0F172A] border-[#334155] text-[#E2E8F0] mt-1 font-mono"
                  />
                </div>
                <Button
                  onClick={testEvaluation}
                  disabled={evalLoading}
                  className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white"
                >
                  {evalLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Evaluate
                </Button>
                {evalResult && (
                  <div className={`rounded-lg p-4 border ${evalResult.decision === 'allow' ? 'bg-[#10B981]/10 border-[#10B981]/30' : 'bg-[#EF4444]/10 border-[#EF4444]/30'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {evalResult.decision === 'allow' ? (
                        <Check className="h-4 w-4 text-[#10B981]" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
                      )}
                      <span className={`font-semibold text-sm ${evalResult.decision === 'allow' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {evalResult.decision.toUpperCase()}
                      </span>
                    </div>
                    {evalResult.reasons.map((r, i) => (
                      <div key={i} className="font-mono text-xs text-[#94A3B8]">{r}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* JSON Preview */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6">
            <h2 className="font-semibold text-[#E2E8F0] mb-4">Live Policy JSON</h2>
            <PolicyJSONPreview data={policyPreview} />
          </div>
        </div>
      </div>
    </div>
  );
}
