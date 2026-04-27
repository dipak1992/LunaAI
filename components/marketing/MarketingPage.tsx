import type { ReactNode } from 'react';
import AuroraBackground from './AuroraBackground';
import Footer from './Footer';
import Header from './Header';
import FadeUp from '@/components/ui/FadeUp';

interface MarketingPageProps {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  children: ReactNode;
  lastUpdated?: string;
}

export default function MarketingPage({
  eyebrow,
  title,
  subtitle,
  children,
  lastUpdated,
}: MarketingPageProps) {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-luna-ink text-luna-cream">
      <AuroraBackground />
      <Header />

      <section className="relative px-6 pb-16 pt-36 text-center md:pb-20 md:pt-44">
        <FadeUp>
          <p className="mb-4 text-xs uppercase tracking-[0.25em] text-white/35">{eyebrow}</p>
          <h1 className="mx-auto max-w-3xl font-serif text-5xl leading-tight md:text-7xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/50">
              {subtitle}
            </p>
          )}
          {lastUpdated && (
            <p className="mt-5 text-xs uppercase tracking-[0.22em] text-white/30">
              Last updated: {lastUpdated}
            </p>
          )}
        </FadeUp>
      </section>

      <section className="relative px-6 pb-28">
        <FadeUp>
          <article className="prose-luna mx-auto max-w-3xl">{children}</article>
        </FadeUp>
      </section>

      <Footer />
    </main>
  );
}
