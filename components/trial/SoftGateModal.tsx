'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CloudSun, Moon, PenLine } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SoftGateModalProps {
  open: boolean;
  onClose: () => void;
  sessionId?: string;
  haiku?: { lines: string[]; mood?: string } | null;
}

export function SoftGateModal({ open, onClose, sessionId, haiku }: SoftGateModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<'emotional' | 'form'>('emotional');

  const handleSignup = () => {
    startTransition(async () => {
      setError(null);

      const supabase = createClient();

      // If we have a session (anonymous user), convert to permanent
      if (sessionId) {
        const { error: updateError } = await supabase.auth.updateUser({
          email,
          password,
          data: { name },
        });

        if (updateError) {
          // If conversion fails, try regular signup
          const { error: signupError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name },
            },
          });

          if (signupError) {
            setError(signupError.message);
            return;
          }
        }
      } else {
        // No anonymous session, regular signup
        const { error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
          },
        });

        if (signupError) {
          setError(signupError.message);
          return;
        }
      }

      // Redirect to dashboard with welcome state
      router.push('/dashboard?welcome=true');
    });
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-luna-ink/80 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-md bg-gradient-to-b from-[#1a1030] to-[#0d0a1a] border border-white/10 rounded-3xl p-6 sm:p-8 overflow-y-auto max-h-[90vh]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/40 hover:text-white/70 transition-colors"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <AnimatePresence mode="wait">
            {step === 'emotional' ? (
              <motion.div
                key="emotional"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center text-center gap-5"
              >
                {/* Haiku echo */}
                {haiku && (
                  <div className="bg-white/5 rounded-2xl p-4 w-full mb-2">
                    <div className="space-y-1">
                      {haiku.lines.map((line, i) => (
                        <p key={i} className="text-white/80 text-sm font-serif italic">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <h2 className="text-xl sm:text-2xl text-white">
                  Luna heard you.
                </h2>

                <p className="text-white/60 text-base leading-relaxed">
                  She&apos;ll remember this moment — your words, your weather, your haiku — 
                  but only if you create a home here.
                </p>

                <div className="flex flex-col gap-2 text-white/60 text-sm">
                  <span className="inline-flex items-center justify-center gap-2">
                    <PenLine className="h-4 w-4" aria-hidden="true" />
                    Daily haikus written just for you
                  </span>
                  <span className="inline-flex items-center justify-center gap-2">
                    <CloudSun className="h-4 w-4" aria-hidden="true" />
                    Emotional weather forecasts
                  </span>
                  <span className="inline-flex items-center justify-center gap-2">
                    <Moon className="h-4 w-4" aria-hidden="true" />
                    A companion who remembers
                  </span>
                </div>

                <motion.button
                  onClick={() => setStep('form')}
                  className="mt-4 w-full px-6 py-4 rounded-full bg-luna-cream text-luna-ink font-semibold text-base hover:bg-white transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Create my free account
                </motion.button>

                <button
                  onClick={onClose}
                  className="text-white/30 text-sm hover:text-white/50 transition-colors"
                >
                  Maybe later
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-5"
              >
                <div className="text-center mb-2">
                  <h2 className="text-xl text-white">Almost there</h2>
                  <p className="text-white/50 text-sm mt-1">
                    30 seconds and Luna is yours
                  </p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-white/65 text-sm mb-1.5">
                    What should Luna call you?
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your first name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
                    autoFocus
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-white/65 text-sm mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-white/65 text-sm mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>

                {error && (
                  <p className="text-red-300 text-sm text-center">{error}</p>
                )}

                <motion.button
                  onClick={handleSignup}
                  disabled={isPending || !email || !password}
                  className="w-full px-6 py-4 rounded-full bg-luna-cream text-luna-ink font-semibold text-base hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        className="w-4 h-4 border-2 border-luna-ink/30 border-t-luna-ink rounded-full inline-block"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      Creating your space…
                    </span>
                  ) : (
                    'Start my journey'
                  )}
                </motion.button>

                <button
                  onClick={() => setStep('emotional')}
                  className="text-white/30 text-sm hover:text-white/50 transition-colors text-center"
                >
                  ← Back
                </button>

                <p className="text-white/25 text-xs text-center">
                  By signing up you agree to our Terms & Privacy Policy
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
