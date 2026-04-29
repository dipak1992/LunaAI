'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Bookmark } from 'lucide-react';
import HaikuCard from '@/components/haiku/HaikuCard';
import Logo from '@/components/brand/Logo';
import EmptyState from '@/components/ui/EmptyState';
import type { HaikuRecord } from '@/lib/haiku/generate';

export default function HaikuCollectionPage() {
  const [haikus, setHaikus] = useState<HaikuRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadCollection() {
      try {
        const res = await fetch('/api/haiku/collection');
        const json = (await res.json()) as { haikus?: HaikuRecord[] };
        if (!cancelled) setHaikus(json.haikus ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCollection();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="app-shell min-h-screen aurora-bg">
      <header className="flex items-center justify-between border-b border-white/5 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-white/66 transition-colors hover:text-white/88"
          >
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <Logo size={28} />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-3 text-xs uppercase tracking-[0.14em] text-white/55">
            Your collection
          </p>
          <h1 className="font-serif text-3xl text-luna-cream md:text-4xl">
            Saved <span className="italic text-white/72">whispers.</span>
          </h1>
        </motion.div>

        {loading ? (
          <div className="grid gap-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-44 animate-pulse rounded-lg border border-white/10 bg-white/[0.04]"
              />
            ))}
          </div>
        ) : haikus.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <EmptyState
              icon={<Bookmark className="h-5 w-5" aria-hidden="true" />}
              title="No whispers kept yet."
              description="Save today's haiku, and it will rest here whenever you need it."
              requirement="Complete one check-in to receive a haiku you can save."
              reassurance="Saved items are private to your account."
              actionLabel="Check in now"
              actionHref="/dashboard?checkin=true"
            />
          </motion.div>
        ) : (
          <div className="grid gap-5">
            {haikus.map((haiku, index) => (
              <motion.div
                key={haiku.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
              >
                <HaikuCard
                  id={haiku.id}
                  lines={haiku.lines}
                  date={haiku.haiku_date}
                  mood={haiku.mood}
                  saved={haiku.saved}
                  floating={false}
                  onToggleSave={(saved) => {
                    if (!saved) {
                      setHaikus((current) => current.filter((item) => item.id !== haiku.id));
                    }
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
