'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CloudLightning } from 'lucide-react';
import type { ForecastDay } from '@/lib/forecast/types';

interface Props {
  days: ForecastDay[];
}

export default function StormAlert({ days }: Props) {
  const incoming = days.slice(0, 2).find((d) => d.storm_level >= 7);

  return (
    <AnimatePresence>
      {incoming && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-luna-aurora-pink/30 bg-luna-aurora-pink/5 px-4 py-3"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0 rounded-full bg-luna-aurora-pink/20 p-1.5">
              <CloudLightning size={16} className="text-luna-aurora-pink" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-luna-aurora-pink">
                A storm may be arriving. Let&apos;s prepare.
              </p>
              <p className="mt-0.5 text-xs text-luna-whisper/60">
                {incoming.day_name} looks heavier —{' '}
                {incoming.summary || 'give yourself extra softness.'}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
