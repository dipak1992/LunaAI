'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import AuroraBackground from '@/components/marketing/AuroraBackground';
import Footer from '@/components/marketing/Footer';
import Header from '@/components/marketing/Header';
import StarField from '@/components/marketing/StarField';
import FadeUp from '@/components/ui/FadeUp';
import type { BillingCycle } from '@/lib/subscription/tiers';

type Tier = 'free' | 'full_moon' | 'aurora';

interface Plan {
  id: Tier;
  name: string;
  tagline: string;
  price: Record<BillingCycle, number>;
  features: string[];
  ctaLabel: string;
  featured?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'New Moon',
    tagline: 'A gentle beginning.',
    price: { monthly: 0, yearly: 0 },
    features: [
      '3 voice check-ins per week',
      '10 chat messages per day',
      "Today's weather reading",
      'Your first whispers, saved',
    ],
    ctaLabel: 'Start free',
  },
  {
    id: 'full_moon',
    name: 'Full Moon',
    tagline: 'A steady light beside you.',
    price: { monthly: 19, yearly: 180 },
    features: [
      'Unlimited voice check-ins',
      'Unlimited conversations with Luna',
      '7-day storm forecasts',
      'Long-term memory',
      'Weekly insights and pattern detection',
    ],
    ctaLabel: 'Light my path',
    featured: true,
  },
  {
    id: 'aurora',
    name: 'Aurora',
    tagline: 'The full sky, lit.',
    price: { monthly: 39, yearly: 370 },
    features: [
      'Everything in Full Moon',
      'Clinician-ready PDF reports',
      'Partner mode',
      'Priority support and early access',
      'Personalized rituals library',
    ],
    ctaLabel: 'Unlock aurora',
  },
];

const FAQS = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. You can cancel from your dashboard, and your access continues until the end of the billing period.',
  },
  {
    q: 'How private is my data?',
    a: 'Your recordings, symptoms, and conversations are protected in transit and at rest. Luna never sells your data.',
  },
  {
    q: 'Is Luna a replacement for my doctor?',
    a: 'No. Luna is a companion for reflection and pattern awareness, not a clinician or medical device.',
  },
  {
    q: 'What happens if I downgrade?',
    a: 'Your history stays with you. Free tier limits apply going forward, and you can upgrade again anytime.',
  },
  {
    q: 'Do yearly plans save money?',
    a: 'Yes. Full Moon yearly is $180 versus $228 monthly. Aurora yearly is $370 versus $468 monthly.',
  },
];

export default function PricingPage() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [loading, setLoading] = useState<Tier | null>(null);

  const handleCheckout = async (tier: Tier) => {
    if (tier === 'free') {
      window.location.href = '/signup';
      return;
    }

    setLoading(tier);

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, cycle }),
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
      setLoading(null);
    } catch (err) {
      console.error(err);
      setLoading(null);
    }
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-luna-ink text-luna-cream">
      <AuroraBackground />
      <StarField />
      <Header />

      <section className="relative px-6 pb-16 pt-36 text-center md:pb-20 md:pt-44">
        <FadeUp>
          <p className="mb-4 text-xs uppercase tracking-[0.25em] text-white/35">Pricing</p>
          <h1 className="mx-auto max-w-3xl font-serif text-5xl leading-tight md:text-7xl">
            Choose your <span className="italic text-luna-aurora-pink">moon.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-white/50">
            Simple plans for a steadier relationship with your body. Cancel anytime.
          </p>
        </FadeUp>

        <div className="mt-10 inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1">
          {(['monthly', 'yearly'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCycle(option)}
              className={`relative rounded-full px-5 py-2 text-sm transition-colors ${
                cycle === option ? 'text-luna-ink' : 'text-luna-whisper/70 hover:text-luna-cream'
              }`}
            >
              {cycle === option && (
                <motion.span
                  layoutId="billing-cycle-pill"
                  className="absolute inset-0 rounded-full bg-luna-cream"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10">
                {option === 'monthly' ? 'Monthly' : 'Yearly'}
                {option === 'yearly' && (
                  <span className="ml-2 rounded-full bg-luna-aurora-mint/30 px-2 py-0.5 text-[10px] uppercase text-luna-cream">
                    save
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="relative px-6 pb-28">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-3">
          {PLANS.map((plan, index) => (
            <FadeUp key={plan.id} delay={index * 0.08}>
              <article
                className={`relative flex h-full flex-col rounded-3xl border p-7 backdrop-blur-xl ${
                  plan.featured
                    ? 'border-luna-aurora-pink/35 bg-white/[0.08] shadow-luna'
                    : 'border-white/10 bg-white/[0.035]'
                }`}
              >
                {plan.featured && (
                  <div className="absolute right-5 top-5 rounded-full bg-luna-cream px-3 py-1 text-xs font-medium text-luna-ink">
                    Most chosen
                  </div>
                )}

                <div className="pr-24">
                  <h2 className="font-serif text-3xl">{plan.name}</h2>
                  <p className="mt-2 text-sm text-white/45">{plan.tagline}</p>
                </div>

                <div className="mt-8 flex items-end gap-2">
                  <span className="font-serif text-5xl">${plan.price[cycle]}</span>
                  {plan.price[cycle] > 0 && (
                    <span className="pb-2 text-sm text-white/45">
                      /{cycle === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  )}
                </div>

                <ul className="mt-8 flex flex-1 flex-col gap-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm leading-6 text-white/65">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-luna-aurora-mint" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loading === plan.id}
                  className={`mt-8 rounded-full px-6 py-4 text-sm font-medium transition-all disabled:opacity-60 ${
                    plan.featured
                      ? 'bg-gradient-to-r from-luna-aurora-pink via-luna-aurora-lilac to-luna-aurora-blue text-luna-ink hover:scale-[1.02]'
                      : 'border border-white/15 text-luna-cream hover:border-white/30 hover:bg-white/[0.04]'
                  }`}
                >
                  {loading === plan.id ? 'Opening...' : plan.ctaLabel}
                </button>
              </article>
            </FadeUp>
          ))}
        </div>
      </section>

      <section className="relative px-6 pb-28">
        <div className="mx-auto max-w-3xl">
          <FadeUp>
            <div className="mb-8 text-center">
              <p className="mb-3 text-xs uppercase tracking-[0.25em] text-white/30">Questions</p>
              <h2 className="font-serif text-4xl">
                Gently <span className="italic text-white/60">answered.</span>
              </h2>
            </div>
          </FadeUp>

          <div className="divide-y divide-white/10 rounded-3xl border border-white/10 bg-white/[0.03]">
            {FAQS.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-sm text-luna-cream"
      >
        <span>{q}</span>
        {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-sm leading-6 text-white/50">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
