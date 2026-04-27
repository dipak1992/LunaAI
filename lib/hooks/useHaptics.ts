'use client';

import { useCallback } from 'react';

type Pattern = 'tap' | 'success' | 'warn' | 'error';

const PATTERNS: Record<Pattern, VibratePattern> = {
  tap: 12,
  success: [20, 30, 40],
  warn: [30, 40, 30],
  error: [60, 40, 60],
};

export function useHaptics() {
  return useCallback((pattern: Pattern = 'tap') => {
    if (typeof window === 'undefined') return;
    if (!('vibrate' in navigator)) return;

    try {
      navigator.vibrate(PATTERNS[pattern]);
    } catch {
      // Haptics are a nice-to-have.
    }
  }, []);
}
