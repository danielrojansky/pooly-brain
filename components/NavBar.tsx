'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Settings, LogOut, Brain, Menu, X } from 'lucide-react';
import { APP_VERSION } from '@/lib/version';

export function NavBar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

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
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 text-[#E2E8F0] font-semibold shrink-0">
            <Brain className="h-5 w-5 text-[#3B82F6]" />
            <span className="hidden sm:inline">Financial Brain</span>
            <span className="sm:hidden">Brain</span>
            <span className="text-xs font-normal text-[#475569] font-mono ml-1">v{APP_VERSION}</span>
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

          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/settings" aria-label="Settings">
              <Button variant="ghost" size="icon" className="text-[#94A3B8] hover:text-[#E2E8F0] h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <Avatar className="h-7 w-7 hidden sm:flex">
              <AvatarImage src={session.user?.image ?? ''} />
              <AvatarFallback className="text-xs bg-[#334155] text-[#E2E8F0]">
                {session.user?.name?.slice(0, 2).toUpperCase() ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sign out"
              className="text-[#94A3B8] hover:text-[#E2E8F0] h-8 w-8 hidden sm:inline-flex"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle menu"
              className="md:hidden text-[#94A3B8] hover:text-[#E2E8F0] h-8 w-8"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-[#334155] py-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E293B] rounded-md transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => { setMobileOpen(false); signOut({ callbackUrl: '/login' }); }}
              className="w-full text-left px-3 py-2 text-sm text-[#EF4444] hover:bg-[#1E293B] rounded-md transition-colors flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
