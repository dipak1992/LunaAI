'use client';

import { motion } from 'framer-motion';
import { CircleDot } from 'lucide-react';
import type { TriggerFrequency } from '@/types/insights';
import EmptyState from '@/components/ui/EmptyState';

interface SymptomFrequencyProps {
  triggers: TriggerFrequency[];
  /** Max bars to show (default 10) */
  limit?: number;
}

// Assign a colour from the aurora palette based on index
const BAR_COLORS = [
  '#E9B8FF', // moon
  '#FF9EC7', // rose
  '#FFD4A3', // sunset
  '#A8E6CF', // calm
  '#C8A8E9', // lilac
  '#8FB8E8', // blue
  '#FFE5B4', // glow
  '#FF9AAE', // aurora-pink
  '#6B5B95', // storm
  '#A8D8C9', // mint
];

export default function SymptomFrequency({ triggers, limit = 10 }: SymptomFrequencyProps) {
  const top = triggers.slice(0, limit);
  const maxOcc = top[0]?.occurrences ?? 1;

  if (top.length === 0) {
    return (
      <EmptyState
        icon={<CircleDot className="h-5 w-5" aria-hidden="true" />}
        title="No triggers recorded yet"
        description="Triggers appear here once Luna can spot what tends to show up around symptoms."
        requirement="Add 3 check-ins with symptoms or triggers to make this section useful."
        actionLabel="Check in now"
        actionHref="/dashboard?checkin=true"
      />
    );
  }

  return (
    <div className="space-y-2.5">
      {top.map((t, i) => {
        const pct = (t.occurrences / maxOcc) * 100;
        const color = BAR_COLORS[i % BAR_COLORS.length];
        return (
          <div key={t.trigger_name} className="group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-white/86 capitalize">{t.trigger_name}</span>
              <span className="text-xs text-white/66">
                {t.occurrences}×
              </span>
            </div>
            <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: color }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, delay: i * 0.06, ease: 'easeOut' }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
