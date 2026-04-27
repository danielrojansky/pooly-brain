'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Settings, LogOut, Brain } from 'lucide-react';

export function NavBar() {
  const { data: session } = useSession();
  if (!session) return null;

  const navLinks = [
    { href: '/onboarding', label: 'Onboarding' },
    { href: '/treasury', label: 'Treasury' },
    { href: '/policy', label: 'Policy' },
    { href: '/execution', label: 'Execution' },
    { href: '/audit', label: 'Audit' },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-[#334155] bg-[#0F172A]/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#E2E8F0] font-semibold">
            <Brain className="h-5 w-5 text-[#3B82F6]" />
            Financial Brain
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-sm text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E293B] rounded-md transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/settings">
              <Button variant="ghost" size="icon" className="text-[#94A3B8] hover:text-[#E2E8F0]">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <Avatar className="h-7 w-7">
              <AvatarImage src={session.user?.image ?? ''} />
              <AvatarFallback className="text-xs bg-[#334155] text-[#E2E8F0]">
                {session.user?.name?.slice(0, 2).toUpperCase() ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="icon"
              className="text-[#94A3B8] hover:text-[#E2E8F0]"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
