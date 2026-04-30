import type { ReactNode } from 'react';
import Link from 'next/link';
import AuroraBackground from './AuroraBackground';
import StarField from './StarField';
import Footer from './Footer';
import Header from './Header';
import FadeUp from '@/components/ui/FadeUp';
import GlowButton from '@/components/ui/GlowButton';

interface MarketingPageProps {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  children: ReactNode;
  lastUpdated?: string;
  hideCta?: boolean;
}

export default function MarketingPage({
  eyebrow,
  title,
  subtitle,
  children,
  lastUpdated,
  hideCta = false,
}: MarketingPageProps) {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-luna-ink text-luna-cream">
      <AuroraBackground />
      <StarField />
      <Header />

      <section className="relative px-6 pb-16 pt-36 text-center md:pb-20 md:pt-44">
        <FadeUp>
          <p className="mb-4 text-xs uppercase tracking-[0.14em] text-white/55">{eyebrow}</p>
          <h1 className="mx-auto max-w-3xl font-serif text-5xl leading-tight md:text-7xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/65">
              {subtitle}
            </p>
          )}
          {lastUpdated && (
            <p className="mt-5 text-xs uppercase tracking-[0.14em] text-white/50">
              Last updated: {lastUpdated}
            </p>
          )}
        </FadeUp>
      </section>

      <section className="relative px-6 pb-28">
        <FadeUp>
          <article className="prose-luna prose-luna-light mx-auto max-w-3xl rounded-2xl border border-[#eadfd5] bg-luna-cream px-6 py-8 text-luna-ink shadow-2xl shadow-black/20 md:px-10 md:py-12">
            {children}
          </article>
        </FadeUp>
      </section>

      {/* CTA section before footer */}
      {!hideCta && (
        <section className="relative px-6 py-20 text-center">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, rgba(200,168,233,0.06) 0%, transparent 60%)',
            }}
          />
          <FadeUp>
            <h2 className="mx-auto max-w-xl font-serif text-3xl md:text-4xl">
              Ready to begin?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-white/60">
              Your first check-in is free. No credit card needed.
            </p>
            <div className="mt-8">
              <GlowButton href="/trial" variant="primary">
                Try Luna Free
              </GlowButton>
            </div>
          </FadeUp>
        </section>
      )}

      <Footer />
    </main>
  );
}
