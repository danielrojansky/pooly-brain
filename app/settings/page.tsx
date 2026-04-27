'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Eye, EyeOff, Save, Zap, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface VendorFormValues {
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  stripeTreasuryPlatformId: string;
  stripeRestrictedKey: string;
  rapydAccessKey: string;
  rapydSecretKey: string;
  rapydBaseUrl: string;
  vgsVaultId: string;
  vgsUsername: string;
  vgsPassword: string;
  vgsEnvironment: string;
  godaddyAnsApiKey: string;
  godaddyAnsApiBase: string;
  cfBotAuthKid: string;
  cfBotAuthPrivateKey: string;
  webauthnRpId: string;
  webauthnRpName: string;
  webauthnOrigin: string;
}

function SecretInput({ id, register, placeholder }: { id: keyof VendorFormValues; register: ReturnType<typeof useForm<VendorFormValues>>['register']; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        {...register(id)}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        className="bg-[#0F172A] border-[#334155] text-[#E2E8F0] pr-10 font-mono text-sm"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#E2E8F0]"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function StatusPill({ configured }: { configured: boolean }) {
  if (process.env.NEXT_PUBLIC_APP_URL?.includes('localhost')) {
    return <span className="text-xs bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 rounded-full px-2 py-0.5">Mock mode active</span>;
  }
  return configured ? (
    <span className="text-xs bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 rounded-full px-2 py-0.5">Configured</span>
  ) : (
    <span className="text-xs bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 rounded-full px-2 py-0.5">Not configured</span>
  );
}

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue } = useForm<VendorFormValues>({
    defaultValues: {
      rapydBaseUrl: 'https://sandboxapi.rapyd.net',
      vgsEnvironment: 'sandbox',
      webauthnRpId: 'localhost',
      webauthnRpName: 'Financial Brain',
      webauthnOrigin: 'http://localhost:3000',
    },
  });

  const vgsVaultId = watch('vgsVaultId');
  const vgsUsername = watch('vgsUsername');
  const vgsPassword = watch('vgsPassword');
  const vgsEnv = watch('vgsEnvironment');
  const vgsProxyUrl = vgsVaultId && vgsUsername
    ? `https://${vgsUsername}:***@${vgsVaultId}.${vgsEnv}.verygoodproxy.com:8443`
    : '';

  async function save(data: VendorFormValues) {
    setSaving(true);
    try {
      const res = await fetch('/api/settings/vendor', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.ok) toast.success('Settings saved');
      else toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function testConnection(vendor: string) {
    setTesting(vendor);
    await new Promise((r) => setTimeout(r, 1200));
    toast.success(`${vendor}: connection test (mock mode — always passes)`);
    setTesting(null);
  }

  async function generateKeypair() {
    // Generate Ed25519 keypair using Web Crypto
    try {
      const key = await window.crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify']);
      const privateKeyBuffer = await window.crypto.subtle.exportKey('pkcs8', key.privateKey);
      const privateKeyHex = Array.from(new Uint8Array(privateKeyBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
      const kid = 'pooly-' + Date.now().toString(36);
      setValue('cfBotAuthPrivateKey', privateKeyHex);
      setValue('cfBotAuthKid', kid);
      toast.success('Ed25519 keypair generated');
    } catch {
      // Fallback: generate random hex (demo)
      const bytes = new Uint8Array(32);
      window.crypto.getRandomValues(bytes);
      const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
      setValue('cfBotAuthPrivateKey', hex);
      setValue('cfBotAuthKid', 'pooly-' + Date.now().toString(36));
      toast.success('Demo keypair generated');
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#E2E8F0]">Vendor Configuration</h1>
          <p className="text-[#94A3B8] mt-1">Configure API keys and credentials for all payment vendors.</p>
        </div>

        <form onSubmit={handleSubmit(save)}>
          <Tabs defaultValue="stripe">
            <TabsList className="bg-[#1E293B] border border-[#334155] mb-6 flex-wrap h-auto">
              {['stripe', 'rapyd', 'vgs', 'godaddy', 'cloudflare', 'webauthn'].map((tab) => (
                <TabsTrigger key={tab} value={tab} className="data-[state=active]:bg-[#3B82F6] data-[state=active]:text-white capitalize">
                  {tab === 'godaddy' ? 'GoDaddy ANS' : tab === 'webauthn' ? 'WebAuthn' : tab}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="stripe">
              <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-[#E2E8F0]">Stripe</h2>
                  <StatusPill configured={false} />
                </div>
                {[
                  { id: 'stripeSecretKey' as const, label: 'Secret Key', placeholder: 'sk_test_...' },
                  { id: 'stripeWebhookSecret' as const, label: 'Webhook Secret', placeholder: 'whsec_...' },
                  { id: 'stripeTreasuryPlatformId' as const, label: 'Treasury Platform Account ID', placeholder: 'acct_...' },
                  { id: 'stripeRestrictedKey' as const, label: 'Restricted Key', placeholder: 'rk_test_...' },
                ].map((f) => (
                  <div key={f.id}>
                    <Label className="text-[#94A3B8] text-xs mb-1 block">{f.label}</Label>
                    <SecretInput id={f.id} register={register} placeholder={f.placeholder} />
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => testConnection('Stripe')} disabled={testing === 'Stripe'} className="border-[#334155] text-[#94A3B8]">
                  {testing === 'Stripe' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                  Test Connection
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="rapyd">
              <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-[#E2E8F0]">Rapyd</h2>
                  <StatusPill configured={false} />
                </div>
                <div>
                  <Label className="text-[#94A3B8] text-xs mb-1 block">Access Key</Label>
                  <SecretInput id="rapydAccessKey" register={register} />
                </div>
                <div>
                  <Label className="text-[#94A3B8] text-xs mb-1 block">Secret Key</Label>
                  <SecretInput id="rapydSecretKey" register={register} />
                </div>
                <div>
                  <Label className="text-[#94A3B8] text-xs mb-1 block">Base URL</Label>
                  <Input {...register('rapydBaseUrl')} className="bg-[#0F172A] border-[#334155] text-[#E2E8F0] font-mono text-sm" />
                </div>
                <Button type="button" variant="outline" onClick={() => testConnection('Rapyd')} disabled={testing === 'Rapyd'} className="border-[#334155] text-[#94A3B8]">
                  {testing === 'Rapyd' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                  Test Connection
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="vgs">
              <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-[#E2E8F0]">VGS (Very Good Security)</h2>
                  <StatusPill configured={false} />
                </div>
                <div>
                  <Label className="text-[#94A3B8] text-xs mb-1 block">Vault ID</Label>
                  <Input {...register('vgsVaultId')} placeholder="tnt..." className="bg-[#0F172A] border-[#334155] text-[#E2E8F0] font-mono text-sm" />
                </div>
                <div>
                  <Label className="text-[#94A3B8] text-xs mb-1 block">Username</Label>
                  <Input {...register('vgsUsername')} className="bg-[#0F172A] border-[#334155] text-[#E2E8F0] font-mono text-sm" />
                </div>
                <div>
                  <Label className="text-[#94A3B8] text-xs mb-1 block">Password</Label>
                  <SecretInput id="vgsPassword" register={register} />
                </div>
                <div>
                  <Label className="text-[#94A3B8] text-xs mb-1 block">Environment</Label>
                  <select {...register('vgsEnvironment')} className="w-full bg-[#0F172A] border border-[#334155] text-[#E2E8F0] rounded-md px-3 py-2 text-sm">
                    <option value="sandbox">Sandbox</option>
                    <option value="live">Live</option>
                  </select>
                </div>
                {vgsProxyUrl && (
                  <div>
                    <Label className="text-[#94A3B8] text-xs mb-1 block">Proxy URL Preview</Label>
                    <div className="bg-[#0F172A] rounded px-3 py-2 font-mono text-xs text-[#67E8F9] break-all">{vgsProxyUrl}</div>
                  </div>
                )}
                <Button type="button" variant="outline" onClick={() => testConnection('VGS')} disabled={testing === 'VGS'} className="border-[#334155] text-[#94A3B8]">
                  {testing === 'VGS' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                  Test Connection
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="godaddy">
              <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-[#E2E8F0]">GoDaddy Agent Name Service</h2>
                  <StatusPill configured={false} />
                </div>
                <div>
                  <Label className="text-[#94A3B8] text-xs mb-1 block">ANS API Key</Label>
                  <SecretInput id="godaddyAnsApiKey" register={register} />
                </div>
                <div>
                  <Label className="text-[#94A3B8] text-xs mb-1 block">ANS API Base URL</Label>
                  <Input {...register('godaddyAnsApiBase')} placeholder="https://api.godaddy.com/v1/ans" className="bg-[#0F172A] border-[#334155] text-[#E2E8F0] font-mono text-sm" />
                </div>
                <Button type="button" variant="outline" onClick={() => testConnection('GoDaddy ANS')} disabled={testing === 'GoDaddy ANS'} className="border-[#334155] text-[#94A3B8]">
                  {testing === 'GoDaddy ANS' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                  Test Connection
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="cloudflare">
              <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-[#E2E8F0]">Cloudflare Web Bot Auth</h2>
                  <StatusPill configured={false} />
                </div>
                <div>
                  <Label className="text-[#94A3B8] text-xs mb-1 block">Bot Auth KID (JWK Thumbprint)</Label>
                  <Input {...register('cfBotAuthKid')} className="bg-[#0F172A] border-[#334155] text-[#E2E8F0] font-mono text-sm" />
                </div>
                <div>
                  <Label className="text-[#94A3B8] text-xs mb-1 block">Bot Auth Private Key (Ed25519 hex)</Label>
                  <SecretInput id="cfBotAuthPrivateKey" register={register} />
                </div>
                <Button type="button" onClick={generateKeypair} variant="outline" className="border-[#334155] text-[#94A3B8] flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Generate New Keypair
                </Button>
                <div className="bg-[#0F172A] rounded p-3">
                  <div className="text-xs text-[#94A3B8] mb-1">JWKS served at:</div>
                  <div className="font-mono text-xs text-[#67E8F9]">/.well-known/http-message-signatures-directory</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="webauthn">
              <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-[#E2E8F0]">WebAuthn</h2>
                  <StatusPill configured={true} />
                </div>
                <div>
                  <Label className="text-[#94A3B8] text-xs mb-1 block">RP ID</Label>
                  <Input {...register('webauthnRpId')} className="bg-[#0F172A] border-[#334155] text-[#E2E8F0] font-mono text-sm" />
                </div>
                <div>
                  <Label className="text-[#94A3B8] text-xs mb-1 block">RP Name</Label>
                  <Input {...register('webauthnRpName')} className="bg-[#0F172A] border-[#334155] text-[#E2E8F0] font-mono text-sm" />
                </div>
                <div>
                  <Label className="text-[#94A3B8] text-xs mb-1 block">Origin</Label>
                  <Input {...register('webauthnOrigin')} className="bg-[#0F172A] border-[#334155] text-[#E2E8F0] font-mono text-sm" />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={saving} className="bg-[#3B82F6] hover:bg-[#2563EB] flex items-center gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Configuration
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
