'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Brain, Flame, LockKeyhole, Moon, Sparkles, Wind } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Logo from '@/components/brand/Logo';
import { createClient } from '@/lib/supabase/client';

interface PlanLog {
  mood: string | null;
  sleep_quality: number | null;
  energy_level: number | null;
  severity: number | null;
  triggers: string[] | null;
  ai_summary: string | null;
  created_at: string;
}

export default function PlansPage() {
  const [logs, setLogs] = useState<PlanLog[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('symptom_logs')
        .select('mood, sleep_quality, energy_level, severity, triggers, ai_summary, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      setLogs((data as PlanLog[] | null) ?? []);
    }

    const id = window.setTimeout(() => load(), 0);
    return () => window.clearTimeout(id);
  }, []);

  const context = useMemo(() => buildPlanContext(logs), [logs]);

  return (
    <div className="app-shell min-h-screen aurora-bg flex flex-col">
      <header className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm text-white/70 hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Dashboard
        </Link>
        <Logo size={28} />
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-5 px-4 py-8 pb-28 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl text-white">Plans</h1>
            <p className="mt-1 text-sm text-white/68">Personalized support cards for sleep, hot flashes, anxiety, and brain fog.</p>
          </div>
          <div className="rounded-lg border border-luna-aurora-lilac/20 bg-luna-aurora-lilac/[0.06] px-4 py-3 text-sm text-white/76">
            Weekly plan: {context.weeklyFocus}
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          <PlanCard
            icon={Moon}
            title="Sleep Reset"
            signal={context.sleepSignal}
            steps={['Dim lights 60 minutes before bed', 'Log night sweats or wake reasons', 'Try a 5-minute downshift before sleep']}
          />
          <PlanCard
            icon={Flame}
            title="Hot Flash Prep"
            signal={context.hotFlashSignal}
            steps={['Keep a cooling layer nearby', 'Notice caffeine, alcohol, and stress timing', 'Use paced breathing at the first warmth cue']}
          />
          <PlanCard
            icon={Wind}
            title="Anxiety Support"
            signal={context.anxietySignal}
            steps={['Name the sensation before solving it', 'Choose one tiny next task', 'Ask Luna to unpack the thought loop']}
          />
          <PlanCard
            icon={Brain}
            title="Brain Fog Day"
            signal={context.brainFogSignal}
            steps={['Use a three-item priority list', 'Pair protein and fiber at your next meal', 'Take a short reset before complex work']}
          />
        </section>

        <section className="app-card overflow-hidden p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-white/92">Premium forecast preview</h2>
              <p className="mt-1 text-sm text-white/66">Your weekly plan can become more specific as Luna learns your storm patterns.</p>
            </div>
            <LockKeyhole className="h-5 w-5 text-luna-aurora-lilac" aria-hidden="true" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {['Lower-energy prep', 'Trigger timing', 'Recovery windows'].map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/[0.04] p-4 blur-[0.3px]">
                <p className="text-sm font-medium text-white/80">{item}</p>
                <p className="mt-2 text-xs leading-5 text-white/54">Unlock a clearer 7-day read once your forecast is ready.</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function PlanCard({
  icon: Icon,
  title,
  signal,
  steps,
}: {
  icon: LucideIcon;
  title: string;
  signal: string;
  steps: string[];
}) {
  return (
    <article className="app-card p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-luna-aurora-mint">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-white/92">{title}</h2>
          <p className="text-xs leading-5 text-white/62">{signal}</p>
        </div>
      </div>
      <ul className="space-y-2">
        {steps.map((step) => (
          <li key={step} className="flex gap-2 text-sm leading-6 text-white/78">
            <Sparkles className="mt-1 h-3.5 w-3.5 shrink-0 text-luna-aurora-pink" aria-hidden="true" />
            {step}
          </li>
        ))}
      </ul>
    </article>
  );
}

function buildPlanContext(logs: PlanLog[]) {
  const triggerText = logs.flatMap((log) => log.triggers ?? []).join(' ').toLowerCase();
  const avgSleep = average(logs.map((log) => log.sleep_quality));
  const avgEnergy = average(logs.map((log) => log.energy_level));
  const avgSeverity = average(logs.map((log) => log.severity));
  const anxious = logs.some((log) => log.mood?.toLowerCase().includes('anxious') || triggerText.includes('anxious'));

  return {
    weeklyFocus: avgSleep && avgSleep < 6 ? 'protect sleep first' : avgEnergy && avgEnergy < 6 ? 'steady energy' : 'keep patterns visible',
    sleepSignal: avgSleep ? `Recent sleep average: ${avgSleep}/10.` : 'Add sleep scores to personalize this plan.',
    hotFlashSignal: triggerText.includes('flash') || triggerText.includes('sweat')
      ? 'Hot flashes or night sweats are already showing in your logs.'
      : 'Use this when warmth, sweats, or flushing shows up.',
    anxietySignal: anxious ? 'Anxiety appears in recent logs.' : 'Ready for anxious or wired days.',
    brainFogSignal: avgEnergy && avgEnergy < 6 ? `Energy is averaging ${avgEnergy}/10, so simplify cognitive load.` : 'Use on low-focus or overloaded days.',
    severitySignal: avgSeverity,
  };
}

function average(values: Array<number | null>): number | null {
  const valid = values.filter((value): value is number => value !== null);
  return valid.length ? Math.round((valid.reduce((sum, value) => sum + value, 0) / valid.length) * 10) / 10 : null;
}
