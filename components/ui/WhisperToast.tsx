'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { playSound } from '@/lib/sound/player';

export type ToastTone = 'soft' | 'warm' | 'alert';

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  whisper: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_STYLES: Record<ToastTone, string> = {
  soft: 'border-luna-whisper/15 bg-luna-night/85 text-luna-cream',
  warm: 'border-luna-aurora-lilac/30 bg-luna-aurora-lilac/10 text-luna-cream',
  alert: 'border-luna-aurora-pink/30 bg-luna-aurora-pink/10 text-luna-cream',
};

export function useWhisper() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useWhisper must be used inside WhisperProvider');
  return ctx.whisper;
}

export function WhisperProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const whisper = useCallback((message: string, tone: ToastTone = 'soft') => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, tone }]);
    playSound('pop', 0.12);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4200);
  }, []);

  return (
    <ToastContext.Provider value={{ whisper }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[120] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-3">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              className={`rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-xl ${TONE_STYLES[toast.tone]}`}
              initial={{ opacity: 0, x: 24, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
