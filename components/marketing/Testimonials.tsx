'use client';

import { DatabaseZap, LockKeyhole, ShieldCheck, Stethoscope } from 'lucide-react';
import FadeUp from '@/components/ui/FadeUp';

const TRUST_POINTS = [
  {
    icon: LockKeyhole,
    title: 'Private check-ins',
    desc: 'Voice and text reflections are treated as sensitive health context from the first interaction.',
  },
  {
    icon: DatabaseZap,
    title: 'No ad-funded model',
    desc: 'Luna is designed around member trust, not selling attention or health data to third parties.',
  },
  {
    icon: Stethoscope,
    title: 'Clinician-aware boundaries',
    desc: 'The product stays in reflection, tracking, and preparation. It does not present itself as a doctor.',
  },
];

export default function Testimonials() {
  return (
    <section className="relative bg-luna-cream px-6 py-24 text-luna-ink md:py-32">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse at 18% 8%, rgba(168,216,201,0.28), transparent 42%), radial-gradient(ellipse at 82% 20%, rgba(255,212,163,0.18), transparent 38%)',
        }}
      />
      <div className="relative z-10 mx-auto max-w-6xl">
        <FadeUp>
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-luna-aurora-mint/20">
              <ShieldCheck className="h-6 w-6 text-luna-storm" aria-hidden="true" />
            </div>
            <p className="mb-4 text-sm tracking-[0.14em] text-luna-ink/55 uppercase">
              Verified Trust Only
            </p>
            <h2 className="font-serif text-4xl font-normal text-luna-ink md:text-5xl">
              Built for sensitive health moments.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-luna-ink/70">
              We will add testimonials only after real user quotes are collected with written
              permission. Until then, trust comes from product boundaries, privacy, and clarity.
            </p>
          </div>
        </FadeUp>

        <div className="grid gap-5 md:grid-cols-3">
          {TRUST_POINTS.map((point, index) => (
            <FadeUp key={point.title} delay={index * 0.1}>
              <article className="h-full rounded-2xl border border-luna-ink/10 bg-white p-6 shadow-xl shadow-luna-storm/8">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-luna-aurora-mint/18">
                  <point.icon className="h-5 w-5 text-luna-storm" aria-hidden="true" />
                </div>
                <h3 className="font-serif text-2xl text-luna-ink">{point.title}</h3>
                <p className="mt-3 text-sm leading-6 text-luna-ink/68">{point.desc}</p>
              </article>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
