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
          <div className="glass-card relative overflow-hidden rounded-3xl p-10 text-center shadow-2xl shadow-luna-aurora-mint/10 md:p-16">
            <div
              className="pointer-events-none absolute inset-0 opacity-50"
              style={{
                background:
                  'radial-gradient(circle at 50% 0%, rgba(168,216,201,0.18), transparent 45%)',
              }}
              aria-hidden="true"
            />

            <div className="relative">
              <Lock className="mx-auto h-12 w-12 text-luna-aurora-mint" aria-hidden="true" />
              <p className="mt-6 font-serif text-sm tracking-widest text-luna-aurora-pink uppercase italic">
                Your Privacy, Sacred
              </p>
              <h2 className="mx-auto mt-4 max-w-2xl font-serif text-3xl font-normal text-luna-cream md:text-4xl">
                What you share with Luna stays with Luna.
              </h2>

              <div className="mt-10 grid gap-6 text-left md:grid-cols-2">
                {PROMISES.map((promise, index) => (
                  <FadeUp key={promise.label} delay={index * 0.12}>
                    <div className="flex gap-4">
                      <promise.icon
                        className="mt-1 h-5 w-5 shrink-0 text-luna-aurora-mint"
                        aria-hidden="true"
                      />
                      <div>
                        <h3 className="font-serif text-base font-medium text-luna-cream">
                          {promise.label}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-white/75">
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
                  className="text-sm font-medium text-luna-aurora-mint transition-colors hover:text-luna-cream"
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
