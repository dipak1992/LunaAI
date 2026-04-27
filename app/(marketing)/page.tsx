'use client';

import { motion } from 'framer-motion';
import { Mic, Sparkles, CloudSun, Heart, Check } from 'lucide-react';
import { useState } from 'react';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import AuroraBackground from '@/components/marketing/AuroraBackground';
import StarField from '@/components/marketing/StarField';
import GlowButton from '@/components/ui/GlowButton';
import FadeUp from '@/components/ui/FadeUp';

const FEATURES = [
  {
    icon: Mic,
    title: 'Voice-first',
    desc: 'No forms. No sliders. Just speak — Luna listens like a friend who remembers.',
  },
  {
    icon: CloudSun,
    title: 'Weather, not data',
    desc: 'Your body becomes a climate to read, not a spreadsheet to decode.',
  },
  {
    icon: Sparkles,
    title: 'Storm forecasts',
    desc: 'Gentle foresight for the days ahead — so nothing catches you unprepared.',
  },
  {
    icon: Heart,
    title: 'She remembers',
    desc: 'Every whisper builds a story only you and Luna share. Always yours.',
  },
];

const STEPS = [
  {
    icon: Mic,
    title: 'Speak',
    desc: 'Hold the orb. Whisper how you feel.',
  },
  {
    icon: Sparkles,
    title: 'Luna listens',
    desc: "She hears what you say, and what you don't.",
  },
  {
    icon: CloudSun,
    title: 'Understand your weather',
    desc: 'See your season. Prepare for tomorrow.',
  },
];

const WHISPERS = [
  {
    text: 'For the first time, I felt heard without having to explain.',
    name: 'Sofía, 47',
    rotate: -3,
  },
  {
    text: 'Luna told me a storm was coming. She was right — and I was ready.',
    name: 'Anya, 52',
    rotate: 2,
  },
  {
    text: "It's not an app. It's someone who remembers me on hard days.",
    name: 'Marie, 49',
    rotate: -1,
  },
];

const PLANS = [
  {
    name: 'New Moon',
    price: 'Free',
    period: undefined,
    cta: 'Start free',
    href: '/signup',
    features: ['Voice journal', 'Basic weather reads', '7-day memory'],
    featured: false,
  },
  {
    name: 'Full Moon',
    price: '$19',
    period: '/mo',
    cta: 'Light my path',
    href: '/signup',
    features: [
      'Everything in New Moon',
      'Storm forecasts',
      'Unlimited memory',
      'Weekly insights',
    ],
    featured: true,
  },
  {
    name: 'Aurora',
    price: '$39',
    period: '/mo',
    cta: 'Unlock aurora',
    href: '/signup',
    features: [
      'Everything in Full Moon',
      'Partner mode',
      'Clinician exports',
      'Priority care',
    ],
    featured: false,
  },
];

export default function LandingPage() {
  const [orbPressed, setOrbPressed] = useState(false);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-luna-ink text-luna-cream">
      <AuroraBackground />
      <StarField />
      <Header />

      {/* ── HERO ── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
        {/* Breathing orb */}
        <motion.div
          className="relative mb-16 flex h-40 w-40 items-center justify-center rounded-full md:h-56 md:w-56"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
        >
          {/* Outer glow rings */}
          <div
            className="absolute inset-0 rounded-full opacity-30 blur-2xl"
            style={{
              background:
                'radial-gradient(circle, #C8A8E9 0%, #FF9AAE 50%, transparent 100%)',
            }}
          />
          <div
            className="absolute inset-4 rounded-full opacity-60"
            style={{
              background:
                'radial-gradient(circle at 35% 35%, #FFD4A3 0%, #FF9AAE 40%, #C8A8E9 70%, #8FB8E8 100%)',
              boxShadow:
                '0 0 60px rgba(200,168,233,0.5), 0 0 120px rgba(255,154,174,0.3), inset 0 0 30px rgba(255,255,255,0.2)',
            }}
          />
          <Mic className="relative z-10 h-8 w-8 text-white/80" />
        </motion.div>

        <FadeUp delay={0.1}>
          <p className="mb-4 text-xs tracking-[0.25em] uppercase text-white/40">
            Introducing Luna
          </p>
        </FadeUp>

        <FadeUp delay={0.25}>
          <h1 className="mb-6 max-w-3xl font-serif text-5xl font-light leading-tight md:text-7xl">
            Your body&rsquo;s{' '}
            <span
              className="italic"
              style={{
                background:
                  'linear-gradient(135deg, #FF9AAE 0%, #C8A8E9 50%, #8FB8E8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              weather forecast,
            </span>{' '}
            decoded.
          </h1>
        </FadeUp>

        <FadeUp delay={0.4}>
          <p className="mb-10 max-w-xl text-lg text-white/50 font-light leading-relaxed">
            Menopause isn&rsquo;t a problem to solve. It&rsquo;s a season to understand.
          </p>
        </FadeUp>

        <FadeUp delay={0.55}>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <GlowButton href="/signup" variant="primary">
              Begin your story — free
            </GlowButton>
            <GlowButton href="#how" variant="ghost">
              Watch the 60-second film →
            </GlowButton>
          </div>
        </FadeUp>

        {/* Scroll hint */}
        <motion.p
          className="absolute bottom-8 text-xs tracking-[0.2em] text-white/20"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          scroll gently ↓
        </motion.p>
      </section>

      {/* ── WHY IT'S DIFFERENT ── */}
      <section id="story" className="relative px-6 py-32">
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <div className="mb-16 text-center">
              <p className="mb-4 text-xs tracking-[0.25em] uppercase text-white/30">
                Why Luna
              </p>
              <h2 className="font-serif text-4xl font-light md:text-5xl">
                Not another tracker.{' '}
                <span className="italic text-white/60">A companion.</span>
              </h2>
            </div>
          </FadeUp>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <FadeUp key={f.title} delay={i * 0.1}>
                <div className="group rounded-3xl border border-white/5 bg-white/[0.03] p-8 backdrop-blur-sm transition-all duration-500 hover:border-white/10 hover:bg-white/[0.05]">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">
                    <f.icon className="h-5 w-5 text-white/60" />
                  </div>
                  <h3 className="mb-3 font-serif text-xl font-light">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-white/40">{f.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="relative px-6 py-32">
        <div className="mx-auto max-w-4xl">
          <FadeUp>
            <div className="mb-20 text-center">
              <p className="mb-4 text-xs tracking-[0.25em] uppercase text-white/30">
                How it works
              </p>
              <h2 className="font-serif text-4xl font-light md:text-5xl">
                Three gentle steps.
              </h2>
            </div>
          </FadeUp>

          <div className="flex flex-col gap-12 md:flex-row md:gap-8">
            {STEPS.map((s, i) => (
              <FadeUp key={s.title} delay={i * 0.15} className="flex-1">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div
                      className="flex h-20 w-20 items-center justify-center rounded-full"
                      style={{
                        background:
                          'linear-gradient(135deg, rgba(200,168,233,0.2) 0%, rgba(143,184,232,0.2) 100%)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      <s.icon className="h-7 w-7 text-white/70" />
                    </div>
                    <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs text-white/50">
                      {i + 1}
                    </span>
                  </div>
                  <p className="mb-1 text-xs tracking-[0.2em] uppercase text-white/30">
                    Step {i + 1}
                  </p>
                  <h3 className="mb-3 font-serif text-2xl font-light">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-white/40">{s.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── VOICE DEMO ── */}
      <section className="relative px-6 py-32">
        <div className="mx-auto max-w-2xl text-center">
          <FadeUp>
            <p className="mb-4 text-xs tracking-[0.25em] uppercase text-white/30">
              Try the whisper
            </p>
            <h2 className="mb-16 font-serif text-4xl font-light md:text-5xl">
              Press &amp; hold to whisper to Luna.
            </h2>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div className="flex justify-center">
              <motion.button
                type="button"
                onMouseDown={() => setOrbPressed(true)}
                onMouseUp={() => setOrbPressed(false)}
                onMouseLeave={() => setOrbPressed(false)}
                onTouchStart={() => setOrbPressed(true)}
                onTouchEnd={() => setOrbPressed(false)}
                whileTap={{ scale: 0.95 }}
                animate={orbPressed ? { scale: 1.05 } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative flex h-48 w-48 items-center justify-center rounded-full md:h-64 md:w-64"
                aria-label="Hold to whisper to Luna"
              >
                {/* Pulsing rings when pressed */}
                {orbPressed && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: '1px solid rgba(200,168,233,0.4)' }}
                      animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: '1px solid rgba(200,168,233,0.3)' }}
                      animate={{ scale: [1, 1.7], opacity: [0.4, 0] }}
                      transition={{ duration: 1.5, delay: 0.4, repeat: Infinity }}
                    />
                  </>
                )}
                <div
                  className="absolute inset-0 rounded-full transition-all duration-500"
                  style={{
                    background: orbPressed
                      ? 'radial-gradient(circle at 35% 35%, #FFD4A3 0%, #FF9AAE 35%, #C8A8E9 65%, #8FB8E8 100%)'
                      : 'radial-gradient(circle at 35% 35%, rgba(255,212,163,0.6) 0%, rgba(255,154,174,0.6) 35%, rgba(200,168,233,0.6) 65%, rgba(143,184,232,0.6) 100%)',
                    boxShadow: orbPressed
                      ? '0 0 80px rgba(200,168,233,0.6), 0 0 160px rgba(255,154,174,0.3)'
                      : '0 0 40px rgba(200,168,233,0.3)',
                  }}
                />
                <Mic
                  className={`relative z-10 h-10 w-10 transition-colors duration-300 ${
                    orbPressed ? 'text-white' : 'text-white/60'
                  }`}
                />
              </motion.button>
            </div>
          </FadeUp>

          <FadeUp delay={0.3}>
            <p className="mt-8 text-xs text-white/25 italic">
              (real listening begins when you sign in)
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── WHISPER WALL ── */}
      <section id="whispers" className="relative px-6 py-32">
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <div className="mb-16 text-center">
              <p className="mb-4 text-xs tracking-[0.25em] uppercase text-white/30">
                Whispers
              </p>
              <h2 className="font-serif text-4xl font-light md:text-5xl">
                From women who&rsquo;ve{' '}
                <span className="italic text-white/60">been heard.</span>
              </h2>
            </div>
          </FadeUp>

          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-center">
            {WHISPERS.map((w, i) => (
              <FadeUp key={w.name} delay={i * 0.15}>
                <div
                  className="max-w-xs rounded-2xl border border-luna-sunset/20 bg-luna-cream p-8 text-luna-ink"
                  style={{
                    transform: `rotate(${w.rotate}deg)`,
                    boxShadow:
                      '0 4px 24px rgba(0,0,0,0.2), 0 20px 60px rgba(0,0,0,0.3)',
                  }}
                >
                  <p className="mb-4 font-serif text-lg font-light italic leading-relaxed text-luna-ink">
                    &ldquo;{w.text}&rdquo;
                  </p>
                  <p className="text-xs tracking-[0.15em] text-luna-ink/55">— {w.name}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="relative px-6 py-32">
        <div className="mx-auto max-w-5xl">
          <FadeUp>
            <div className="mb-16 text-center">
              <p className="mb-4 text-xs tracking-[0.25em] uppercase text-white/30">
                Pricing
              </p>
              <h2 className="font-serif text-4xl font-light md:text-5xl">
                Choose your moon.
              </h2>
            </div>
          </FadeUp>

          <div className="grid gap-6 md:grid-cols-3">
            {PLANS.map((p, i) => (
              <FadeUp key={p.name} delay={i * 0.1}>
                <div
                  className={`relative flex flex-col rounded-3xl p-8 transition-all duration-500 ${
                    p.featured
                      ? 'border border-white/20 bg-white/[0.07]'
                      : 'border border-white/5 bg-white/[0.03]'
                  }`}
                >
                  {p.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1 text-xs tracking-wide text-white/70">
                      Most chosen
                    </span>
                  )}

                  <p className="mb-2 text-xs tracking-[0.2em] uppercase text-white/40">
                    {p.name}
                  </p>
                  <div className="mb-6 flex items-baseline gap-1">
                    <span className="font-serif text-4xl font-light">{p.price}</span>
                    {p.period && (
                      <span className="text-sm text-white/40">{p.period}</span>
                    )}
                  </div>

                  <ul className="mb-8 flex-1 space-y-3">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm text-white/60">
                        <Check className="h-4 w-4 shrink-0 text-white/30" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <GlowButton
                    href={p.href}
                    variant={p.featured ? 'primary' : 'ghost'}
                    className="w-full justify-center"
                  >
                    {p.cta}
                  </GlowButton>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative overflow-hidden px-6 py-40 text-center">
        {/* Candle glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[100px]"
          style={{
            background:
              'radial-gradient(circle, #FFD4A3 0%, #FF9AAE 40%, #C8A8E9 70%, transparent 100%)',
          }}
        />

        <FadeUp>
          <h2 className="relative mb-8 font-serif text-5xl font-light leading-tight md:text-6xl lg:text-7xl">
            Your story is waiting{' '}
            <br className="hidden md:block" />
            to be{' '}
            <span
              className="italic"
              style={{
                background:
                  'linear-gradient(135deg, #FF9AAE 0%, #C8A8E9 50%, #8FB8E8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              understood.
            </span>
          </h2>
        </FadeUp>

        <FadeUp delay={0.2}>
          <GlowButton href="/signup" variant="primary">
            Begin — it&rsquo;s free
          </GlowButton>
        </FadeUp>

        <FadeUp delay={0.35}>
          <p className="mt-6 text-xs text-white/25">
            No credit card. No noise. Just you, heard.
          </p>
        </FadeUp>
      </section>

      <Footer />
    </main>
  );
}
