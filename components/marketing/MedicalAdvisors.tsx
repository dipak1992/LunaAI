'use client';

import Image from 'next/image';
import FadeUp from '@/components/ui/FadeUp';

const ADVISORS = [
  {
    // TODO: Replace with real advisor once onboarded. Verify credentials and signed permission before launch.
    name: 'Dr. [Placeholder Name], MD',
    credentials: 'Board-Certified OB-GYN • NAMS Certified Menopause Practitioner',
    image: '/images/advisors/advisor-1.svg',
    quote:
      "Women deserve more than a symptom tracker. Luna listens the way a good doctor does — with patience, memory, and context. It's the kind of support I wish I could give every patient between visits.",
    affiliation: '[Affiliation TBD]',
  },
  {
    // TODO: Replace with real advisor once onboarded. Verify credentials and signed permission before launch.
    name: 'Dr. [Placeholder Name], MD',
    credentials: 'Menopause Specialist • 15+ years clinical practice',
    image: '/images/advisors/advisor-2.svg',
    quote:
      "Menopause isn't a disease to be fixed — it's a transition to be understood. Luna honors that. Its pattern recognition helps women walk into my office already knowing their story.",
    affiliation: '[Affiliation TBD]',
  },
];

export default function MedicalAdvisors() {
  return (
    <section className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <FadeUp>
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <p className="mb-4 font-serif text-sm tracking-[0.14em] text-luna-aurora-lilac uppercase italic">
              Grounded in Medicine
            </p>
            <h2 className="font-serif text-4xl font-normal text-luna-cream md:text-5xl">
              Built with doctors who understand.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
              Luna is guided by OB-GYNs and menopause specialists who have helped thousands of
              women through this transition.
            </p>
          </div>
        </FadeUp>

        <div className="grid gap-8 md:grid-cols-2">
          {ADVISORS.map((advisor, index) => (
            <FadeUp key={`${advisor.name}-${index}`} delay={index * 0.2}>
              <article className="glass-card h-full rounded-2xl p-8">
                <Image
                  src={advisor.image}
                  alt={`${advisor.name}, OB-GYN`}
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-full border-2 border-luna-aurora-lilac/30 object-cover"
                  unoptimized
                />
                <div className="mt-6">
                  <h3 className="font-serif text-xl text-luna-cream">{advisor.name}</h3>
                  <p className="mt-2 text-sm text-luna-aurora-mint">{advisor.credentials}</p>
                </div>
                <blockquote className="mt-4">
                  <p className="text-base leading-relaxed text-white/85 italic">
                    &ldquo;{advisor.quote}&rdquo;
                  </p>
                  <cite className="mt-3 block text-xs not-italic text-white/60">
                    {advisor.affiliation}
                  </cite>
                </blockquote>
              </article>
            </FadeUp>
          ))}
        </div>

        <p className="mt-12 text-center text-xs text-white/50">
          Luna is a wellness companion, not a medical provider. Always consult your doctor for
          medical decisions.
        </p>
      </div>
    </section>
  );
}
