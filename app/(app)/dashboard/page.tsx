'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BarChart2, BookMarked, MessageCircle, Settings, Menu, X } from 'lucide-react';
import { VoiceCheckInModal } from '@/components/dashboard/VoiceCheckInModal';
import Logo from '@/components/brand/Logo';
import ForecastStrip from '@/components/forecast/ForecastStrip';
import TodayHaiku from '@/components/haiku/TodayHaiku';
import SeasonReportButton from '@/components/reports/SeasonReportButton';
import SoundToggle from '@/components/settings/SoundToggle';
import { createClient } from '@/lib/supabase/client';
import type { VoiceCheckInResult } from '@/types/voice';

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [lastResult, setLastResult] = useState<VoiceCheckInResult | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Try profile name first, then user_metadata
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();
        const name = profile?.name || user.user_metadata?.name || '';
        setUserName(name);
      }
    }
    fetchUser();
  }, []);

  const handleComplete = (result: VoiceCheckInResult) => {
    setLastResult(result);
    setModalOpen(false);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen aurora-bg flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5">
        <Logo size={28} />

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-2">
          <Link
            href="/chat"
            className="flex items-center gap-1.5 px-3 py-2 rounded-full glass text-white/80 hover:text-white transition-all duration-200 text-[0.9375rem]"
          >
            <MessageCircle size={16} />
            <span>Chat</span>
          </Link>
          <Link
            href="/insights"
            className="flex items-center gap-1.5 px-3 py-2 rounded-full glass text-white/80 hover:text-white transition-all duration-200 text-[0.9375rem]"
          >
            <BarChart2 size={16} />
            <span>Insights</span>
          </Link>
          <Link
            href="/haikus"
            className="flex items-center gap-1.5 px-3 py-2 rounded-full glass text-white/80 hover:text-white transition-all duration-200 text-[0.9375rem]"
          >
            <BookMarked size={16} />
            <span>Haikus</span>
          </Link>
          <SoundToggle />
          <Link
            href="/settings"
            className="flex items-center gap-1.5 px-3 py-2 rounded-full glass text-white/80 hover:text-white transition-all duration-200 text-[0.9375rem]"
            aria-label="Settings"
          >
            <Settings size={16} />
            <span>Settings</span>
          </Link>
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
          <Link
            href="/chat"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full glass text-white/80 hover:text-white text-[0.9375rem]"
          >
            <MessageCircle size={16} />
            Chat
          </Link>
          <Link
            href="/insights"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full glass text-white/80 hover:text-white text-[0.9375rem]"
          >
            <BarChart2 size={16} />
            Insights
          </Link>
          <Link
            href="/haikus"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full glass text-white/80 hover:text-white text-[0.9375rem]"
          >
            <BookMarked size={16} />
            Haikus
          </Link>
          <Link
            href="/settings"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full glass text-white/80 hover:text-white text-[0.9375rem]"
          >
            <Settings size={16} />
            Settings
          </Link>
          <SoundToggle />
        </motion.nav>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-5 py-10 sm:py-12 gap-8 sm:gap-10 max-w-2xl mx-auto w-full">
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
            How are you today?
          </h1>
          <p className="text-white/75 text-base sm:text-[1.0625rem]">
            Tap the orb to begin your daily check-in with Luna
          </p>
        </motion.div>

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

        {/* 7-day forecast */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <ForecastStrip />
        </motion.div>

        <TodayHaiku />

        <SeasonReportButton />
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
