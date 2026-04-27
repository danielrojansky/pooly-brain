'use client';
import { useTour } from '@/lib/tour/TourProvider';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, X } from 'lucide-react';

export function TourFAB() {
  const { state, start, pause, resume, exit, next } = useTour();

  if (state === 'idle' || state === 'done') {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={start}
          className="bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-lg rounded-full px-5 py-2.5"
        >
          <Play className="h-4 w-4 mr-2" />
          Walk Me Through This Demo
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#1E293B] border border-[#334155] rounded-full px-3 py-2 shadow-xl">
      {state === 'running' ? (
        <Button variant="ghost" size="sm" onClick={pause} className="text-[#94A3B8] hover:text-[#E2E8F0]">
          <Pause className="h-4 w-4" />
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={resume} className="text-[#94A3B8] hover:text-[#E2E8F0]">
          <Play className="h-4 w-4" />
        </Button>
      )}
      <Button variant="ghost" size="sm" onClick={next} className="text-[#94A3B8] hover:text-[#E2E8F0]">
        <SkipForward className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={exit} className="text-[#94A3B8] hover:text-[#EF4444]">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
