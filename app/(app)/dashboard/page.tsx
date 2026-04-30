'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart2,
  BatteryMedium,
  CalendarDays,
  ClipboardList,
  CloudSun,
  CookingPot,
  FileText,
  Flame,
  Keyboard,
  LockKeyhole,
  HeartPulse,
  Menu,
  MessageCircle,
  Mic,
  Moon,
  PenLine,
  Settings,
  Sparkles,
  TrendingUp,
  Wind,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { VoiceCheckInModal } from '@/components/dashboard/VoiceCheckInModal';
import Logo from '@/components/brand/Logo';
import ForecastStrip from '@/components/forecast/ForecastStrip';
import TodayHaiku from '@/components/haiku/TodayHaiku';
import SeasonReportButton from '@/components/reports/SeasonReportButton';
import SoundToggle from '@/components/settings/SoundToggle';
import EmptyState from '@/components/ui/EmptyState';
import { createClient } from '@/lib/supabase/client';
import { WelcomeBanner } from '@/components/trial/WelcomeBanner';
import type { VoiceCheckInResult } from '@/types/voice';
import type { InsightsPayload } from '@/types/insights';

const NAV_ITEMS = [
  { href: '/track', icon: ClipboardList, label: 'Track' },
  { href: '/plans', icon: Sparkles, label: 'Plans' },
  { href: '/chat', icon: MessageCircle, label: 'Chat' },
  { href: '/insights', icon: BarChart2, label: 'Insights' },
  { href: '/clinician', icon: FileText, label: 'Clinician' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

interface LatestLog {
  id: string;
  log_date: string;
  weather_score: number | null;
  mood: string | null;
  sleep_quality: number | null;
  energy_level: number | null;
  severity: number | null;
  symptoms: unknown;
  triggers: string[] | null;
  luna_response: string | null;
  ai_summary: string | null;
  created_at: string;
}

type TimelineLog = Pick<
  LatestLog,
  | 'id'
  | 'log_date'
  | 'weather_score'
  | 'mood'
  | 'sleep_quality'
  | 'energy_level'
  | 'severity'
  | 'triggers'
  | 'luna_response'
  | 'ai_summary'
  | 'created_at'
>;

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [checkInMode, setCheckInMode] = useState<'voice' | 'text'>('voice');
  const [lastResult, setLastResult] = useState<VoiceCheckInResult | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkInCount, setCheckInCount] = useState<number | null>(null);
  const [latestLog, setLatestLog] = useState<LatestLog | null>(null);
  const [recentLogs, setRecentLogs] = useState<TimelineLog[]>([]);
  const [insights, setInsights] = useState<InsightsPayload | null>(null);
  const [weeklyRecap, setWeeklyRecap] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch profile name
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();
        const name = profile?.name || user.user_metadata?.name || '';
        setUserName(name);

        // Fetch check-in count for empty state + streak
        const { count } = await supabase
          .from('symptom_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        setCheckInCount(count ?? 0);

        const { data: latest } = await supabase
          .from('symptom_logs')
          .select('id, log_date, weather_score, mood, sleep_quality, energy_level, severity, symptoms, triggers, luna_response, ai_summary, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        setLatestLog((latest as LatestLog | null) ?? null);

        const { data: recent } = await supabase
          .from('symptom_logs')
          .select('id, log_date, weather_score, mood, sleep_quality, energy_level, severity, triggers, luna_response, ai_summary, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(6);
        setRecentLogs((recent as TimelineLog[] | null) ?? []);

        const insightsRes = await fetch('/api/insights?days=30', { cache: 'no-store' });
        if (insightsRes.ok) {
          setInsights((await insightsRes.json()) as InsightsPayload);
        }

        const recapRes = await fetch('/api/weekly-recap', { cache: 'no-store' });
        if (recapRes.ok) {
          const recap = (await recapRes.json()) as { recap?: string };
          setWeeklyRecap(recap.recap ?? null);
        }
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkin') === 'true') {
      window.setTimeout(() => setModalOpen(true), 0);
      window.history.replaceState(null, '', '/dashboard');
    }
  }, []);

  const handleComplete = (result: VoiceCheckInResult) => {
    setLastResult(result);
    setLatestLog({
      id: result.logId,
      log_date: new Date().toISOString().slice(0, 10),
      weather_score: result.weatherScore,
      mood: result.mood ?? result.emotionalTone,
      sleep_quality: result.sleepQuality ?? null,
      energy_level: result.energyLevel ?? null,
      severity: result.severity ?? null,
      symptoms: [],
      triggers: result.triggers,
      luna_response: result.lunaResponse,
      ai_summary: result.aiSummary,
      created_at: new Date().toISOString(),
    });
    setRecentLogs((current) => [
      {
        id: result.logId,
        log_date: new Date().toISOString().slice(0, 10),
        weather_score: result.weatherScore,
        mood: result.mood ?? result.emotionalTone,
        sleep_quality: result.sleepQuality ?? null,
        energy_level: result.energyLevel ?? null,
        severity: result.severity ?? null,
        triggers: result.triggers,
        luna_response: result.lunaResponse,
        ai_summary: result.aiSummary,
        created_at: new Date().toISOString(),
      },
      ...current,
    ].slice(0, 6));
    setModalOpen(false);
    // Increment count after a check-in
    setCheckInCount((prev) => (prev ?? 0) + 1);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const isFirstTime = checkInCount === 0;
  const weatherScore = lastResult?.weatherScore ?? latestLog?.weather_score ?? null;
  const mood = latestLog?.mood ?? lastResult?.emotionalTone ?? null;
  const sleep = latestLog?.sleep_quality ?? null;
  const energy = latestLog?.energy_level ?? null;
  const severity = latestLog?.severity ?? null;
  const topTrigger = lastResult?.triggers[0] ?? latestLog?.triggers?.[0] ?? null;
  const topInsightTrigger = insights?.triggers[0]?.trigger_name ?? topTrigger;
  const checkInsUntilForecast = Math.max(0, 7 - (checkInCount ?? 0));
  const reportReadyCount = Math.min(checkInCount ?? 0, 14);
  const reportReadiness = Math.round((reportReadyCount / 14) * 100);
  const smartSuggestion = buildSmartSuggestion({
    isFirstTime,
    topTrigger: topInsightTrigger,
    sleep,
    energy,
    severity,
  });
  const weeklyProgress = {
    checkIns: insights?.total_check_ins ?? checkInCount ?? 0,
    streak: insights?.streak ?? 0,
    bestSignal: insights?.days.length
      ? bestDayLabel(insights.days)
      : 'Patterns will appear after a few check-ins.',
  };

  const openCheckIn = (mode: 'voice' | 'text') => {
    setCheckInMode(mode);
    setModalOpen(true);
  };

  return (
    <div className="app-shell min-h-screen aurora-bg-subtle flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5">
        <Logo size={28} />

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-2">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition-all duration-200 text-[0.9375rem] ${
                  isActive
                    ? 'bg-white/10 text-white border border-white/15'
                    : 'glass text-white/82 hover:text-white'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            );
          })}
          <SoundToggle />
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden flex items-center justify-center w-9 h-9 rounded-lg text-white/80 hover:bg-white/5 transition-colors"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile nav drawer */}
      {menuOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="sm:hidden border-b border-white/5 bg-luna-ink/95 backdrop-blur-xl px-4 py-3 flex flex-wrap gap-2"
        >
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[0.9375rem] transition-all ${
                  isActive
                    ? 'bg-white/10 text-white border border-white/15'
                    : 'glass text-white/82 hover:text-white'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
          <SoundToggle />
        </motion.nav>
      )}

      {/* Main */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 pb-24 pt-5 sm:gap-6 sm:px-5 sm:py-8">
        {/* Trial welcome banner (shows when ?welcome=true) */}
        <div>
          <WelcomeBanner name={userName} />
        </div>

        <section className="app-card overflow-hidden p-5 sm:p-6 md:p-7">
          <motion.div
            className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div>
              {userName && (
                <div className="mb-2 flex items-center gap-3">
                  <p className="text-base text-white/68 sm:text-lg">
                    {greeting()}, <span className="font-semibold text-white">{userName}</span>
                  </p>
                  {weeklyProgress.streak > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-luna-aurora-mint/20 bg-luna-aurora-mint/10 px-2.5 py-0.5 text-xs font-semibold text-luna-aurora-mint">
                      🔥 {weeklyProgress.streak} day streak
                    </span>
                  )}
                  {checkInCount !== null && checkInCount > 0 && weeklyProgress.streak === 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-xs text-white/50">
                      Day {checkInCount} of your journey
                    </span>
                  )}
                </div>
              )}
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-white/48">
                Today&apos;s body weather
              </p>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => openCheckIn('voice')}
                  className="voice-orb flex h-20 w-20 shrink-0 items-center justify-center rounded-full sm:h-24 sm:w-24"
                  aria-label="Start voice check-in"
                >
                  <Mic className="h-8 w-8 text-white" aria-hidden="true" />
                </button>
                <div>
                  <h1 className="font-serif text-3xl text-white sm:text-4xl">
                    {weatherScore ? `${weatherScore}/10` : 'New day'}
                  </h1>
                  <p className="mt-1 max-w-md text-sm leading-6 text-white/72">
                    {weatherScore
                      ? mood
                        ? `${capitalize(mood)} weather, with Luna watching your patterns.`
                        : 'Luna has a read on today. Add anything new when you are ready.'
                      : 'A quick check-in gives Luna today’s first signal.'}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <ActionButton
                  icon={Mic}
                  label="Check in"
                  description="Voice"
                  onClick={() => openCheckIn('voice')}
                  primary
                />
                <ActionButton
                  icon={Keyboard}
                  label="Type instead"
                  description="Text"
                  onClick={() => openCheckIn('text')}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <TodayMetric
                  icon={<CloudSun className="h-4 w-4" aria-hidden="true" />}
                  label="Weather"
                  value={weatherScore ? `${weatherScore}/10` : 'Start today'}
                />
                <TodayMetric
                  icon={<Moon className="h-4 w-4" aria-hidden="true" />}
                  label="Sleep"
                  value={sleep ? `${sleep}/10` : 'Not logged'}
                />
                <TodayMetric
                  icon={<HeartPulse className="h-4 w-4" aria-hidden="true" />}
                  label="Mood"
                  value={mood ? capitalize(mood) : 'Not logged'}
                />
                <TodayMetric
                  icon={<BatteryMedium className="h-4 w-4" aria-hidden="true" />}
                  label="Energy"
                  value={energy ? `${energy}/10` : 'Not logged'}
                />
              </div>

              <SmartSuggestionCard suggestion={smartSuggestion} onCheckIn={() => openCheckIn('voice')} />
            </div>
          </motion.div>

          {/* First-time empty state */}
          {isFirstTime && checkInCount !== null && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
	              className="mt-5 w-full sm:mt-8"
	            >
              <EmptyState
                icon={<Mic className="h-5 w-5" aria-hidden="true" />}
                title="Luna is ready to listen."
                description="Your first check-in starts your private pattern history, whether you speak, type, or keep it short."
                requirement="1 check-in unlocks your first Today snapshot. 7 check-ins start shaping a forecast."
                reassurance="Transcript saved privately. You control your data."
                actionLabel="Start check-in"
                onAction={() => openCheckIn('voice')}
              />
            </motion.div>
          )}

          <div className="mx-auto mt-4 flex max-w-md items-start justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs leading-5 text-white/60">
            <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0 text-luna-aurora-mint" aria-hidden="true" />
            <span>
              Transcript saved privately. You control your data.
              {checkInsUntilForecast > 0 && ` ${checkInsUntilForecast} more check-${checkInsUntilForecast === 1 ? 'in' : 'ins'} until forecast patterns get useful.`}
            </span>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-5">
            <QuickReliefTools
              topTrigger={topInsightTrigger}
              severity={severity}
            />
            <AskLunaCard />
          </div>

          <div>
            {!isFirstTime ? (
              <ForecastStrip />
            ) : (
              <EmptyState
                icon={<CloudSun className="h-5 w-5" aria-hidden="true" />}
                title="Forecast preview"
                description="Your forecast opens once Luna has enough check-ins to compare patterns."
                requirement="7 check-ins unlock a more useful forecast preview."
                actionLabel="Check in now"
                actionHref="/dashboard?checkin=true"
              />
            )}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-4">
          <WeeklyProgressCard progress={weeklyProgress} />
          <TopPatternCard trigger={topInsightTrigger} severity={severity} />
          <ReflectionCard lastResult={lastResult} latestLunaResponse={latestLog?.luna_response ?? null} />
          <ReportReadinessMeter
            percentage={reportReadiness}
            count={checkInCount ?? 0}
          />
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <TodayHaiku />
          {!isFirstTime && (checkInCount ?? 0) >= 14 ? (
            <SeasonReportButton />
          ) : (
            <WeeklyRecapCard recap={weeklyRecap} />
          )}
        </section>

        <section>
          <MajorSectionLinks />
        </section>

        <section>
          <CheckInTimeline logs={recentLogs} />
        </section>
      </main>

      {/* Voice Check-In Modal */}
      <VoiceCheckInModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onComplete={handleComplete}
        userName={userName || undefined}
        initialMode={checkInMode}
      />
    </div>
  );
}

function MajorSectionLinks() {
  const sections = [
    {
      href: '/track',
      icon: ClipboardList,
      title: 'Track',
      description: 'Symptoms, sleep, mood, energy, and triggers.',
    },
    {
      href: '/plans',
      icon: Sparkles,
      title: 'Plans',
      description: 'Sleep, hot flash, anxiety, and brain fog support.',
    },
    {
      href: '/clinician',
      icon: FileText,
      title: 'Clinician prep',
      description: 'Talking points, timeline, and report readiness.',
    },
    {
      href: '/meals',
      icon: CookingPot,
      title: 'Meals',
      description: 'Steady energy, cooling meals, and sleep support.',
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {sections.map(({ href, icon: Icon, title, description }) => (
        <Link
          key={href}
          href={href}
          className="app-card group p-4 transition-colors hover:bg-white/[0.075]"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-luna-aurora-mint">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold text-white/92">{title}</p>
          <p className="mt-1 text-xs leading-5 text-white/64">{description}</p>
        </Link>
      ))}
    </div>
  );
}

function SmartSuggestionCard({
  suggestion,
  onCheckIn,
}: {
  suggestion: { title: string; body: string; href: string; action: string };
  onCheckIn: () => void;
}) {
  // If the suggestion action is a check-in trigger, open modal directly
  const isCheckInAction = suggestion.href.includes('checkin=true');

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-left">
      <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-white/50">
        <Sparkles className="h-4 w-4 text-luna-aurora-mint" aria-hidden="true" />
        Smart suggestion
      </div>
      <p className="text-sm font-semibold leading-5 text-white/92">{suggestion.title}</p>
      <p className="mt-1 text-sm leading-6 text-white/68">{suggestion.body}</p>
      {isCheckInAction ? (
        <button
          type="button"
          onClick={onCheckIn}
          className="mt-3 inline-flex text-sm font-semibold text-luna-aurora-mint hover:text-white"
        >
          {suggestion.action}
        </button>
      ) : (
        <Link href={suggestion.href} className="mt-3 inline-flex text-sm font-semibold text-luna-aurora-mint hover:text-white">
          {suggestion.action}
        </Link>
      )}
    </div>
  );
}

function QuickReliefTools({
  topTrigger,
  severity,
}: {
  topTrigger: string | null;
  severity: number | null;
}) {
  const tools = [
    {
      icon: Wind,
      label: 'Breathing',
      detail: severity && severity >= 7 ? '2 minutes now' : 'Steady the nervous system',
    },
    {
      icon: Flame,
      label: 'Cooling',
      detail: topTrigger?.toLowerCase().includes('flash') ? 'Prep for heat waves' : 'A quick body reset',
    },
    {
      icon: Moon,
      label: 'Sleep reset',
      detail: 'Tonight’s downshift',
    },
    {
      icon: PenLine,
      label: 'Journal',
      detail: 'Capture what helped',
    },
  ];

  return (
    <div className="app-card p-5 sm:p-6">
      <div className="app-section-title">
        <div>
          <h2>Quick relief tools</h2>
          <p>Small supports for the next ten minutes</p>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {tools.map(({ icon: Icon, label, detail }) => (
          <Link
            key={label}
            href="/plans"
            className="rounded-lg border border-white/10 bg-white/[0.045] p-4 transition-colors hover:bg-white/[0.075]"
          >
            <Icon className="mb-3 h-5 w-5 text-luna-aurora-mint" aria-hidden="true" />
            <p className="text-sm font-semibold text-white/90">{label}</p>
            <p className="mt-1 text-xs leading-5 text-white/62">{detail}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function AskLunaCard() {
  return (
    <Link
      href="/chat"
      className="app-card flex min-h-32 items-center gap-4 p-5 transition-colors hover:bg-white/[0.075] sm:p-6"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-luna-aurora-lilac/15 text-luna-aurora-lilac">
        <MessageCircle className="h-6 w-6" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-base font-semibold text-white/92">Ask Luna anything</span>
        <span className="mt-1 block text-sm leading-6 text-white/66">
          Bring today’s weather into chat, or ask what your patterns may mean.
        </span>
      </span>
    </Link>
  );
}

function WeeklyProgressCard({
  progress,
}: {
  progress: { checkIns: number; streak: number; bestSignal: string };
}) {
  return (
    <div className="app-card p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/92">
        <CalendarDays className="h-4 w-4 text-luna-aurora-mint" aria-hidden="true" />
        Weekly progress
      </div>
      <div className="flex items-end gap-3">
        <p className="text-2xl font-semibold text-white">{progress.checkIns}</p>
        {progress.streak > 0 && (
          <span className="mb-0.5 inline-flex items-center gap-1 rounded-full bg-luna-aurora-mint/10 px-2 py-0.5 text-xs font-semibold text-luna-aurora-mint">
            🔥 {progress.streak}d
          </span>
        )}
      </div>
      <p className="text-xs uppercase tracking-[0.14em] text-white/52">check-ins in range</p>
      {/* Mini streak dots */}
      <div className="mt-3 flex gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i < Math.min(progress.streak, 7)
                ? 'bg-luna-aurora-mint'
                : 'bg-white/10'
            }`}
          />
        ))}
      </div>
      <p className="mt-3 text-sm leading-6 text-white/72">
        {progress.bestSignal}
      </p>
    </div>
  );
}

function TopPatternCard({
  trigger,
  severity,
}: {
  trigger: string | null;
  severity: number | null;
}) {
  return (
    <div className="app-card p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/92">
        <TrendingUp className="h-4 w-4 text-luna-aurora-pink" aria-hidden="true" />
        Top pattern
      </div>
      <p className="text-sm leading-6 text-white/76">
        {trigger
          ? `${capitalize(trigger)} is the clearest symptom or trigger pattern right now.`
          : 'Luna needs a few more check-ins to name a top pattern.'}
      </p>
      <p className="mt-3 text-xs leading-5 text-white/58">
        {severity ? `Latest severity: ${severity}/10.` : 'Add symptom severity during check-in to sharpen this.'}
      </p>
    </div>
  );
}

function ReflectionCard({
  lastResult,
  latestLunaResponse,
}: {
  lastResult: VoiceCheckInResult | null;
  latestLunaResponse: string | null;
}) {
  // Prefer the in-session result, fall back to the persisted log response
  const reflection = lastResult?.lunaResponse ?? latestLunaResponse;

  return (
    <div className="app-card p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/92">
        <PenLine className="h-4 w-4 text-luna-aurora-lilac" aria-hidden="true" />
        Saved reflection
      </div>
      <p className="text-sm leading-6 text-white/76">
        {reflection
          ? `"${reflection}"`
          : 'After your next check-in, Luna\u2019s reflection will be saved here.'}
      </p>
      <Link href="/haikus" className="mt-3 inline-flex text-sm font-semibold text-luna-aurora-mint hover:text-white">
        View saved
      </Link>
    </div>
  );
}

function ReportReadinessMeter({
  percentage,
  count,
}: {
  percentage: number;
  count: number;
}) {
  return (
    <div className="app-card p-5 text-left">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-white/92">
          <FileText className="h-4 w-4 text-luna-aurora-mint" aria-hidden="true" />
          Report readiness
        </div>
        <span className="text-sm font-semibold text-white">{percentage}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-luna-aurora-mint"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-3 text-xs leading-5 text-white/60">
        {count >= 14
          ? 'Ready for a useful clinician summary.'
          : `${Math.max(0, 14 - count)} more check-${14 - count === 1 ? 'in' : 'ins'} for a stronger clinician summary.`}
      </p>
    </div>
  );
}

function WeeklyRecapCard({ recap }: { recap: string | null }) {
  return (
    <div className="app-card p-5 text-left">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/92">
        <Sparkles className="h-4 w-4 text-luna-aurora-lilac" aria-hidden="true" />
        Weekly recap
      </div>
      <p className="whitespace-pre-line text-sm leading-6 text-white/72">
        {recap ?? 'Luna is preparing a grounded recap from this week\u2019s logs.'}
      </p>
    </div>
  );
}

function CheckInTimeline({ logs }: { logs: TimelineLog[] }) {
  return (
    <div className="app-card p-5 sm:p-6">
      <div className="app-section-title">
        <div>
          <h2>Recent check-ins</h2>
          <p>Your saved timeline from symptom logs</p>
        </div>
      </div>
      {logs.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-5 w-5" aria-hidden="true" />}
          title="No saved check-ins yet"
          description="Your check-ins will appear here as a simple timeline."
          requirement="1 check-in starts the timeline. 14 make reports more useful."
          actionLabel="Start check-in"
          actionHref="/dashboard?checkin=true"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {logs.map((log) => (
            <article key={log.id} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/68">
                  {formatTimelineDate(log.created_at)}
                </p>
                {log.weather_score && (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/82">
                    {log.weather_score}/10
                  </span>
                )}
              </div>
              <p className="text-sm leading-6 text-white/82">
                {log.ai_summary ?? log.luna_response ?? 'Check-in saved.'}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {log.mood && <TimelinePill label={capitalize(log.mood)} />}
                {log.energy_level && <TimelinePill label={`Energy ${log.energy_level}`} />}
                {log.sleep_quality && <TimelinePill label={`Sleep ${log.sleep_quality}`} />}
                {log.triggers?.slice(0, 2).map((trigger) => (
                  <TimelinePill key={trigger} label={trigger} />
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function TimelinePill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.045] px-2 py-0.5 text-xs text-white/70">
      {label}
    </span>
  );
}

function formatTimelineDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function buildSmartSuggestion({
  isFirstTime,
  topTrigger,
  sleep,
  energy,
  severity,
}: {
  isFirstTime: boolean;
  topTrigger: string | null;
  sleep: number | null;
  energy: number | null;
  severity: number | null;
}) {
  if (isFirstTime) {
    return {
      title: 'Start simple',
      body: 'One short check-in is enough to begin your Today view and help Luna learn what support fits.',
      href: '/dashboard?checkin=true',
      action: 'Check in now',
    };
  }

  if (sleep !== null && sleep <= 5) {
    return {
      title: 'Protect tonight’s recovery',
      body: 'Your sleep signal is low. Keep the evening plan gentle and note any wake reasons tomorrow.',
      href: '/plans',
      action: 'Open sleep plan',
    };
  }

  if (severity !== null && severity >= 7) {
    return {
      title: 'Use a relief reset',
      body: 'Severity is running high. Pick one cooling, breathing, or quiet reset before adding more tasks.',
      href: '/plans',
      action: 'Open relief tools',
    };
  }

  if (energy !== null && energy <= 5) {
    return {
      title: 'Keep the day low-friction',
      body: 'Energy looks limited. Choose one priority and support it with steady food and a short pause.',
      href: '/meals',
      action: 'Open meal nudges',
    };
  }

  if (topTrigger) {
    return {
      title: `Plan around ${topTrigger}`,
      body: 'This pattern is showing up enough to deserve a little preparation instead of willpower.',
      href: '/track',
      action: 'Review pattern',
    };
  }

  return {
    title: 'Keep continuity',
    body: 'Your next check-in will make the weekly picture clearer and keep Luna’s recommendations grounded.',
    href: '/dashboard?checkin=true',
    action: 'Add today’s signal',
  };
}

function bestDayLabel(days: InsightsPayload['days']): string {
  const best = [...days]
    .filter((day) => day.avg_weather_score !== null)
    .sort((a, b) => (b.avg_weather_score ?? 0) - (a.avg_weather_score ?? 0))[0];

  if (!best) return 'Patterns will appear after a few check-ins.';

  const date = new Date(`${best.log_date}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return `Best weather: ${date} at ${best.avg_weather_score}/10.`;
}

function TodayMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="min-h-[76px] rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3 text-left"
    >
      <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-white/50">
        {icon}
        {label}
      </span>
      <span className="mt-2 block text-sm font-semibold leading-5 text-white/92">
        {value}
      </span>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  description,
  onClick,
  primary = false,
}: {
  icon: LucideIcon;
  label: string;
  description: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-16 items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
        primary
          ? 'border-luna-aurora-mint/30 bg-luna-aurora-mint/10 text-white hover:bg-luna-aurora-mint/15'
          : 'border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.07]'
      }`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
        primary ? 'bg-luna-aurora-mint/20 text-luna-aurora-mint' : 'bg-white/8 text-white/70'
      }`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-sm font-semibold leading-5 text-white/92">{label}</span>
        <span className="block text-xs leading-5 text-white/58">
          {description}
        </span>
      </span>
    </button>
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
