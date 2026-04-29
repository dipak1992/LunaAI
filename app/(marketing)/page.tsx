'use client';

/*
 * Hero assets needed:
 * - /public/videos/luna-hero-demo.mp4
 * - /public/videos/luna-hero-demo.vtt
 * - /public/images/luna-hero-poster.png
 *
 * TODO(video team): create the hero demo sequence:
 * 0:00–0:03 → Woman's hand taps a glowing voice orb
 * 0:03–0:07 → Voice waveform animates, subtitle: "I couldn't sleep again..."
 * 0:07–0:11 → Luna's response streams: "That's three restless nights this week. Your body is in a cloudy stretch."
 * 0:11–0:15 → 7-day weather forecast appears: "Cloudy Tue • Stormy Wed • Clearing Fri ☀️"
 */

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Mic,
  Sparkles,
  CloudSun,
  Heart,
  Check,
  Play,
  X,
  LockKeyhole,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import AuroraBackground from '@/components/marketing/AuroraBackground';
import StarField from '@/components/marketing/StarField';
import TrustStrip from '@/components/marketing/TrustStrip';
import Testimonials from '@/components/marketing/Testimonials';
import PrivacyPromise from '@/components/marketing/PrivacyPromise';
import PressStrip from '@/components/marketing/PressStrip';
import GlowButton from '@/components/ui/GlowButton';
import FadeUp from '@/components/ui/FadeUp';

const HERO_VIDEO_SRC = '/videos/luna-hero-demo.mp4';
const HERO_VIDEO_POSTER = '/images/luna-hero-poster.png';
const HERO_VIDEO_CAPTIONS = '/videos/luna-hero-demo.vtt';

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

const BLOG_TEASERS = [
  {
    title: 'Why Menopause Steals Your Sleep',
    tag: 'Sleep',
    href: '/whispers/sleep-and-menopause',
    desc: 'A clearer read on the 3am wake-up, night sweats, and the patterns Luna helps you notice.',
  },
  {
    title: 'The Anxiety No One Warned You About',
    tag: 'Mood',
    href: '/whispers/mood-changes-anxiety',
    desc: 'A calm explanation of hormonal mood shifts and how pattern awareness can reduce fear.',
  },
  {
    title: 'Brain Fog: You Are Not Losing Your Mind',
    tag: 'Clarity',
    href: '/whispers/brain-fog-menopause',
    desc: 'Reassurance and science for the moments when words, focus, and confidence feel harder to hold.',
  },
];

const HERO_PROOF = [
  {
    icon: Mic,
    label: 'Voice check-in',
    value: 'I could not sleep again...',
  },
  {
    icon: CloudSun,
    label: 'Body forecast',
    value: 'Cloudy stretch likely Wed',
  },
  {
    icon: TrendingUp,
    label: 'Pattern noticed',
    value: 'Sleep and warmth linked',
  },
];

export default function LandingPage() {
  const [orbPressed, setOrbPressed] = useState(false);
  const [demoVideoReady, setDemoVideoReady] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const demoCardRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const demoCard = demoCardRef.current;

    if (!demoCard) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setDemoVideoReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(demoCard);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!demoModalOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDemoModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [demoModalOpen]);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-luna-ink text-luna-cream">
      <AuroraBackground />
      <StarField />
      <Header />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-luna-ink/88 px-4 py-3 backdrop-blur-xl md:hidden">
        <GlowButton href="/trial" variant="primary" className="min-h-11 w-full">
          Try Luna Free
        </GlowButton>
      </div>

      {/* ── HERO ── */}
      <section className="relative flex min-h-screen items-center overflow-hidden px-6 pb-28 pt-28 md:pb-20">
        {/* Hero lifestyle photo — full bleed with dark overlay */}
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
          <Image
            src="/images/hero-lifestyle.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
            style={{ opacity: 0.22 }}
          />
          {/* Dark gradient overlay — heavier at top/bottom, lighter in center */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(10,14,39,0.75) 0%, rgba(10,14,39,0.45) 40%, rgba(10,14,39,0.55) 70%, rgba(10,14,39,0.85) 100%)',
            }}
          />
          {/* Warm colour tint to blend with aurora palette */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 60% 40%, rgba(255,212,163,0.07) 0%, transparent 55%), radial-gradient(ellipse at 20% 70%, rgba(233,184,255,0.08) 0%, transparent 50%)',
            }}
          />
        </div>
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div className="text-left md:text-center lg:text-left">
            <FadeUp delay={0}>
              <p className="mb-5 text-sm tracking-[0.14em] text-luna-aurora-lilac uppercase opacity-90">
                She is not a season ending. She is a sky rearranging.
              </p>
            </FadeUp>

            <FadeUp delay={0.15} initialVisible>
              <h1 className="max-w-4xl font-serif text-5xl leading-tight font-normal text-luna-cream md:text-6xl lg:text-7xl">
                Finally, a companion who understands your menopause.
              </h1>
            </FadeUp>

            <FadeUp delay={0.3}>
              <p className="mt-7 max-w-2xl text-lg leading-relaxed font-normal text-white/85 md:mx-auto md:text-xl lg:mx-0">
                Speak to Luna. She listens, remembers, and forecasts your body&apos;s weather
                — so you never feel alone in the change.
              </p>
            </FadeUp>

            <FadeUp delay={0.45}>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row md:justify-center lg:justify-start">
                <div className="flex w-full flex-col items-stretch sm:w-auto sm:items-center">
                  <GlowButton
                    href="/trial"
                    variant="primary"
                    className="min-h-11 w-full px-8 sm:w-auto"
                  >
                    Try Luna Free
                  </GlowButton>
                  <p className="mt-2 text-center text-xs text-white/60">
                    No signup for your first check-in
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setDemoModalOpen(true)}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-luna-aurora-lilac/40 px-8 py-4 font-sans text-base font-semibold text-luna-cream transition-all duration-500 hover:border-luna-aurora-mint/70 hover:bg-luna-cream/5 sm:w-auto"
                >
                  <Play className="h-4 w-4" aria-hidden />
                  <span>Watch 30-sec demo</span>
                </button>
              </div>
            </FadeUp>

            <FadeUp delay={0.52}>
              <div className="mt-7 grid max-w-2xl gap-3 sm:grid-cols-3 md:mx-auto lg:mx-0">
                {HERO_PROOF.map((proof) => (
                  <div
                    key={proof.label}
                    className="rounded-2xl border border-luna-cream/12 bg-luna-ink/45 p-4 text-left shadow-xl shadow-black/10 backdrop-blur-xl"
                  >
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-luna-aurora-mint">
                      <proof.icon className="h-4 w-4" aria-hidden="true" />
                      {proof.label}
                    </div>
                    <p className="text-sm leading-5 text-luna-cream/82">{proof.value}</p>
                  </div>
                ))}
              </div>
            </FadeUp>

            <TrustStrip className="mt-9 md:mx-auto lg:mx-0" delay={0.6} />
            <FadeUp delay={0.66}>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/62 md:justify-center lg:justify-start">
                <span className="inline-flex items-center gap-1.5">
                  <LockKeyhole className="h-3.5 w-3.5 text-luna-aurora-mint" aria-hidden="true" />
                  Private by design
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-luna-aurora-mint" aria-hidden="true" />
                  Not a medical device
                </span>
              </div>
            </FadeUp>
          </div>

          <FadeUp delay={0.3} className="lg:justify-self-end">
            <div
              ref={demoCardRef}
              className="glass-card relative mx-auto aspect-[9/16] w-full max-w-sm overflow-hidden rounded-3xl p-0 shadow-2xl shadow-luna-aurora-lilac/20 md:aspect-video md:max-w-3xl lg:max-w-xl"
            >
              <Image
                src={HERO_VIDEO_POSTER}
                alt="Luna voice check-in demo preview"
                fill
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="object-cover"
                preload
              />

              {demoVideoReady && (
                <video
                  className="absolute inset-0 h-full w-full object-cover"
                  aria-label="Demo of Luna voice check-in"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="none"
                  poster={HERO_VIDEO_POSTER}
                >
                  {/* TODO(video team): replace placeholder with the final Luna hero demo cut. */}
                  <source src={HERO_VIDEO_SRC} type="video/mp4" />
                  <track
                    kind="captions"
                    src={HERO_VIDEO_CAPTIONS}
                    srcLang="en"
                    label="English captions"
                    default
                  />
                </video>
              )}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-luna-ink to-transparent" />

              <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full border border-luna-aurora-mint/30 bg-luna-ink/50 px-3 py-2 text-xs tracking-[0.14em] text-luna-cream uppercase backdrop-blur-md">
                <motion.span
                  className="h-2 w-2 rounded-full bg-luna-aurora-mint"
                  animate={
                    prefersReducedMotion
                      ? undefined
                      : { opacity: [0.45, 1, 0.45], scale: [1, 1.25, 1] }
                  }
                  transition={
                    prefersReducedMotion
                      ? undefined
                      : { duration: 2.4, ease: 'easeInOut', repeat: Infinity }
                  }
                />
                Live demo
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {demoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-luna-ink/90 px-4 py-8 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Luna demo video"
          onClick={() => setDemoModalOpen(false)}
        >
          <div
            className="glass-card relative aspect-video w-full max-w-4xl overflow-hidden rounded-3xl p-0 shadow-2xl shadow-luna-aurora-mint/20"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setDemoModalOpen(false)}
              className="absolute top-4 right-4 z-10 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-luna-cream/20 bg-luna-ink/60 text-luna-cream backdrop-blur-md transition-colors hover:bg-luna-cream/10"
              aria-label="Close demo video"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>

            <video
              className="h-full w-full object-cover"
              aria-label="Demo of Luna voice check-in"
              autoPlay
              loop
              muted
              playsInline
              controls
              poster={HERO_VIDEO_POSTER}
            >
              {/* TODO(video team): replace placeholder with the final Luna hero demo cut. */}
              <source src={HERO_VIDEO_SRC} type="video/mp4" />
              <track
                kind="captions"
                src={HERO_VIDEO_CAPTIONS}
                srcLang="en"
                label="English captions"
                default
              />
            </video>
          </div>
        </div>
      )}

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="relative px-6 py-32">
        {/* Subtle cool-toned background for contrast with hero */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(143,184,232,0.05) 0%, transparent 60%)',
          }}
        />
        <div className="mx-auto max-w-4xl">
          <FadeUp>
            <div className="mb-20 text-center">
              <p className="mb-4 text-sm tracking-[0.14em] uppercase text-white/70">
                How it works
              </p>
              <h2 className="font-serif text-4xl md:text-5xl">
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
                      <s.icon className="h-7 w-7 text-white/85" />
                    </div>
                    <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-sm text-white/70">
                      {i + 1}
                    </span>
                  </div>
                  <p className="mb-1 text-sm tracking-[0.14em] uppercase text-white/70">
                    Step {i + 1}
                  </p>
                  <h3 className="mb-3 font-serif text-2xl">{s.title}</h3>
                  <p className="text-[0.9375rem] leading-relaxed text-white/75">{s.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY IT'S DIFFERENT ── */}
      <section id="story" className="relative px-6 py-32">
        {/* Warm rose glow for emotional resonance */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse at 80% 30%, rgba(255,154,174,0.06) 0%, transparent 55%), radial-gradient(ellipse at 20% 80%, rgba(200,168,233,0.06) 0%, transparent 50%)',
          }}
        />
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <div className="mb-16 text-center">
              <p className="mb-4 text-sm tracking-[0.14em] uppercase text-white/70">
                Why Luna
              </p>
              <h2 className="font-serif text-4xl md:text-5xl">
                Not another tracker.{' '}
                <span className="italic text-white/80">A companion.</span>
              </h2>
            </div>
          </FadeUp>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <FadeUp key={f.title} delay={i * 0.1}>
                <div className="group rounded-2xl border border-white/5 bg-white/[0.03] p-8 backdrop-blur-sm transition-all duration-500 hover:border-white/10 hover:bg-white/[0.05]">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">
                    <f.icon className="h-5 w-5 text-white/80" />
                  </div>
                  <h3 className="mb-3 font-serif text-xl">{f.title}</h3>
                  <p className="text-[0.9375rem] leading-relaxed text-white/75">{f.desc}</p>
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
            <p className="mb-4 text-sm tracking-[0.14em] uppercase text-white/70">
              Try the whisper
            </p>
            <h2 className="mb-16 font-serif text-4xl md:text-5xl">
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
            <p className="mt-8 text-sm text-white/55 italic">
              (real listening begins when you sign in)
            </p>
          </FadeUp>
        </div>
      </section>

      {/* MedicalAdvisors hidden until real advisors are onboarded */}
      {/* <MedicalAdvisors /> */}
      <Testimonials />
      <PrivacyPromise />

      {/* ── PRICING ── */}
      <section id="pricing" className="relative bg-luna-cream px-6 py-32 text-luna-ink">
        {/* Neutral clean background — let cards breathe */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(168,216,201,0.24) 0%, transparent 48%)',
          }}
        />
        <div className="mx-auto max-w-5xl">
          <FadeUp>
            <div className="mb-16 text-center">
              <p className="mb-4 text-sm tracking-[0.14em] uppercase text-luna-ink/55">
                Pricing
              </p>
              <h2 className="font-serif text-4xl text-luna-ink md:text-5xl">
                Choose your moon.
              </h2>
            </div>
          </FadeUp>

          <div className="grid gap-6 md:grid-cols-3">
            {PLANS.map((p, i) => (
              <FadeUp key={p.name} delay={i * 0.1}>
                <div
                  className={`relative flex flex-col rounded-2xl p-8 transition-all duration-500 ${
                    p.featured
                      ? 'border border-luna-storm/20 bg-white shadow-2xl shadow-luna-storm/10'
                      : 'border border-luna-ink/10 bg-white/55'
                  }`}
                >
                  {p.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-luna-storm px-4 py-1 text-xs tracking-wide text-luna-cream">
                      Most chosen
                    </span>
                  )}

                  <p className="mb-2 text-sm tracking-[0.14em] uppercase text-luna-ink/55">
                    {p.name}
                  </p>
                  <div className="mb-6 flex items-baseline gap-1">
                    <span className="font-serif text-4xl text-luna-ink">{p.price}</span>
                    {p.period && (
                      <span className="text-sm text-luna-ink/55">{p.period}</span>
                    )}
                  </div>

                  <ul className="mb-8 flex-1 space-y-3">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-[0.9375rem] text-luna-ink/72">
                        <Check className="h-4 w-4 shrink-0 text-luna-storm" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <GlowButton
                    href={p.href}
                    variant={p.featured ? 'primary' : 'ghost'}
                    className={`w-full justify-center ${
                      p.featured ? '' : 'border-luna-ink/15 text-luna-ink hover:border-luna-ink/30'
                    }`}
                  >
                    {p.cta}
                  </GlowButton>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOG PREVIEW ── */}
      <section className="relative px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-4 text-sm tracking-[0.14em] uppercase text-white/70">
                  Whispers
                </p>
                <h2 className="max-w-2xl font-serif text-4xl text-luna-cream md:text-5xl">
                  Education that feels calm enough to keep reading.
                </h2>
              </div>
              <Link
                href="/whispers"
                className="inline-flex rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-luna-cream transition-colors hover:border-white/30 hover:bg-white/[0.04]"
              >
                Read the journal
              </Link>
            </div>
          </FadeUp>

          <div className="grid gap-5 md:grid-cols-3">
            {BLOG_TEASERS.map((post, index) => (
              <FadeUp key={post.href} delay={index * 0.1}>
                <Link
                  href={post.href}
                  className="block h-full rounded-2xl border border-luna-cream/10 bg-luna-cream p-6 text-luna-ink shadow-2xl shadow-black/15 transition-transform hover:-translate-y-1"
                >
                  <span className="mb-6 inline-flex rounded-full bg-luna-aurora-mint/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-luna-ink/65">
                    {post.tag}
                  </span>
                  <h3 className="font-serif text-2xl leading-tight text-luna-ink">
                    {post.title}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-luna-ink/68">{post.desc}</p>
                </Link>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <PressStrip />

      {/* ── FINAL CTA ── */}
      <section className="relative overflow-hidden px-6 py-40 text-center">
        {/* CTA scene photo — silhouette at dusk with heavy dark overlay */}
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
          <Image
            src="/images/cta-scene.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
            style={{ opacity: 0.28 }}
          />
          {/* Heavy dark overlay — 70% to keep text readable */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(10,14,39,0.80) 0%, rgba(10,14,39,0.60) 50%, rgba(10,14,39,0.85) 100%)',
            }}
          />
        </div>
        {/* Candle glow on top of photo */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[100px] z-10"
          style={{
            background:
              'radial-gradient(circle, #FFD4A3 0%, #FF9AAE 40%, #C8A8E9 70%, transparent 100%)',
          }}
        />

        {/* Content sits above photo + glow layers */}
        <div className="relative z-20">
          <FadeUp>
            <h2 className="relative mb-8 font-serif text-5xl leading-tight md:text-6xl lg:text-7xl">
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
            <p className="mt-6 text-sm text-white/55">
              No credit card. No noise. Just you, heard.
            </p>
          </FadeUp>
        </div>
      </section>

      <Footer />
    </main>
  );
}
