'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, ClipboardList, FileText, MessageSquareText } from 'lucide-react';
import Logo from '@/components/brand/Logo';
import SeasonReportButton from '@/components/reports/SeasonReportButton';
import EmptyState from '@/components/ui/EmptyState';
import { createClient } from '@/lib/supabase/client';

interface ClinicianLog {
  id: string;
  log_date: string;
  weather_score: number | null;
  mood: string | null;
  sleep_quality: number | null;
  energy_level: number | null;
  severity: number | null;
  triggers: string[] | null;
  ai_summary: string | null;
  created_at: string;
}

export default function ClinicianPage() {
  const [logs, setLogs] = useState<ClinicianLog[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('symptom_logs')
        .select('id, log_date, weather_score, mood, sleep_quality, energy_level, severity, triggers, ai_summary, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      setLogs((data as ClinicianLog[] | null) ?? []);
    }

    const id = window.setTimeout(() => load(), 0);
    return () => window.clearTimeout(id);
  }, []);

  const prep = useMemo(() => {
    const topTriggers = countTriggers(logs).slice(0, 3).map(([trigger]) => trigger);
    const highSeverity = logs.filter((log) => (log.severity ?? 0) >= 7).length;
    const poorSleep = logs.filter((log) => (log.sleep_quality ?? 10) <= 4).length;
    const readiness = Math.min(100, Math.round((logs.length / 14) * 100));

    return {
      topTriggers,
      highSeverity,
      poorSleep,
      readiness,
      talkingPoints: [
        highSeverity > 0 ? `${highSeverity} recent high-severity day${highSeverity === 1 ? '' : 's'}` : 'How symptoms affect daily functioning',
        poorSleep > 0 ? `${poorSleep} poor-sleep night${poorSleep === 1 ? '' : 's'} logged` : 'Sleep quality and wake reasons',
        topTriggers.length ? `Possible triggers: ${topTriggers.join(', ')}` : 'Triggers still forming',
      ],
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
          <h1 className="font-serif text-3xl text-white">Clinician Prep</h1>
          <p className="mt-1 text-sm text-white/68">A practical visit center with report readiness, talking points, and symptom timeline.</p>
        </div>

        <section className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
          <div className="app-card p-5 sm:p-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-white/92">
                <FileText className="h-4 w-4 text-luna-aurora-mint" aria-hidden="true" />
                Report readiness
              </div>
              <span className="text-sm font-semibold text-white">{prep.readiness}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-luna-aurora-mint" style={{ width: `${prep.readiness}%` }} />
            </div>
            <p className="mt-3 text-sm leading-6 text-white/68">
              {logs.length >= 14
                ? 'You have enough check-ins for a more useful clinician summary.'
                : `${Math.max(0, 14 - logs.length)} more check-ins will strengthen your visit summary.`}
            </p>
          </div>

          <SeasonReportButton />
        </section>

        {logs.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="h-5 w-5" aria-hidden="true" />}
            title="No visit prep yet"
            description="Check-ins will become talking points and a symptom timeline here."
            requirement="14 check-ins create a stronger clinician-ready picture."
            actionLabel="Check in now"
            actionHref="/dashboard?checkin=true"
          />
        ) : (
          <>
            <section className="app-card p-5 sm:p-6">
              <div className="app-section-title">
                <div>
                  <h2>Talking points</h2>
                  <p>Bring these into your next appointment</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {prep.talkingPoints.map((point) => (
                  <div key={point} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                    <MessageSquareText className="mb-2 h-4 w-4 text-luna-aurora-pink" aria-hidden="true" />
                    <p className="text-sm leading-6 text-white/82">{point}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="app-card p-5 sm:p-6">
              <div className="app-section-title">
                <div>
                  <h2>Symptom timeline</h2>
                  <p>Recent logs for visit context</p>
                </div>
              </div>
              <div className="space-y-3">
                {logs.slice(0, 10).map((log) => (
                  <article key={log.id} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/62">
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                      {formatDate(log.created_at)}
                    </div>
                    <p className="text-sm leading-6 text-white/82">{log.ai_summary ?? 'Check-in saved.'}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {log.severity && <Pill label={`Severity ${log.severity}`} />}
                      {log.sleep_quality && <Pill label={`Sleep ${log.sleep_quality}`} />}
                      {log.triggers?.slice(0, 3).map((trigger) => <Pill key={trigger} label={trigger} />)}
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

function countTriggers(logs: ClinicianLog[]) {
  const counts = new Map<string, number>();
  logs.forEach((log) => log.triggers?.forEach((trigger) => {
    counts.set(trigger, (counts.get(trigger) ?? 0) + 1);
  }));
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function Pill({ label }: { label: string }) {
  return <span className="rounded-full border border-white/10 bg-white/[0.045] px-2 py-0.5 text-xs text-white/70">{label}</span>;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
