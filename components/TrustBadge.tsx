'use client';
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface TrustBadgeProps {
  ansUri: string;
  status?: 'verified' | 'pending';
}

export function TrustBadge({ ansUri, status = 'verified' }: TrustBadgeProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(ansUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-mono border ${
        status === 'verified'
          ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
          : 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]'
      }`}
    >
      {status === 'verified' ? (
        <Check className="h-3 w-3 shrink-0" />
      ) : (
        <span className="h-3 w-3 shrink-0 rounded-full border-2 border-current inline-block" />
      )}
      <span className="max-w-[300px] truncate">{ansUri}</span>
      <button onClick={copy} className="opacity-60 hover:opacity-100 transition-opacity">
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </button>
    </div>
  );
}
