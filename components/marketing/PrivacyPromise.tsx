'use client';

import Link from 'next/link';
import { EyeOff, Lock, MicOff, Shield, Trash2 } from 'lucide-react';
import FadeUp from '@/components/ui/FadeUp';

const PROMISES = [
  {
    icon: MicOff,
    label: 'Your voice never trains our AI',
    description:
      "Recordings are transcribed, then deleted within 24 hours. We don't use your words to train any model — ever.",
  },
  {
    icon: Shield,
    label: 'Encrypted end-to-end',
    description:
      'Your check-ins, haikus, and memories are encrypted at rest and in transit. Only you can read them.',
  },
  {
    icon: Trash2,
    label: 'Yours to delete, anytime',
    description:
      'One tap erases everything. No forms, no emails, no waiting. Your data is yours.',
  },
  {
    icon: EyeOff,
    label: 'Never sold, never shared',
    description:
      'No advertisers. No data brokers. No health insurers. Luna is funded by members, not by your data.',
  },
];

export default function PrivacyPromise() {
  return (
    <section className="relative px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <FadeUp>
          <div className="relative overflow-hidden rounded-2xl border border-luna-aurora-mint/20 bg-luna-cream p-10 text-center text-luna-ink shadow-2xl shadow-black/20 md:p-16">
            <div
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{
                background:
                  'radial-gradient(circle at 50% 0%, rgba(168,216,201,0.35), transparent 44%)',
              }}
              aria-hidden="true"
            />

            <div className="relative">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-luna-aurora-mint/20">
                <Lock className="h-6 w-6 text-luna-ink" aria-hidden="true" />
              </div>
              <p className="mt-6 font-sans text-xs font-semibold tracking-[0.14em] text-luna-ink/60 uppercase">
                Your Privacy, Protected
              </p>
              <h2 className="mx-auto mt-4 max-w-2xl font-serif text-3xl font-normal text-luna-ink md:text-4xl">
                What you share with Luna stays with Luna.
              </h2>

              <div className="mt-10 grid gap-6 text-left md:grid-cols-2">
                {PROMISES.map((promise, index) => (
                  <FadeUp key={promise.label} delay={index * 0.12}>
                    <div className="flex gap-4">
                      <promise.icon
                        className="mt-1 h-5 w-5 shrink-0 text-luna-storm"
                        aria-hidden="true"
                      />
                      <div>
                        <h3 className="font-sans text-base font-semibold text-luna-ink">
                          {promise.label}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-luna-ink/70">
                          {promise.description}
                        </p>
                      </div>
                    </div>
                  </FadeUp>
                ))}
              </div>

              <div className="mt-10 text-center">
                <Link
                  href="/privacy"
                  className="text-sm font-semibold text-luna-storm transition-colors hover:text-luna-ink"
                >
                  Read our full privacy commitment →
                </Link>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
