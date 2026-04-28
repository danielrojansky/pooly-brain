'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTour } from './TourProvider';

export function TourCursor() {
  const { active, step } = useTour();
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [highlight, setHighlight] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  useEffect(() => {
    if (!active || !step) {
      setPos(null);
      setHighlight(null);
      return;
    }
    const el = document.querySelector(`[data-tour-id="${step.targetId}"]`);
    if (el) {
      const rect = el.getBoundingClientRect();
      setPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      setHighlight({ x: rect.left, y: rect.top, w: rect.width, h: rect.height });
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setPos(null);
      setHighlight(null);
    }
  }, [active, step]);

  return (
    <AnimatePresence>
      {active && step && pos && (
        <>
          {highlight && (
            <motion.div
              key={`hl-${step.targetId}`}
              className="fixed pointer-events-none z-[9998] rounded-md border-2 border-[#3B82F6] shadow-[0_0_0_9999px_rgba(15,23,42,0.55)]"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                left: highlight.x - 4,
                top: highlight.y - 4,
                width: highlight.w + 8,
                height: highlight.h + 8,
              }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              style={{ position: 'fixed' }}
            />
          )}
          <motion.div
            key={`cur-${step.targetId}`}
            className="fixed pointer-events-none z-[9999]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ x: pos.x - 8, y: pos.y - 8, opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <div className="relative">
              {step.action.type === 'click' && (
                <motion.div
                  className="absolute -inset-2 rounded-full bg-[#3B82F6] opacity-50"
                  animate={{ scale: [1, 2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                />
              )}
              <div className="w-4 h-4 rounded-full bg-[#3B82F6] border-2 border-white shadow-lg" />
              <div className="absolute top-7 left-7 bg-[#1E293B] border border-[#3B82F6]/50 rounded-lg p-3 w-72 text-xs text-[#E2E8F0] shadow-2xl">
                <div className="font-semibold text-[#3B82F6] mb-1 text-[10px] font-mono uppercase tracking-wide">Tour step</div>
                {step.tooltip}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
