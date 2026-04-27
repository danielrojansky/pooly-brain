'use client';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTour } from './TourProvider';

export function TourCursor() {
  const { active, step } = useTour();
  const posRef = useRef({ x: 0, y: 0 });
  const [pos, setPos] = [posRef.current, (v: { x: number; y: number }) => {
    posRef.current = v;
  }];

  useEffect(() => {
    if (!active || !step) return;
    const el = document.querySelector(`[data-tour-id="${step.targetId}"]`);
    if (el) {
      const rect = el.getBoundingClientRect();
      setPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }
  }, [active, step]);

  return (
    <AnimatePresence>
      {active && step && (
        <motion.div
          key={step.targetId}
          className="fixed pointer-events-none z-[9999]"
          animate={{ x: posRef.current.x - 8, y: posRef.current.y - 8 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="relative">
            {step.action.type === 'click' && (
              <motion.div
                className="absolute inset-0 rounded-full bg-blue-400 opacity-50"
                animate={{ scale: [1, 2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
            )}
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg" />
            <div className="absolute top-6 left-6 bg-slate-900 border border-slate-600 rounded-lg p-3 w-64 text-xs text-slate-200 shadow-xl">
              {step.tooltip}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
