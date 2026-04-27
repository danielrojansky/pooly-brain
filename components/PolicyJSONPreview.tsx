'use client';

interface PolicyJSONPreviewProps {
  data: Record<string, unknown>;
}

function colorize(json: string): string {
  return json
    .replace(/("[\w\s]+")\s*:/g, '<span class="text-[#93C5FD]">$1</span>:')
    .replace(/:\s*(".*?")/g, ': <span class="text-[#86EFAC]">$1</span>')
    .replace(/:\s*(\d+)/g, ': <span class="text-[#FCA5A5]">$1</span>')
    .replace(/:\s*(true|false|null)/g, ': <span class="text-[#F59E0B]">$1</span>');
}

export function PolicyJSONPreview({ data }: PolicyJSONPreviewProps) {
  const json = JSON.stringify(data, null, 2);
  const colorized = colorize(json);
  return (
    <pre
      className="bg-[#0F172A] border border-[#334155] rounded-lg p-4 text-xs font-mono text-[#E2E8F0] overflow-auto max-h-96 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: colorized }}
    />
  );
}
