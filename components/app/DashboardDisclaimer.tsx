'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Phone } from 'lucide-react';
import { useState } from 'react';
import CrisisModal from '@/components/safety/CrisisModal';

export default function DashboardDisclaimer() {
  const [crisisOpen, setCrisisOpen] = useState(false);

  return (
    <>
      <motion.footer
        className="relative z-10 border-t border-white/5 bg-luna-ink/80 px-6 pb-28 pt-6 text-center text-xs text-luna-whisper/45 backdrop-blur-xl sm:py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="mx-auto flex max-w-3xl items-center justify-center gap-2 leading-6">
          <Heart size={13} className="text-luna-aurora-pink/70" />
          Luna is your companion, not your doctor. She listens and reflects, but for
          medical decisions, always turn to a trusted clinician.
        </p>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setCrisisOpen(true)}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-luna-aurora-pink"
          >
            <Phone size={12} />
            In crisis? Get help now
          </button>
          <span>·</span>
          <Link href="/privacy" className="transition-colors hover:text-luna-cream">
            Privacy
          </Link>
          <span>·</span>
          <Link href="/terms" className="transition-colors hover:text-luna-cream">
            Terms
          </Link>
        </p>
      </motion.footer>

      <CrisisModal open={crisisOpen} onClose={() => setCrisisOpen(false)} />
    </>
  );
}
