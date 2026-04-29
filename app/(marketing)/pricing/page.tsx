'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, FileText, Minus, Plus, ShieldCheck, Sparkles } from 'lucide-react';
import { useState } from 'react';
import Footer from '@/components/marketing/Footer';
import Header from '@/components/marketing/Header';
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

const PLAN_CUES: Record<Tier, string> = {
  free: 'Best for your first few check-ins',
  full_moon: 'Best for ongoing pattern awareness',
  aurora: 'Best for sharing and support',
};

const COMPARISON_ROWS = [
  ['Voice check-ins', '3 / week', 'Unlimited', 'Unlimited'],
  ['Daily conversations', '10 messages', 'Unlimited', 'Unlimited'],
  ['Forecasting', "Today's reading", '7-day storm forecasts', '7-day storm forecasts'],
  ['Memory', '7-day history', 'Long-term memory', 'Long-term memory'],
  ['Reports', '-', 'Weekly insights', 'Clinician-ready PDFs'],
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
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(168,216,201,0.08), transparent 42%), radial-gradient(ellipse at 15% 20%, rgba(250,247,242,0.04), transparent 32%)',
        }}
      />
      <Header />

      <section className="relative px-6 pb-14 pt-36 text-center md:pb-16 md:pt-44">
        <FadeUp>
          <p className="mb-4 text-xs uppercase tracking-[0.14em] text-white/55">Pricing</p>
          <h1 className="mx-auto max-w-3xl font-serif text-5xl leading-tight md:text-7xl">
            Choose your <span className="italic text-luna-aurora-pink">moon.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-white/68">
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

      <section className="relative px-6 pb-16">
        <div className="mx-auto grid max-w-5xl gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white/75 backdrop-blur-xl md:grid-cols-3">
          {[
            { icon: ShieldCheck, text: 'Private by design' },
            { icon: Sparkles, text: 'Built for daily clarity' },
            { icon: FileText, text: 'Reports when you need them' },
          ].map((item) => (
            <div key={item.text} className="flex items-center justify-center gap-2 rounded-xl bg-luna-ink/30 px-4 py-3">
              <item.icon className="h-4 w-4 text-luna-aurora-mint" aria-hidden="true" />
              {item.text}
            </div>
          ))}
        </div>
      </section>

      <section className="relative bg-luna-cream px-6 py-24 text-luna-ink">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-3">
          {PLANS.map((plan, index) => (
            <FadeUp key={plan.id} delay={index * 0.08}>
              <article
                className={`relative flex h-full flex-col rounded-2xl border p-7 ${
                  plan.featured
                    ? 'border-luna-storm/25 bg-white shadow-2xl shadow-luna-storm/12 ring-1 ring-luna-storm/10'
                    : 'border-luna-ink/10 bg-white/60'
                }`}
                style={plan.featured ? {
                  boxShadow: '0 28px 80px rgba(75,46,74,0.14), 0 0 0 1px rgba(75,46,74,0.06)',
                } : undefined}
              >
                {plan.featured && (
                  <div className="absolute right-5 top-5 rounded-full bg-luna-storm px-3 py-1 text-xs font-semibold text-luna-cream">
                    Most chosen
                  </div>
                )}

                <div className="pr-24">
                  <h2 className="font-serif text-3xl text-luna-ink">{plan.name}</h2>
                  <p className="mt-2 text-sm text-luna-ink/60">{plan.tagline}</p>
                </div>
                <p className="mt-5 rounded-xl bg-luna-aurora-mint/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-luna-ink/62">
                  {PLAN_CUES[plan.id]}
                </p>

                <div className="mt-8 flex items-end gap-2">
                  <span className="font-serif text-5xl text-luna-ink">${plan.price[cycle]}</span>
                  {plan.price[cycle] > 0 && (
                    <span className="pb-2 text-sm text-luna-ink/55">
                      /{cycle === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  )}
                </div>

                <ul className="mt-8 flex flex-1 flex-col gap-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm leading-6 text-luna-ink/70">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-luna-storm" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loading === plan.id}
                  className={`mt-8 rounded-full px-6 py-4 text-sm font-semibold transition-all disabled:opacity-60 ${
                    plan.featured
                      ? 'bg-luna-storm text-luna-cream shadow-lg shadow-luna-storm/10 hover:scale-[1.02] hover:bg-luna-deep'
                      : 'border border-luna-ink/15 text-luna-ink hover:border-luna-ink/30 hover:bg-luna-ink/[0.04]'
                  }`}
                >
                  {loading === plan.id ? 'Opening...' : plan.ctaLabel}
                </button>
                <p className="mt-4 text-center text-xs leading-5 text-luna-ink/55">
                  Cancel anytime. Private by design. Luna is not a medical device.
                </p>
              </article>
            </FadeUp>
          ))}
        </div>
      </section>

      <section className="relative bg-luna-cream px-6 pb-28 text-luna-ink">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-luna-ink/10 bg-white shadow-2xl shadow-luna-storm/10">
          <div className="grid border-b border-luna-ink/10 bg-luna-aurora-mint/12 px-5 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-luna-ink/60 md:grid-cols-4">
            <span>Compare</span>
            {PLANS.map((plan) => (
              <span key={plan.id} className="hidden md:block">{plan.name}</span>
            ))}
          </div>
          {COMPARISON_ROWS.map(([label, free, full, aurora]) => (
            <div
              key={label}
              className="grid gap-3 border-b border-luna-ink/8 px-5 py-5 text-sm last:border-0 md:grid-cols-4 md:items-center"
            >
              <p className="font-semibold text-luna-ink">{label}</p>
              {[free, full, aurora].map((value, index) => (
                <p key={`${label}-${index}`} className={index === 1 ? 'text-luna-storm font-semibold' : 'text-luna-ink/65'}>
                  <span className="mr-2 font-semibold text-luna-ink/45 md:hidden">
                    {PLANS[index]?.name}:
                  </span>
                  {value}
                </p>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="relative px-6 py-28">
        <div className="mx-auto max-w-3xl">
          <FadeUp>
            <div className="mb-8 text-center">
              <p className="mb-3 text-xs uppercase tracking-[0.14em] text-white/55">Questions</p>
              <h2 className="font-serif text-4xl">
                Gently <span className="italic text-white/60">answered.</span>
              </h2>
            </div>
          </FadeUp>

          <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03]">
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
