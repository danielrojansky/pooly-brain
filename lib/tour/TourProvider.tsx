'use client';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { TOUR_STEPS, TourStep } from './script';

type TourState = 'idle' | 'running' | 'paused' | 'done';

interface TourContextValue {
  active: boolean;
  state: TourState;
  step: TourStep | null;
  stepIndex: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  exit: () => void;
  next: () => void;
}

const TourContext = createContext<TourContextValue>({
  active: false,
  state: 'idle',
  step: null,
  stepIndex: 0,
  start: () => {},
  pause: () => {},
  resume: () => {},
  exit: () => {},
  next: () => {},
});

export function TourProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TourState>('idle');
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const saved = sessionStorage.getItem('tour_step');
    if (saved) setStepIndex(parseInt(saved, 10));
  }, []);

  useEffect(() => {
    if (state === 'running') {
      sessionStorage.setItem('tour_step', String(stepIndex));
    }
  }, [state, stepIndex]);

  const start = useCallback(() => {
    setStepIndex(0);
    setState('running');
  }, []);

  const pause = useCallback(() => setState('paused'), []);

  const resume = useCallback(() => setState('running'), []);

  const exit = useCallback(() => {
    setState('idle');
    setStepIndex(0);
    sessionStorage.removeItem('tour_step');
  }, []);

  const next = useCallback(() => {
    setStepIndex((i) => {
      const next = i + 1;
      if (next >= TOUR_STEPS.length) {
        setState('done');
        return i;
      }
      return next;
    });
  }, []);

  const step = state === 'running' || state === 'paused' ? (TOUR_STEPS[stepIndex] ?? null) : null;

  useEffect(() => {
    if (state !== 'running' || !step) return;
    const dwellMs = step.dwellMs ?? 2500;
    const t = setTimeout(() => {
      setStepIndex((i) => {
        const n = i + 1;
        if (n >= TOUR_STEPS.length) {
          setState('done');
          return i;
        }
        return n;
      });
    }, dwellMs);
    return () => clearTimeout(t);
  }, [state, step, stepIndex]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && (state === 'running' || state === 'paused')) {
        setState('idle');
        setStepIndex(0);
        sessionStorage.removeItem('tour_step');
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state]);

  return (
    <TourContext.Provider
      value={{ active: state === 'running', state, step, stepIndex, start, pause, resume, exit, next }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  return useContext(TourContext);
}
