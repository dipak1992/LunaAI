'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Moon } from 'lucide-react';

/**
 * Inner component that reads search params.
 * Must be wrapped in <Suspense> at the call site.
 */
function WelcomeBannerInner({ name }: { name?: string }) {
  const searchParams = useSearchParams();
  const isWelcome = searchParams.get('welcome') === 'true';

  if (!isWelcome) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="w-full border border-white/10 rounded-2xl p-5 sm:p-6 text-center"
      style={{
        background:
          'linear-gradient(135deg, rgba(168,216,201,0.08), rgba(250,247,242,0.04))',
      }}
    >
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-white text-lg sm:text-xl mb-2"
      >
        <span className="inline-flex items-center justify-center gap-2">
          Welcome home{name ? `, ${name}` : ''}
          <Moon className="h-5 w-5 text-luna-aurora-mint" aria-hidden="true" />
        </span>
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="text-white/60 text-sm sm:text-base"
      >
        Luna remembers your first whisper. She&apos;s here whenever you need her —
        morning, midnight, or anywhere in between.
      </motion.p>
    </motion.div>
  );
}

/**
 * Shows a warm welcome banner on the dashboard when user arrives
 * from the trial flow (?welcome=true query param).
 * Wraps inner component in Suspense to satisfy Next.js static prerender.
 */
export function WelcomeBanner({ name }: { name?: string }) {
  return (
    <Suspense fallback={null}>
      <WelcomeBannerInner name={name} />
    </Suspense>
  );
}
