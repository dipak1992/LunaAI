'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/components/brand/Logo';
import { completeOnboarding, type OnboardingData } from './actions';

const SYMPTOMS = [
  'Hot flashes',
  'Sleep trouble',
  'Mood shifts',
  'Brain fog',
  'Anxiety',
  'Joint pain',
  'Energy crashes',
  'Weight changes',
];

const STEPS = [
  {
    title: "Let\u2019s begin, gently.",
    subtitle: 'What should Luna call you?',
  },
  {
    title: 'A number holds no weight here.',
    subtitle: 'How old are you?',
  },
  {
    title: 'Tell me about your rhythm.',
    subtitle: 'When did you last have a period?',
  },
  {
    title: "What\u2019s been heaviest?",
    subtitle: "Pick what\u2019s been with you lately.",
  },
  {
    title: 'One last whisper.',
    subtitle: 'What do you hope Luna can do for you?',
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingData>({
    name: '',
    age: undefined,
    last_period: undefined,
    symptoms: [],
    intention: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const progress = (step + 1) / STEPS.length; // 0.2 → 1.0
  const flameScale = 0.6 + progress * 0.8; // grows from 0.8 to 1.4

  function handleNext() {
    if (step === 0 && !formData.name.trim()) {
      setError('A name is needed, even a nickname.');
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function handleBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await completeOnboarding(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  function toggleSymptom(symptom: string) {
    setFormData((prev) => ({
      ...prev,
      symptoms: prev.symptoms?.includes(symptom)
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...(prev.symptoms || []), symptom],
    }));
  }

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12 overflow-hidden">
      {/* ── Background: growing flame glow ── */}
      <motion.div
        className="flame-glow fixed rounded-full pointer-events-none"
        style={{
          width: 400,
          height: 400,
          left: '50%',
          top: '60%',
          x: '-50%',
          y: '-50%',
        }}
        animate={{ scale: flameScale, opacity: 0.4 + progress * 0.3 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* ── Night background ── */}
      <div className="fixed inset-0 bg-luna-night -z-20" />

      {/* ── Logo ── */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2">
        <Logo size={36} animated={false} />
      </div>

      {/* ── Progress dashes ── */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 flex gap-2">
        {STEPS.map((_, i) => (
          <motion.div
            key={i}
            className="h-[2px] rounded-full"
            animate={{
              width: i === step ? 32 : 16,
              backgroundColor:
                i <= step ? '#FFD4A3' : 'rgba(255,255,255,0.2)',
            }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </div>

      {/* ── Step content ── */}
      <div className="w-full max-w-md relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            {/* Title + subtitle */}
            <h1 className="font-serif text-4xl md:text-5xl text-center mb-3 text-balance">
              {STEPS[step].title}
            </h1>
            <p className="text-poetic text-center mb-10">
              {STEPS[step].subtitle}
            </p>

            {/* ── Step inputs ── */}
            {step === 0 && (
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Your name or nickname"
                className="input-underline text-center"
                autoFocus
              />
            )}

            {step === 1 && (
              <input
                type="number"
                value={formData.age ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    age: e.target.value ? parseInt(e.target.value) : undefined,
                  }))
                }
                placeholder="Age"
                className="input-underline text-center"
                min={18}
                max={120}
                autoFocus
              />
            )}

            {step === 2 && (
              <div className="w-full space-y-4">
                <input
                  type="date"
                  value={
                    formData.last_period && formData.last_period !== 'unsure'
                      ? formData.last_period
                      : ''
                  }
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      last_period: e.target.value,
                    }))
                  }
                  className="input-underline text-center w-full"
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, last_period: 'unsure' }))
                  }
                  className={`w-full py-3 rounded-full text-sm transition-all duration-300 ${
                    formData.last_period === 'unsure'
                      ? 'bg-luna-sunset/20 text-luna-sunset border border-luna-sunset/30'
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  I&rsquo;m not sure
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-wrap justify-center gap-3 max-w-sm">
                {SYMPTOMS.map((symptom) => {
                  const isSelected = formData.symptoms?.includes(symptom);
                  return (
                    <motion.button
                      key={symptom}
                      type="button"
                      onClick={() => toggleSymptom(symptom)}
                      className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                        isSelected
                          ? 'bg-luna-rose/20 text-luna-rose border border-luna-rose/40'
                          : 'bg-white/5 text-white/60 border border-white/10 hover:border-white/20'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      {symptom}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {step === 4 && (
              <textarea
                value={formData.intention}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    intention: e.target.value,
                  }))
                }
                placeholder="In your own words..."
                className="input-underline text-center resize-none h-24"
                autoFocus
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Error ── */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-luna-warning text-center mt-4"
          >
            {error}
          </motion.p>
        )}

        {/* ── Navigation ── */}
        <div className="flex items-center justify-between mt-12">
          {step > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className="btn-ghost"
            >
              &larr; Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={isLastStep ? handleSubmit : handleNext}
            disabled={isPending}
            className="btn-primary"
          >
            {isPending ? (
              <span className="loading-dots">
                <span />
                <span />
                <span />
              </span>
            ) : isLastStep ? (
              'Light my candle \u2192'
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
