'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart2,
  BatteryMedium,
  BookMarked,
  Cloud,
  CloudSun,
  Keyboard,
  LockKeyhole,
  HeartPulse,
  Menu,
  MessageCircle,
  Mic,
  Moon,
  Settings,
  Sun,
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

const NAV_ITEMS = [
  { href: '/chat', icon: MessageCircle, label: 'Chat' },
  { href: '/insights', icon: BarChart2, label: 'Insights' },
  { href: '/haikus', icon: BookMarked, label: 'Saved' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

interface LatestLog {
  weather_score: number | null;
  mood: string | null;
  sleep_quality: number | null;
  energy_level: number | null;
  triggers: string[] | null;
  luna_response: string | null;
  created_at: string;
}

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [checkInMode, setCheckInMode] = useState<'voice' | 'text'>('voice');
  const [lastResult, setLastResult] = useState<VoiceCheckInResult | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkInCount, setCheckInCount] = useState<number | null>(null);
  const [latestLog, setLatestLog] = useState<LatestLog | null>(null);
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
          .select('weather_score, mood, sleep_quality, energy_level, triggers, luna_response, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        setLatestLog((latest as LatestLog | null) ?? null);
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
      weather_score: result.weatherScore,
      mood: result.emotionalTone,
      sleep_quality: null,
      energy_level: null,
      triggers: result.triggers,
      luna_response: result.lunaResponse,
      created_at: new Date().toISOString(),
    });
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
  const mood = lastResult?.emotionalTone ?? latestLog?.mood ?? null;
  const sleep = latestLog?.sleep_quality ?? null;
  const topTrigger = lastResult?.triggers[0] ?? latestLog?.triggers?.[0] ?? null;
  const nextAction = isFirstTime
    ? 'Start with 30 seconds'
    : topTrigger
      ? `Soothe ${topTrigger}`
      : 'Check in when ready';
  const checkInsUntilForecast = Math.max(0, 7 - (checkInCount ?? 0));

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
      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-5 px-4 pb-24 pt-5 sm:gap-6 sm:px-5 sm:py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        {/* Trial welcome banner (shows when ?welcome=true) */}
        <div className="lg:col-span-2">
          <WelcomeBanner name={userName} />
        </div>

        <section className="app-card-light p-5 shadow-2xl shadow-black/16 sm:p-6 md:p-8">
          {/* Welcome + Greeting */}
          <motion.div
            className="text-center w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {userName && (
              <p className="text-luna-ink/68 text-base sm:text-lg mb-1">
                {greeting()}, <span className="text-luna-ink font-semibold">{userName}</span>
              </p>
            )}
	            <h1 className="font-serif text-3xl sm:text-4xl text-luna-ink mb-2 sm:mb-3">
	              {isFirstTime ? 'Your journey begins here.' : 'How are you today?'}
	            </h1>
	            <p className="mx-auto max-w-md text-sm leading-6 text-luna-ink/72 sm:text-[1rem]">
	              {isFirstTime
	                ? 'Speak, type, or tap what feels true right now.'
	                : 'A quick read on today, then Luna can listen.'}
	            </p>
	          </motion.div>

          <motion.div
            className="mt-5 grid grid-cols-2 gap-2 sm:mt-6 sm:grid-cols-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
          >
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
              label="Next"
              value={nextAction}
            />
          </motion.div>

          {/* Streak indicator — only show after first check-in */}
          {checkInCount !== null && checkInCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
	              className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-full bg-luna-aurora-mint/20 px-4 py-2 text-sm text-luna-ink/74 sm:mt-6"
            >
              <Moon className="h-4 w-4 text-luna-storm" aria-hidden="true" />
              <span>
                {checkInCount === 1
                  ? 'Day 1 of your journey with Luna'
                  : `${checkInCount} whispers shared with Luna`}
              </span>
            </motion.div>
          )}

          {/* First-time empty state */}
          {isFirstTime && checkInCount !== null && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
	              className="mt-5 w-full sm:mt-8"
	            >
              <EmptyState
                tone="light"
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

          <motion.div
            className="mt-5 grid gap-2 sm:mt-7 sm:grid-cols-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.25 }}
          >
            <ActionButton
              icon={Mic}
              label="Speak check-in"
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
            <Link
              href="/chat"
              className="flex min-h-16 items-center gap-3 rounded-lg border border-luna-ink/10 bg-white/74 px-4 py-3 text-left transition-colors hover:bg-white"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-luna-storm/12 text-luna-storm">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-semibold leading-5 text-luna-ink">Ask Luna</span>
                <span className="block text-xs leading-5 text-luna-ink/60">Open chat</span>
              </span>
            </Link>
          </motion.div>

          <div className="mx-auto mt-4 flex max-w-md items-start justify-center gap-2 rounded-lg border border-luna-ink/10 bg-white/60 px-3 py-2 text-xs leading-5 text-luna-ink/66">
            <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0 text-luna-storm" aria-hidden="true" />
            <span>
              Transcript saved privately. You control your data.
              {checkInsUntilForecast > 0 && ` ${checkInsUntilForecast} more check-${checkInsUntilForecast === 1 ? 'in' : 'ins'} until forecast patterns get useful.`}
            </span>
          </div>

          {/* Central orb trigger */}
          <motion.button
            onClick={() => openCheckIn('voice')}
            className="voice-orb mx-auto mt-5 flex h-24 w-24 cursor-pointer items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-luna-aurora-pink focus-visible:ring-offset-2 focus-visible:ring-offset-luna-deep sm:mt-8 sm:h-36 sm:w-36"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            aria-label="Open check-in"
          >
          <svg
            width={36}
            height={36}
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
            />
          </svg>
          </motion.button>
        </section>

        <aside className="space-y-5 sm:space-y-6">
          {/* Last check-in result card */}
          {lastResult && (
            <motion.div
              className="app-card p-5 shadow-2xl shadow-black/10 sm:p-6 w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[0.8125rem] text-white/76 uppercase tracking-[0.14em]">
                Latest check-in
              </p>
              {lastResult.weatherScore >= 8 ? (
                <Sun className="h-5 w-5 text-luna-sunset" aria-hidden="true" />
              ) : lastResult.weatherScore >= 5 ? (
                <CloudSun className="h-5 w-5 text-luna-aurora-blue" aria-hidden="true" />
              ) : (
                <Cloud className="h-5 w-5 text-luna-aurora-lilac" aria-hidden="true" />
              )}
            </div>
            <p className="text-white/92 text-base leading-relaxed italic font-serif">
              &ldquo;{lastResult.lunaResponse}&rdquo;
            </p>
            {lastResult.triggers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {lastResult.triggers.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-full text-sm bg-luna-rose/20 text-luna-rose border border-luna-rose/30"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
            </motion.div>
          )}

          {/* 7-day forecast — only show after first check-in */}
          {!isFirstTime && (
            <motion.div
              className="w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <ForecastStrip />
            </motion.div>
          )}

          <TodayHaiku />

          {!isFirstTime && <SeasonReportButton />}
        </aside>
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
      className="min-h-[76px] rounded-lg border border-luna-ink/10 bg-white/74 px-3 py-3 text-left"
    >
      <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-luna-ink/54">
        {icon}
        {label}
      </span>
      <span className="mt-2 block text-sm font-semibold leading-5 text-luna-ink">
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
          ? 'border-luna-ink bg-luna-ink text-white hover:bg-luna-ink/88'
          : 'border-luna-ink/10 bg-white/74 text-luna-ink hover:bg-white'
      }`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
        primary ? 'bg-white/12 text-white' : 'bg-luna-aurora-mint/18 text-luna-storm'
      }`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-sm font-semibold leading-5">{label}</span>
        <span className={`block text-xs leading-5 ${primary ? 'text-white/70' : 'text-luna-ink/60'}`}>
          {description}
        </span>
      </span>
    </button>
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
