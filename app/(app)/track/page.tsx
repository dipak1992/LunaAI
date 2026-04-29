'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BatteryMedium, Flame, HeartPulse, Moon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Logo from '@/components/brand/Logo';
import EmptyState from '@/components/ui/EmptyState';
import { createClient } from '@/lib/supabase/client';

interface TrackLog {
  id: string;
  log_date: string;
  weather_score: number | null;
  mood: string | null;
  sleep_quality: number | null;
  energy_level: number | null;
  severity: number | null;
  triggers: string[] | null;
  symptoms: unknown;
  ai_summary: string | null;
  created_at: string;
}

export default function TrackPage() {
  const [logs, setLogs] = useState<TrackLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('symptom_logs')
        .select('id, log_date, weather_score, mood, sleep_quality, energy_level, severity, triggers, symptoms, ai_summary, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(60);

      setLogs((data as TrackLog[] | null) ?? []);
      setLoading(false);
    }

    const id = window.setTimeout(() => load(), 0);
    return () => window.clearTimeout(id);
  }, []);

  const summary = useMemo(() => {
    const avg = (values: Array<number | null>) => {
      const valid = values.filter((value): value is number => value !== null);
      return valid.length ? Math.round((valid.reduce((sum, value) => sum + value, 0) / valid.length) * 10) / 10 : null;
    };
    const triggerCounts = new Map<string, number>();
    logs.forEach((log) => log.triggers?.forEach((trigger) => {
      triggerCounts.set(trigger, (triggerCounts.get(trigger) ?? 0) + 1);
    }));

    return {
      sleep: avg(logs.map((log) => log.sleep_quality)),
      energy: avg(logs.map((log) => log.energy_level)),
      severity: avg(logs.map((log) => log.severity)),
      mood: mostCommon(logs.map((log) => log.mood).filter(Boolean) as string[]),
      triggers: [...triggerCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8),
    };
  }, [logs]);

  return (
    <div className="app-shell min-h-screen aurora-bg flex flex-col">
      <header className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm text-white/70 hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Dashboard
        </Link>
        <Logo size={28} />
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-5 px-4 py-8 pb-28 sm:px-6">
        <div>
          <h1 className="font-serif text-3xl text-white">Track</h1>
          <p className="mt-1 text-sm text-white/68">Symptoms, sleep, mood, energy, and triggers from your saved check-ins.</p>
        </div>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-28 animate-pulse rounded-lg bg-white/[0.055]" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            icon={<HeartPulse className="h-5 w-5" aria-hidden="true" />}
            title="No tracking data yet"
            description="Start with one check-in, then Luna can build your symptom and recovery timeline."
            requirement="1 check-in starts tracking. 7 check-ins make patterns more useful."
            actionLabel="Check in now"
            actionHref="/dashboard?checkin=true"
          />
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-4">
              <TrackMetric icon={Moon} label="Sleep" value={summary.sleep ? `${summary.sleep}/10` : 'No data'} />
              <TrackMetric icon={BatteryMedium} label="Energy" value={summary.energy ? `${summary.energy}/10` : 'No data'} />
              <TrackMetric icon={Flame} label="Severity" value={summary.severity ? `${summary.severity}/10` : 'No data'} />
              <TrackMetric icon={HeartPulse} label="Mood" value={summary.mood ? capitalize(summary.mood) : 'No data'} />
            </div>

            <section className="app-card p-5 sm:p-6">
              <div className="app-section-title">
                <div>
                  <h2>Top triggers</h2>
                  <p>What has shown up most often in recent check-ins</p>
                </div>
              </div>
              <div className="space-y-3">
                {summary.triggers.length === 0 ? (
                  <p className="text-sm text-white/68">No triggers recorded yet.</p>
                ) : summary.triggers.map(([trigger, count]) => (
                  <div key={trigger}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="capitalize text-white/86">{trigger}</span>
                      <span className="text-white/62">{count}x</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/8">
                      <div className="h-full rounded-full bg-luna-aurora-pink" style={{ width: `${Math.min(100, count * 18)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="app-card p-5 sm:p-6">
              <div className="app-section-title">
                <div>
                  <h2>Recent logs</h2>
                  <p>Tap Check In from the bottom bar to add another data point</p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {logs.slice(0, 12).map((log) => (
                  <article key={log.id} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.14em] text-white/62">{formatDate(log.created_at)}</p>
                      {log.weather_score && <span className="text-xs text-white/70">{log.weather_score}/10</span>}
                    </div>
                    <p className="text-sm leading-6 text-white/82">{log.ai_summary ?? 'Check-in saved.'}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {log.mood && <Pill label={capitalize(log.mood)} />}
                      {log.sleep_quality && <Pill label={`Sleep ${log.sleep_quality}`} />}
                      {log.energy_level && <Pill label={`Energy ${log.energy_level}`} />}
                      {log.severity && <Pill label={`Severity ${log.severity}`} />}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function TrackMetric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="app-card p-4">
      <Icon className="mb-3 h-5 w-5 text-luna-aurora-mint" aria-hidden="true" />
      <p className="text-xs uppercase tracking-[0.14em] text-white/58">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function Pill({ label }: { label: string }) {
  return <span className="rounded-full border border-white/10 bg-white/[0.045] px-2 py-0.5 text-xs text-white/70">{label}</span>;
}

function mostCommon(values: string[]): string | null {
  const counts = new Map<string, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
