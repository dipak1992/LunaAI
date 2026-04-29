'use client';

import { motion } from 'framer-motion';
import { Flame, CalendarCheck, TrendingUp, Moon } from 'lucide-react';
import type { InsightsPayload } from '@/types/insights';
import { toneColor } from '@/types/insights';

interface InsightsSummaryProps {
  data: InsightsPayload;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  delay?: number;
}

function StatCard({ icon, label, value, sub, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      className="glass rounded-2xl p-4 flex flex-col gap-2"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: `${color}22`, border: `1px solid ${color}44` }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <div className="text-2xl font-fraunces" style={{ color }}>
          {value}
        </div>
        <div className="text-xs text-white/50 mt-0.5">{label}</div>
        {sub && <div className="text-xs text-white/30 mt-0.5">{sub}</div>}
      </div>
    </motion.div>
  );
}

export default function InsightsSummary({ data }: InsightsSummaryProps) {
  const { days, streak, total_check_ins, triggers } = data;

  // Average wellbeing score across all days
  const scores = days
    .map(d => d.avg_weather_score)
    .filter((v): v is number => v !== null);
  const avgScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;

  // Most common tone
  const toneCounts = new Map<string, number>();
  for (const d of days) {
    if (d.dominant_tone) {
      toneCounts.set(d.dominant_tone, (toneCounts.get(d.dominant_tone) ?? 0) + 1);
    }
  }
  let topTone: string | null = null;
  let topToneCount = 0;
  for (const [tone, count] of toneCounts) {
    if (count > topToneCount) { topToneCount = count; topTone = tone; }
  }

  // Biggest trigger
  const biggestTrigger = triggers[0]?.trigger_name ?? null;

  return (
    <div className="space-y-4">
      {/* Stat cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={<Flame size={18} />}
          label="Day streak"
          value={streak}
          sub={streak === 1 ? 'day' : 'days in a row'}
          color="#FFD4A3"
          delay={0}
        />
        <StatCard
          icon={<CalendarCheck size={18} />}
          label="Total check-ins"
          value={total_check_ins}
          sub={`over ${data.date_range.from} – ${data.date_range.to}`}
          color="#E9B8FF"
          delay={0.08}
        />
        <StatCard
          icon={<TrendingUp size={18} />}
          label="Avg wellbeing"
          value={avgScore !== null ? `${avgScore}/10` : '–'}
          sub="weather score"
          color="#A8E6CF"
          delay={0.16}
        />
        <StatCard
          icon={<Moon size={18} />}
          label="Top mood"
          value={topTone ? topTone.charAt(0).toUpperCase() + topTone.slice(1) : '–'}
          sub={topTone ? `${topToneCount} day${topToneCount !== 1 ? 's' : ''}` : undefined}
          color={toneColor(topTone)}
          delay={0.24}
        />
      </div>

      {/* Biggest trigger callout */}
      {biggestTrigger && (
        <motion.div
          className="glass-aurora rounded-2xl px-5 py-4 flex items-center gap-3"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.32 }}
        >
          <span className="text-2xl">⚡</span>
          <div>
            <p className="text-xs text-white/55 uppercase tracking-[0.14em] mb-0.5">
              Most frequent trigger
            </p>
            <p className="text-white/90 font-medium capitalize">{biggestTrigger}</p>
            <p className="text-xs text-white/40 mt-0.5">
              Appeared {triggers[0].occurrences} time{triggers[0].occurrences !== 1 ? 's' : ''} in the selected period
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
