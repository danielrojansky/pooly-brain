'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrustBadge } from '@/components/TrustBadge';
import { Check, Loader2, Shield, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

interface FormValues {
  agentId: string;
  capability: string;
  provider: string;
  version: string;
  extension: string;
}

export default function OnboardingPage() {
  const [protocol, setProtocol] = useState('mcp');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [ansUri, setAnsUri] = useState('');
  const [trustBadge, setTrustBadge] = useState<'pending' | 'verified'>('pending');
  const [passkeyDone, setPasskeyDone] = useState(false);

  const { register, watch, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      agentId: 'shoppingAgent',
      capability: 'retail',
      provider: 'acme',
      version: 'v1.0.0',
      extension: 'example.com',
    },
  });

  const values = watch();
  const liveUri = `${protocol}://${values.agentId || '<agentId>'}.${values.capability || '<capability>'}.${values.provider || '<provider>'}.${values.version || '<version>'}.${values.extension || '<extension>'}`;

  async function onRegister(data: FormValues) {
    setLoading(true);
    try {
      const res = await fetch('/api/agent/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocol, ...data }),
      });
      const json = await res.json();
      if (json.ok) {
        setAnsUri(json.data.ansUri);
        setStep(2);
        toast.success('Agent registered');
      } else {
        toast.error(json.error?.message ?? 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  }

  async function verifyDomain() {
    setLoading(true);
    try {
      const res = await fetch('/api/agent/verify-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: values.agentId }),
      });
      const json = await res.json();
      if (json.ok) {
        setTrustBadge('verified');
        setStep(3);
        toast.success('Domain verified');
      }
    } finally {
      setLoading(false);
    }
  }

  async function createPasskey() {
    setLoading(true);
    try {
      // In mock mode, simulate passkey creation
      const optRes = await fetch('/api/passkey/registration-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo@example.com' }),
      });
      const { data: options } = await optRes.json();
      if (!options) throw new Error('No options');

      // Verify (mock)
      const verRes = await fetch('/api/passkey/registration-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: {}, expectedChallenge: options.challenge }),
      });
      const json = await verRes.json();
      if (json.ok) {
        setPasskeyDone(true);
        toast.success('Passkey bound to agent');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="text-xs font-mono text-[#94A3B8] mb-1">Scenario 01</div>
          <h1 className="text-2xl font-bold text-[#E2E8F0]">KYA Onboarding</h1>
          <p className="text-[#94A3B8] mt-1">Register an agent with a verifiable ANS URI and bind a WebAuthn passkey.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: ANS URI visualization */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-[#E2E8F0]">ANS URI Preview</h2>
            <div className="bg-[#0F172A] rounded-lg p-4">
              <div className="font-mono text-sm text-[#E2E8F0] break-all">{liveUri}</div>
            </div>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Protocol', value: protocol, color: 'text-[#3B82F6]' },
                { label: 'Agent ID', value: values.agentId, color: 'text-[#10B981]' },
                { label: 'Capability', value: values.capability, color: 'text-[#F59E0B]' },
                { label: 'Provider', value: values.provider, color: 'text-[#EF4444]' },
                { label: 'Version', value: values.version, color: 'text-[#94A3B8]' },
                { label: 'Extension', value: values.extension, color: 'text-[#94A3B8]' },
              ].map((part) => (
                <div key={part.label} className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">{part.label}</span>
                  <span className={`font-mono ${part.color}`}>{part.value || '—'}</span>
                </div>
              ))}
            </div>

            {ansUri && (
              <div className="pt-4 border-t border-[#334155]">
                <div className="text-xs text-[#94A3B8] mb-2">Registered ANS URI</div>
                <TrustBadge ansUri={ansUri} status={trustBadge} />
              </div>
            )}
          </div>

          {/* Right: Steps */}
          <div className="space-y-4">
            {/* Step 1 */}
            <div className={`bg-[#1E293B] border rounded-xl p-6 transition-opacity ${step > 1 ? 'opacity-60' : ''} ${step === 1 ? 'border-[#3B82F6]' : 'border-[#334155]'}`}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step > 1 ? 'bg-[#10B981]' : 'bg-[#3B82F6]'}`}>
                  {step > 1 ? <Check className="h-3 w-3 text-white" /> : '1'}
                </div>
                <span className="font-semibold text-[#E2E8F0]">Register Agent</span>
              </div>
              <form onSubmit={handleSubmit(onRegister)} className="space-y-3">
                <div>
                  <Label className="text-[#94A3B8] text-xs">Protocol</Label>
                  <Select value={protocol} onValueChange={(v) => setProtocol(v ?? 'mcp')}>
                    <SelectTrigger data-tour-id="protocol-select" className="bg-[#0F172A] border-[#334155] text-[#E2E8F0] mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E293B] border-[#334155]">
                      <SelectItem value="mcp">mcp://</SelectItem>
                      <SelectItem value="a2a">a2a://</SelectItem>
                      <SelectItem value="acp">acp://</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[#94A3B8] text-xs">Agent ID</Label>
                    <Input data-tour-id="agent-id-input" {...register('agentId')} className="bg-[#0F172A] border-[#334155] text-[#E2E8F0] mt-1 font-mono text-sm" />
                  </div>
                  <div>
                    <Label className="text-[#94A3B8] text-xs">Capability</Label>
                    <Input data-tour-id="capability-input" {...register('capability')} className="bg-[#0F172A] border-[#334155] text-[#E2E8F0] mt-1 font-mono text-sm" />
                  </div>
                  <div>
                    <Label className="text-[#94A3B8] text-xs">Provider</Label>
                    <Input data-tour-id="provider-input" {...register('provider')} className="bg-[#0F172A] border-[#334155] text-[#E2E8F0] mt-1 font-mono text-sm" />
                  </div>
                  <div>
                    <Label className="text-[#94A3B8] text-xs">Version</Label>
                    <Input {...register('version')} className="bg-[#0F172A] border-[#334155] text-[#E2E8F0] mt-1 font-mono text-sm" />
                  </div>
                </div>
                <div>
                  <Label className="text-[#94A3B8] text-xs">Extension</Label>
                  <Input {...register('extension')} className="bg-[#0F172A] border-[#334155] text-[#E2E8F0] mt-1 font-mono text-sm" />
                </div>
                <Button type="submit" disabled={loading || step > 1} className="w-full bg-[#3B82F6] hover:bg-[#2563EB]">
                  {loading && step === 1 ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Register Agent
                </Button>
              </form>
            </div>

            {/* Step 2 */}
            <div className={`bg-[#1E293B] border rounded-xl p-6 transition-opacity ${step < 2 ? 'opacity-40' : ''} ${step === 2 ? 'border-[#3B82F6]' : 'border-[#334155]'}`}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step > 2 ? 'bg-[#10B981]' : step === 2 ? 'bg-[#3B82F6]' : 'bg-[#334155]'}`}>
                  {step > 2 ? <Check className="h-3 w-3 text-white" /> : '2'}
                </div>
                <span className="font-semibold text-[#E2E8F0]">Verify Domain</span>
              </div>
              <p className="text-sm text-[#94A3B8] mb-4">
                GoDaddy ANS runs a DNS-01 challenge to verify domain ownership.
              </p>
              <Button
                data-tour-id="verify-domain-btn"
                onClick={verifyDomain}
                disabled={step !== 2 || loading}
                className="w-full bg-[#10B981] hover:bg-[#059669] flex items-center gap-2"
              >
                {loading && step === 2 ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                Verify Domain via DNS-01
              </Button>
            </div>

            {/* Step 3 */}
            <div className={`bg-[#1E293B] border rounded-xl p-6 transition-opacity ${step < 3 ? 'opacity-40' : ''} ${step === 3 && !passkeyDone ? 'border-[#3B82F6]' : 'border-[#334155]'}`}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${passkeyDone ? 'bg-[#10B981]' : step === 3 ? 'bg-[#3B82F6]' : 'bg-[#334155]'}`}>
                  {passkeyDone ? <Check className="h-3 w-3 text-white" /> : '3'}
                </div>
                <span className="font-semibold text-[#E2E8F0]">Create Passkey</span>
              </div>
              <p className="text-sm text-[#94A3B8] mb-4">
                Bind a hardware passkey to this agent. Every transaction requires a fresh signature.
              </p>
              <Button
                data-tour-id="create-passkey-btn"
                onClick={createPasskey}
                disabled={step !== 3 || loading || passkeyDone}
                className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-black flex items-center gap-2"
              >
                {loading && step === 3 ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                {passkeyDone ? 'Passkey Bound' : 'Create Passkey'}
              </Button>
              {passkeyDone && (
                <div className="mt-3 text-sm text-[#10B981] flex items-center gap-2">
                  <Check className="h-4 w-4" /> Agent fully onboarded
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
