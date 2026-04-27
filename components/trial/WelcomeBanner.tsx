'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

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
      className="w-full bg-gradient-to-r from-luna-purple/15 via-luna-pink/10 to-luna-purple/15 border border-white/10 rounded-2xl p-5 sm:p-6 text-center"
    >
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-white text-lg sm:text-xl mb-2"
      >
        Welcome home{name ? `, ${name}` : ''} 🌙
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
