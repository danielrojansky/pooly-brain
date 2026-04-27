'use client';
import { useSession } from 'next-auth/react';
import { NavBar } from './NavBar';

export function NavBarWrapper() {
  const { data: session } = useSession();
  if (!session) return null;
  return <NavBar />;
}
