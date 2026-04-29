'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart2, BookMarked, MessageCircle, Settings, Menu, X } from 'lucide-react';
import { VoiceCheckInModal } from '@/components/dashboard/VoiceCheckInModal';
import Logo from '@/components/brand/Logo';
import ForecastStrip from '@/components/forecast/ForecastStrip';
import TodayHaiku from '@/components/haiku/TodayHaiku';
import SeasonReportButton from '@/components/reports/SeasonReportButton';
import SoundToggle from '@/components/settings/SoundToggle';
import { createClient } from '@/lib/supabase/client';
import { WelcomeBanner } from '@/components/trial/WelcomeBanner';
import type { VoiceCheckInResult } from '@/types/voice';

const NAV_ITEMS = [
  { href: '/chat', icon: MessageCircle, label: 'Chat' },
  { href: '/insights', icon: BarChart2, label: 'Insights' },
  { href: '/haikus', icon: BookMarked, label: 'Haikus' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [lastResult, setLastResult] = useState<VoiceCheckInResult | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkInCount, setCheckInCount] = useState<number | null>(null);
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
      }
    }
    fetchUser();
  }, []);

  const handleComplete = (result: VoiceCheckInResult) => {
    setLastResult(result);
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

  return (
    <div className="min-h-screen aurora-bg flex flex-col">
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
                    : 'glass text-white/80 hover:text-white'
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
                    : 'glass text-white/80 hover:text-white'
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
      <main className="flex-1 flex flex-col items-center px-5 py-10 sm:py-12 gap-8 sm:gap-10 max-w-2xl mx-auto w-full">
        {/* Trial welcome banner (shows when ?welcome=true) */}
        <WelcomeBanner name={userName} />

        {/* Welcome + Greeting */}
        <motion.div
          className="text-center w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {userName && (
            <p className="text-white/70 text-base sm:text-lg mb-1">
              {greeting()}, <span className="text-white/90 font-medium">{userName}</span>
            </p>
          )}
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-aurora mb-2">
            {isFirstTime ? 'Your journey begins here.' : 'How are you today?'}
          </h1>
          <p className="text-white/75 text-base sm:text-[1.0625rem]">
            {isFirstTime
              ? 'Tap the orb and speak freely — Luna is listening'
              : 'Tap the orb to begin your daily check-in with Luna'}
          </p>
        </motion.div>

        {/* Streak indicator — only show after first check-in */}
        {checkInCount !== null && checkInCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/8 text-sm text-white/60"
          >
            <span className="text-base">🌙</span>
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
            className="w-full glass rounded-2xl p-6 sm:p-8 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(233,184,255,0.06) 0%, rgba(255,158,199,0.04) 100%)',
            }}
          >
            <p className="text-3xl mb-4">🌙</p>
            <h2 className="font-serif text-xl sm:text-2xl text-white mb-3">
              Luna is ready to listen.
            </h2>
            <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
              Your first whisper starts your story. She&apos;ll remember how you feel today,
              and help you understand your patterns over time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 text-xs text-white/40">
              <span>🎙️ Voice or text</span>
              <span className="hidden sm:inline">•</span>
              <span>🔒 Private & secure</span>
              <span className="hidden sm:inline">•</span>
              <span>✨ Haiku after each check-in</span>
            </div>
          </motion.div>
        )}

        {/* Central orb trigger */}
        <motion.button
          onClick={() => setModalOpen(true)}
          className="voice-orb w-32 h-32 sm:w-36 sm:h-36 rounded-full flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-luna-pink focus-visible:ring-offset-2 focus-visible:ring-offset-luna-deep"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 200 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          aria-label="Open voice check-in"
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

        {/* Last check-in result card */}
        {lastResult && (
          <motion.div
            className="glass rounded-2xl p-5 sm:p-6 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[0.875rem] text-white/70 uppercase tracking-widest">
                Latest check-in
              </p>
              <span className="text-lg">
                {lastResult.weatherScore >= 8
                  ? '☀️'
                  : lastResult.weatherScore >= 5
                  ? '⛅'
                  : '🌧️'}
              </span>
            </div>
            <p className="text-white/90 text-base leading-relaxed italic font-serif">
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
      </main>

      {/* Voice Check-In Modal */}
      <VoiceCheckInModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onComplete={handleComplete}
      />
    </div>
  );
}
