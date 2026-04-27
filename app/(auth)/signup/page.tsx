'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { signup } from '@/lib/actions/auth';

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signup(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center"
    >
      {/* Headline */}
      <h1 className="font-serif font-light text-3xl sm:text-4xl md:text-5xl text-center mb-3 text-aurora">
        Begin your story
      </h1>
      <p className="text-poetic text-center mb-8 sm:mb-12">
        Every journey through change deserves a companion who listens.
      </p>

      {/* Form */}
      <form action={handleSubmit} className="w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <label className="label-whisper">Your name</label>
          <input
            type="text"
            name="name"
            placeholder="What should Luna call you?"
            className="input-underline"
            autoComplete="given-name"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <label className="label-whisper">Email</label>
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="input-underline"
            autoComplete="email"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <label className="label-whisper">Password</label>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            placeholder="At least 8 characters"
            className="input-underline"
            autoComplete="new-password"
          />
        </motion.div>

        {/* Error message */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-luna-warning text-center"
          >
            {error}
          </motion.p>
        )}

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="pt-4"
        >
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary w-full"
          >
            {isPending ? (
              <span className="loading-dots">
                <span />
                <span />
                <span />
              </span>
            ) : (
              'Begin'
            )}
          </button>
        </motion.div>
      </form>

      {/* Link to login */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.8 }}
        className="mt-10 text-sm text-white/50 text-center"
      >
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-luna-rose hover:text-white transition-colors duration-300"
        >
          Welcome back
        </Link>
      </motion.p>
    </motion.div>
  );
}
