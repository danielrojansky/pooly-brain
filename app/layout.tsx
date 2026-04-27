import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SessionProviderWrapper } from '@/components/SessionProviderWrapper';
import { NavBarWrapper } from '@/components/NavBarWrapper';
import { TourProvider } from '@/lib/tour/TourProvider';
import { TourFAB } from '@/components/TourFAB';
import { TourCursor } from '@/lib/tour/Cursor';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Financial Brain — The Financial Brain for Agentic Commerce',
  description: 'AI agent payment middleware — investor demo',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} dark h-full`}
    >
      <body className="min-h-full bg-[#0F172A] text-[#E2E8F0] antialiased">
        <SessionProviderWrapper>
          <TourProvider>
            <NavBarWrapper />
            <main>{children}</main>
            <TourFAB />
            <TourCursor />
          </TourProvider>
        </SessionProviderWrapper>
        <Toaster />
      </body>
    </html>
  );
}
