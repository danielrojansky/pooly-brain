'use client';
import { useEffect, useRef } from 'react';

export interface LogEntry {
  t: number;
  msg: string;
  type: 'info' | 'proxy' | 'success' | 'error';
}

const TYPE_CLASSES: Record<string, string> = {
  info: 'text-[#86EFAC]',
  proxy: 'text-[#67E8F9]',
  success: 'text-[#4ADE80]',
  error: 'text-[#EF4444]',
};

interface TerminalLogProps {
  entries: LogEntry[];
  label?: string;
}

export function TerminalLog({ entries, label = 'VGS Outbound Proxy' }: TerminalLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  return (
    <div className="bg-[#0A0F1A] border border-[#334155] rounded-lg overflow-hidden font-mono text-xs">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#334155] bg-[#0F172A]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
          <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
          <div className="w-3 h-3 rounded-full bg-[#10B981]" />
        </div>
        <span className="text-[#94A3B8] text-xs">{label}</span>
      </div>
      <div className="p-4 min-h-[200px] max-h-[400px] overflow-y-auto space-y-1">
        {entries.length === 0 && (
          <div className="text-[#334155]">Waiting for agent execution...</div>
        )}
        {entries.map((entry, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-[#334155] shrink-0">
              {entry.t.toFixed(1)}s
            </span>
            <span className={TYPE_CLASSES[entry.type] ?? 'text-[#E2E8F0]'}>
              {entry.type === 'proxy' ? '⟶ ' : ''}{entry.msg}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
