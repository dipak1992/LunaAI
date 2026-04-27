'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';
import Logo from '@/components/brand/Logo';
import type { UpgradeFeature } from '@/lib/hooks/useUpgradeModal';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  feature?: UpgradeFeature;
}

const FEATURE_COPY: Record<UpgradeFeature, { title: string; message: string }> = {
  checkin: {
    title: 'Your weekly check-ins are complete.',
    message:
      'New Moon includes 3 voice check-ins each week. Full Moon opens unlimited space to speak with Luna.',
  },
  chat: {
    title: 'A pause in the conversation.',
    message:
      "You have reached today's gentle chat limit. Full Moon opens unlimited space for Luna to listen.",
  },
  forecast: {
    title: 'The sky is just ahead.',
    message: 'Full Moon unlocks your 7-day forecast, so storms never arrive unannounced.',
  },
  memory: {
    title: 'Luna remembers more with you.',
    message: 'Full Moon gives Luna long-term memory across every season of your story.',
  },
  report: {
    title: "For your doctor's ears.",
    message: 'Aurora generates polished reports you can share with your clinician.',
  },
};

export default function UpgradeModal({
  open,
  onClose,
  title,
  message,
  feature = 'chat',
}: UpgradeModalProps) {
  const [loadingTier, setLoadingTier] = useState<'full_moon' | 'aurora' | null>(null);
  const copy = FEATURE_COPY[feature];
  const displayTitle = title ?? copy.title;
  const displayMessage = message ?? copy.message;

  const upgrade = async (tier: 'full_moon' | 'aurora') => {
    setLoadingTier(tier);

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, cycle: 'monthly' }),
      });

      if (res.status === 401) {
        window.location.href = '/login?redirect=/pricing';
        return;
      }

      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }

      console.error(data.error ?? 'Checkout failed');
      setLoadingTier(null);
    } catch (err) {
      console.error(err);
      setLoadingTier(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-luna-ink/80 px-4 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-luna-night p-6 text-luna-cream shadow-2xl"
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            transition={{ duration: 0.25 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background:
                  'radial-gradient(circle at 20% 10%, rgba(255,154,174,0.35), transparent 30%), radial-gradient(circle at 80% 20%, rgba(143,184,232,0.28), transparent 30%)',
              }}
            />

            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 rounded-full p-2 text-luna-whisper/50 transition-colors hover:bg-white/5 hover:text-luna-cream"
              aria-label="Close upgrade prompt"
            >
              <X size={18} />
            </button>

            <div className="relative">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <Logo size={36} animated={false} iconOnly />
              </div>

              <h2 className="font-serif text-3xl font-light leading-tight text-luna-cream">
                {displayTitle}
              </h2>
              <p className="mt-4 text-sm leading-6 text-luna-whisper/65">{displayMessage}</p>

              <div className="mt-8 space-y-3">
                <button
                  type="button"
                  onClick={() => upgrade('full_moon')}
                  disabled={loadingTier !== null}
                  className="w-full rounded-full bg-gradient-to-r from-luna-aurora-pink via-luna-aurora-lilac to-luna-aurora-blue px-6 py-4 text-sm font-medium text-luna-ink transition-transform hover:scale-[1.02] disabled:opacity-60"
                >
                  {loadingTier === 'full_moon' ? 'Opening...' : 'Full Moon - $19/mo'}
                </button>

                <button
                  type="button"
                  onClick={() => upgrade('aurora')}
                  disabled={loadingTier !== null}
                  className="w-full rounded-full border border-luna-whisper/20 px-6 py-4 text-sm text-luna-whisper/80 transition-colors hover:border-luna-whisper/40 hover:text-luna-cream disabled:opacity-60"
                >
                  {loadingTier === 'aurora' ? 'Opening...' : 'Aurora - $39/mo'}
                </button>
              </div>

              <p className="mt-5 text-center text-xs text-luna-whisper/35">
                Cancel anytime. No hidden charges.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
