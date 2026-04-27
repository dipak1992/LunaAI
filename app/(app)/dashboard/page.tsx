'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BarChart2, MessageCircle } from 'lucide-react';
import { VoiceCheckInModal } from '@/components/dashboard/VoiceCheckInModal';
import Logo from '@/components/brand/Logo';
import ForecastStrip from '@/components/forecast/ForecastStrip';
import ManageSubscriptionButton from '@/components/subscription/ManageSubscriptionButton';
import type { VoiceCheckInResult } from '@/types/voice';

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [lastResult, setLastResult] = useState<VoiceCheckInResult | null>(null);

  const handleComplete = (result: VoiceCheckInResult) => {
    setLastResult(result);
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen aurora-bg flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Logo size={32} />
        <nav className="flex items-center gap-3">
          <Link
            href="/chat"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-white/50 hover:text-white/90 transition-all duration-200 text-sm"
          >
            <MessageCircle size={14} />
            <span>Chat</span>
          </Link>
          <Link
            href="/insights"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-white/50 hover:text-white/90 transition-all duration-200 text-sm"
          >
            <BarChart2 size={14} />
            <span>Insights</span>
          </Link>
          <ManageSubscriptionButton />
        </nav>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-4 py-12 gap-10 max-w-2xl mx-auto w-full">
        {/* Greeting */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-fraunces text-3xl md:text-4xl text-aurora mb-2">
            How are you today?
          </h1>
          <p className="text-luna-mist/50 text-sm">
            Tap the orb to begin your daily check-in with Luna
          </p>
        </motion.div>

        {/* Central orb trigger */}
        <motion.button
          onClick={() => setModalOpen(true)}
          className="voice-orb w-36 h-36 rounded-full flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-luna-pink focus-visible:ring-offset-2 focus-visible:ring-offset-luna-deep"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 200 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          aria-label="Open voice check-in"
        >
          <svg
            width={40}
            height={40}
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
            className="glass rounded-2xl p-6 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-luna-mist/40 uppercase tracking-widest">
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
            <p className="text-luna-mist/80 text-sm leading-relaxed italic font-fraunces">
              &ldquo;{lastResult.lunaResponse}&rdquo;
            </p>
            {lastResult.triggers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {lastResult.triggers.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-full text-xs bg-luna-rose/20 text-luna-rose border border-luna-rose/30"
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
