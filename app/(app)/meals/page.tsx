'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Coffee, Droplets, Moon, Wheat } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Logo from '@/components/brand/Logo';
import { createClient } from '@/lib/supabase/client';

interface MealLog {
  sleep_quality: number | null;
  energy_level: number | null;
  triggers: string[] | null;
}

export default function MealsPage() {
  const [logs, setLogs] = useState<MealLog[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('symptom_logs')
        .select('sleep_quality, energy_level, triggers')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(21);

      setLogs((data as MealLog[] | null) ?? []);
    }

    const id = window.setTimeout(() => load(), 0);
    return () => window.clearTimeout(id);
  }, []);

  const context = useMemo(() => {
    const avgEnergy = average(logs.map((log) => log.energy_level));
    const avgSleep = average(logs.map((log) => log.sleep_quality));
    const triggers = logs.flatMap((log) => log.triggers ?? []).join(' ').toLowerCase();
    return {
      energy: avgEnergy,
      sleep: avgSleep,
      heat: triggers.includes('flash') || triggers.includes('sweat') || triggers.includes('hot'),
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
          <h1 className="font-serif text-3xl text-white">Meals</h1>
          <p className="mt-1 text-sm text-white/68">Food support for steady energy, cooling days, and sleep without diet-culture noise.</p>
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          <MealCard
            icon={Wheat}
            title="Steady Energy Plate"
            signal={context.energy ? `Recent energy average: ${context.energy}/10.` : 'Use this when you want steadier energy.'}
            ideas={['Protein plus fiber at breakfast', 'Add slow carbs before demanding work', 'Keep a simple snack option visible']}
          />
          <MealCard
            icon={Droplets}
            title="Cooling Meal Nudges"
            signal={context.heat ? 'Heat or sweat triggers appear in recent logs.' : 'Useful on hot flash or night sweat days.'}
            ideas={['Hydrating foods earlier in the day', 'Limit spicy or alcohol triggers when patterns point there', 'Keep a cool drink routine simple']}
          />
          <MealCard
            icon={Moon}
            title="Sleep-Supportive Evening"
            signal={context.sleep ? `Recent sleep average: ${context.sleep}/10.` : 'Use this when sleep feels fragile.'}
            ideas={['Avoid heavy late meals when possible', 'Choose a calming evening snack if hungry', 'Pair dinner timing with your sleep reflection']}
          />
          <MealCard
            icon={Coffee}
            title="Caffeine Timing"
            signal="A gentle experiment, not a rule."
            ideas={['Notice caffeine after noon', 'Track hot flashes after coffee days', 'Swap one late cup for a lower-stimulation ritual']}
          />
        </section>
      </main>
    </div>
  );
}

function MealCard({
  icon: Icon,
  title,
  signal,
  ideas,
}: {
  icon: LucideIcon;
  title: string;
  signal: string;
  ideas: string[];
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
        {ideas.map((idea) => (
          <li key={idea} className="text-sm leading-6 text-white/78">{idea}</li>
        ))}
      </ul>
    </article>
  );
}

function average(values: Array<number | null>): number | null {
  const valid = values.filter((value): value is number => value !== null);
  return valid.length ? Math.round((valid.reduce((sum, value) => sum + value, 0) / valid.length) * 10) / 10 : null;
}
