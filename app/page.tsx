'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Brain, ArrowRight, Zap, Shield, Cpu, BarChart3 } from 'lucide-react';

const scenarios = [
  {
    num: '01',
    title: 'KYA Onboarding',
    desc: 'Register an agent with a verifiable ANS URI and bind a WebAuthn passkey.',
    href: '/onboarding',
    icon: <Cpu className="h-5 w-5 text-[#3B82F6]" />,
  },
  {
    num: '02',
    title: 'Wallet Farm',
    desc: 'Deploy 500 agent wallets across Stripe, Rapyd, and VGS rails.',
    href: '/treasury',
    icon: <BarChart3 className="h-5 w-5 text-[#10B981]" />,
  },
  {
    num: '03',
    title: 'Policy Engine',
    desc: 'Build and deploy spending policies with merchant allowlists and spend limits.',
    href: '/policy',
    icon: <Shield className="h-5 w-5 text-[#F59E0B]" />,
  },
  {
    num: '04',
    title: 'Legacy Checkout',
    desc: 'Watch an agent purchase through a legacy checkout with VGS proxy protection.',
    href: '/execution',
    icon: <Zap className="h-5 w-5 text-[#EF4444]" />,
  },
];

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-full px-4 py-1.5 text-sm text-[#3B82F6] mb-6">
            <Brain className="h-4 w-4" />
            Investor Demo · Mock Mode Active
          </div>
          <h1 className="text-5xl font-bold text-[#E2E8F0] mb-4">Financial Brain</h1>
          <p className="text-xl text-[#94A3B8] max-w-2xl mx-auto">
            The Financial Brain for Agentic Commerce. AI agent payment middleware
            that routes, policies, and secures autonomous transactions.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/onboarding">
              <Button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-8 py-3 text-base">
                Launch Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            {!session && (
              <Link href="/login">
                <Button variant="outline" className="border-[#334155] text-[#E2E8F0] hover:bg-[#1E293B] px-8 py-3 text-base">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scenarios.map((s) => (
            <Link key={s.num} href={s.href}>
              <div className="group bg-[#1E293B] border border-[#334155] rounded-xl p-6 hover:border-[#3B82F6]/50 transition-all hover:bg-[#1E293B]/80 cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#0F172A] rounded-lg p-2">{s.icon}</div>
                    <div>
                      <div className="text-xs font-mono text-[#94A3B8]">Scenario {s.num}</div>
                      <div className="font-semibold text-[#E2E8F0]">{s.title}</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#334155] group-hover:text-[#3B82F6] transition-colors" />
                </div>
                <p className="text-sm text-[#94A3B8]">{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/audit">
            <Button variant="ghost" className="text-[#94A3B8] hover:text-[#E2E8F0]">
              View Transaction Audit Log
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
