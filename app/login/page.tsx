'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signIn('credentials', { email, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError('Invalid email. Please try again.');
    } else {
      router.push('/');
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-10 w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="bg-[#3B82F6]/10 rounded-full p-4">
              <Brain className="h-8 w-8 text-[#3B82F6]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#E2E8F0]">Financial Brain</h1>
          <p className="text-[#94A3B8] text-sm">The Financial Brain for Agentic Commerce</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-[#94A3B8]" htmlFor="email">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="bg-[#0F172A] border-[#334155] text-[#E2E8F0] placeholder:text-[#475569]"
              autoFocus
            />
          </div>

          {error && <p className="text-sm text-[#EF4444]">{error}</p>}

          <Button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
            size="lg"
          >
            {loading ? 'Signing in…' : 'Continue →'}
          </Button>
        </form>

        <p className="text-xs text-center text-[#475569]">
          Demo — enter any email to access
        </p>
      </div>
    </div>
  );
}
