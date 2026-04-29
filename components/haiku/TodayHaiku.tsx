'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import HaikuCard from './HaikuCard';
import type { HaikuRecord } from '@/lib/haiku/generate';

export default function TodayHaiku() {
  const [haiku, setHaiku] = useState<HaikuRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadHaiku() {
      try {
        const res = await fetch('/api/haiku/today');
        const json = (await res.json()) as { haiku?: HaikuRecord };
        if (!cancelled && json.haiku) setHaiku(json.haiku);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadHaiku();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-4 h-3 w-28 animate-pulse rounded-full bg-white/10" />
        <div className="space-y-3">
          <div className="h-5 w-3/4 animate-pulse rounded-full bg-white/10" />
          <div className="h-5 w-5/6 animate-pulse rounded-full bg-white/10" />
          <div className="h-5 w-2/3 animate-pulse rounded-full bg-white/10" />
        </div>
      </div>
    );
  }

  if (!haiku) {
    return (
      <div className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <p className="mb-4 text-xs uppercase tracking-[0.14em] text-white/40">Today&apos;s haiku</p>
        <p className="font-serif text-sm italic leading-7 text-white/40">
          Luna will write a haiku after your first check-in today.
        </p>
      </div>
    );
  }

  return (
    <motion.section
      className="w-full"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.14em] text-luna-mist/60">Today&apos;s haiku</p>
        <Link href="/haikus" className="text-xs text-luna-mist/40 transition-colors hover:text-luna-mist/75">
          Collection
        </Link>
      </div>
      <HaikuCard
        id={haiku.id}
        lines={haiku.lines}
        date={haiku.haiku_date}
        mood={haiku.mood}
        saved={haiku.saved}
      />
    </motion.section>
  );
}
