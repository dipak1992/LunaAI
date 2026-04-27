'use client';

import FadeUp from '@/components/ui/FadeUp';

const CREDIBILITY_BADGES = [
  'Member-funded',
  'Privacy-first companion',
  'Real press only',
  'Advisor review pending',
];

export default function PressStrip() {
  return (
    <section className="relative px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <FadeUp>
          <div className="text-center">
            <p className="mb-6 text-sm tracking-widest text-white/60 uppercase">
              Trusted &amp; Recognized
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {CREDIBILITY_BADGES.map((badge) => (
                <span
                  key={badge}
                  className="glass-card rounded-full px-4 py-2 text-sm text-white/80"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
