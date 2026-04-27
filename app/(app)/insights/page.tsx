'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Logo from '@/components/brand/Logo';
import InsightsSummary from '@/components/insights/InsightsSummary';
import CalendarHeatmap from '@/components/insights/CalendarHeatmap';
import TrendChart from '@/components/insights/TrendChart';
import SymptomFrequency from '@/components/insights/SymptomFrequency';
import type { InsightsPayload } from '@/types/insights';

type Period = 30 | 60 | 90;

// ── Skeleton loader ──────────────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-xl bg-white/5 animate-pulse ${className}`}
    />
  );
}

function SectionSkeleton() {
  return (
    <div className="glass rounded-2xl p-6 space-y-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

// ── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  title,
  subtitle,
  children,
  delay = 0,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      className="glass rounded-2xl p-5 sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="mb-4">
        <h2 className="text-base font-medium text-white/90">{title}</h2>
        {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function InsightsPage() {
  const [period, setPeriod] = useState<Period>(90);
  const [data, setData] = useState<InsightsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async (days: Period) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/insights?days=${days}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const payload: InsightsPayload = await res.json();
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights(period);
  }, [period, fetchInsights]);

  const PERIODS: Period[] = [30, 60, 90];

  return (
    <div className="min-h-screen aurora-bg flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </Link>
          <div className="w-px h-4 bg-white/10" />
          <Logo size={28} />
        </div>

        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex items-center gap-1 glass rounded-full px-1 py-1">
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  period === p
                    ? 'bg-white/15 text-white'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {p}d
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            onClick={() => fetchInsights(period)}
            disabled={loading}
            className="w-8 h-8 flex items-center justify-center rounded-full glass text-white/40 hover:text-white/80 transition-colors disabled:opacity-40"
            aria-label="Refresh insights"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-4 py-8 max-w-3xl mx-auto w-full space-y-5">
        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-fraunces text-2xl md:text-3xl text-aurora mb-1">
            Your Insights
          </h1>
          <p className="text-sm text-white/40">
            Patterns and trends from your last {period} days
          </p>
        </motion.div>

        {/* Error state */}
        {error && (
          <motion.div
            className="glass rounded-2xl p-5 border border-red-400/20 text-red-300/80 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        {/* Loading skeletons */}
        {loading && !data && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map(i => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))}
            </div>
            <SectionSkeleton />
            <SectionSkeleton />
            <SectionSkeleton />
          </div>
        )}

        {/* Content */}
        {data && (
          <>
            {/* Summary stats */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              <InsightsSummary data={data} />
            </motion.div>

            {/* Calendar heatmap */}
            <Section
              title="Check-in Calendar"
              subtitle="Colour shows your daily wellbeing score — darker purple = harder days, rose = better days"
              delay={0.1}
            >
              {data.days.length === 0 ? (
                <div className="flex items-center justify-center h-24 text-white/30 text-sm">
                  No check-ins in this period
                </div>
              ) : (
                <CalendarHeatmap
                  days={data.days}
                  weeks={period === 30 ? 5 : period === 60 ? 9 : 13}
                />
              )}
            </Section>

            {/* Trend chart */}
            <Section
              title="Trends Over Time"
              subtitle="Select a metric to see how it changes day by day"
              delay={0.15}
            >
              <TrendChart days={data.days} />
            </Section>

            {/* Trigger frequency */}
            <Section
              title="Top Triggers"
              subtitle={`Most frequently logged triggers in the last ${period} days`}
              delay={0.2}
            >
              <SymptomFrequency triggers={data.triggers} />
            </Section>

            {/* Emotional tone breakdown */}
            {data.days.some(d => d.dominant_tone) && (
              <Section
                title="Emotional Landscape"
                subtitle="How you've been feeling, day by day"
                delay={0.25}
              >
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const toneCounts = new Map<string, number>();
                    for (const d of data.days) {
                      if (d.dominant_tone) {
                        toneCounts.set(
                          d.dominant_tone,
                          (toneCounts.get(d.dominant_tone) ?? 0) + 1
                        );
                      }
                    }
                    return [...toneCounts.entries()]
                      .sort((a, b) => b[1] - a[1])
                      .map(([tone, count]) => {
                        const pct = Math.round((count / data.days.length) * 100);
                        return (
                          <motion.div
                            key={tone}
                            className="flex items-center gap-2 glass rounded-full px-3 py-1.5"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <span className="text-sm capitalize text-white/80">{tone}</span>
                            <span className="text-xs text-white/40">{pct}%</span>
                          </motion.div>
                        );
                      });
                  })()}
                </div>
              </Section>
            )}

            {/* Empty state */}
            {data.days.length === 0 && !loading && (
              <motion.div
                className="glass rounded-2xl p-10 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-4xl mb-3">🌙</div>
                <h3 className="font-fraunces text-xl text-white/70 mb-2">
                  No data yet
                </h3>
                <p className="text-sm text-white/40 mb-5">
                  Complete your first voice check-in to start seeing insights
                </p>
                <Link href="/dashboard" className="btn-primary text-sm px-5 py-2.5">
                  Go to Dashboard
                </Link>
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
