'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { VoiceOrb } from '@/components/dashboard/VoiceOrb';
import { formatDuration } from '@/lib/utils/audio';
import { SoftGateModal } from './SoftGateModal';

/**
 * Trial flow states:
 * 1. welcome  → Intro copy + "Begin" CTA
 * 2. record   → Voice orb or text input
 * 3. result   → Luna response + haiku + soft-gate
 * 4. gate     → Signup modal overlay
 */
type TrialState = 'welcome' | 'record' | 'result' | 'gate';

interface TrialResult {
  transcript: string;
  response: string;
  haiku: { lines: string[]; mood?: string } | null;
  crisis: boolean;
  crisisLevel?: string;
  crisisCategory?: string;
  sessionId?: string;
}

export function TrialExperience() {
  const [state, setState] = useState<TrialState>('welcome');
  const [result, setResult] = useState<TrialResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [showGate, setShowGate] = useState(false);

  const recorder = useVoiceRecorder();

  // Submit audio blob to trial API
  const submitAudio = useCallback(async (blob: Blob) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append('audio', blob);

      const res = await fetch('/api/trial/check-in', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error === 'trial_used') {
          setShowGate(true);
          setState('gate');
          return;
        }
        throw new Error(data.message || 'Something went wrong');
      }

      const data: TrialResult = await res.json();
      setResult(data);
      setState('result');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Submit text to trial API
  const submitText = useCallback(async () => {
    if (!textInput.trim()) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/trial/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textInput.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error === 'trial_used') {
          setShowGate(true);
          setState('gate');
          return;
        }
        throw new Error(data.message || 'Something went wrong');
      }

      const data: TrialResult = await res.json();
      setResult(data);
      setState('result');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  }, [textInput]);

  // Handle voice orb click
  const handleOrbClick = useCallback(() => {
    if (recorder.state === 'idle' || recorder.state === 'error') {
      recorder.startRecording();
    } else if (recorder.state === 'recording') {
      recorder.stopRecording();
    }
  }, [recorder]);

  // Watch for audio blob ready
  const handleAudioReady = useCallback(() => {
    if (recorder.audioBlob && recorder.state === 'processing') {
      submitAudio(recorder.audioBlob);
    }
  }, [recorder.audioBlob, recorder.state, submitAudio]);

  // Effect: when audioBlob is set and state is processing, submit
  if (recorder.audioBlob && recorder.state === 'processing' && !isSubmitting && !result) {
    submitAudio(recorder.audioBlob);
  }

  return (
    <div className="relative flex flex-col items-center w-full max-w-lg mx-auto px-5">
      <AnimatePresence mode="wait">
        {/* ─── WELCOME STATE ─── */}
        {state === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center gap-6 py-8"
          >
            <motion.div
              className="w-16 h-16 rounded-full bg-gradient-to-br from-luna-purple/30 to-luna-pink/30 flex items-center justify-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <span className="text-3xl">🌙</span>
            </motion.div>

            <h1 className="text-2xl sm:text-3xl text-white">
              Your first whisper to Luna
            </h1>

            <p className="text-white/70 text-base sm:text-lg max-w-md leading-relaxed">
              Take a breath. Then tell Luna how you&apos;re feeling today — 
              in your voice or your words. No account needed.
            </p>

            <p className="text-white/50 text-sm">
              One free check-in • 60 seconds • completely private
            </p>

            <motion.button
              onClick={() => setState('record')}
              className="mt-4 px-8 py-4 rounded-full bg-luna-cream text-luna-ink font-medium text-base hover:bg-white transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Begin your whisper
            </motion.button>
          </motion.div>
        )}

        {/* ─── RECORD STATE ─── */}
        {state === 'record' && (
          <motion.div
            key="record"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center gap-6 py-8 w-full"
          >
            {/* Mode toggle */}
            <div className="flex items-center gap-3 bg-white/5 rounded-full px-1 py-1">
              <button
                onClick={() => setInputMode('voice')}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  inputMode === 'voice'
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white/70'
                }`}
              >
                🎙️ Voice
              </button>
              <button
                onClick={() => setInputMode('text')}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  inputMode === 'text'
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white/70'
                }`}
              >
                ✍️ Type
              </button>
            </div>

            {inputMode === 'voice' ? (
              <>
                <p className="text-white/60 text-sm">
                  {recorder.state === 'idle' && 'Tap the orb and speak freely'}
                  {recorder.state === 'recording' && `Recording… ${formatDuration(recorder.duration)}`}
                  {recorder.state === 'processing' && 'Luna is listening…'}
                  {recorder.state === 'requesting' && 'Requesting microphone…'}
                  {recorder.state === 'error' && (recorder.error || 'Something went wrong')}
                </p>

                <VoiceOrb
                  state={isSubmitting ? 'processing' : recorder.state}
                  audioLevel={recorder.audioLevel}
                  onClick={handleOrbClick}
                  disabled={isSubmitting}
                  size={140}
                />

                {recorder.state === 'recording' && (
                  <p className="text-white/40 text-xs">
                    Tap again to stop • max 60 seconds
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-white/60 text-sm">
                  How are you feeling today?
                </p>

                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="I've been feeling..."
                  className="w-full max-w-md h-32 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-white/20 transition-colors"
                  maxLength={500}
                  disabled={isSubmitting}
                />

                <motion.button
                  onClick={submitText}
                  disabled={!textInput.trim() || isSubmitting}
                  className="px-6 py-3 rounded-full bg-luna-cream text-luna-ink font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <motion.span
                        className="w-4 h-4 border-2 border-luna-ink/30 border-t-luna-ink rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      Luna is listening…
                    </span>
                  ) : (
                    'Send to Luna'
                  )}
                </motion.button>
              </>
            )}

            {isSubmitting && inputMode === 'voice' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/50 text-sm"
              >
                Luna is reading your whisper…
              </motion.p>
            )}

            {submitError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-300 text-sm"
              >
                {submitError}
              </motion.p>
            )}
          </motion.div>
        )}

        {/* ─── RESULT STATE ─── */}
        {state === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center text-center gap-8 py-8 w-full"
          >
            {/* Crisis response */}
            {result.crisis ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-left w-full">
                <p className="text-white whitespace-pre-line text-sm leading-relaxed">
                  {result.response}
                </p>
              </div>
            ) : (
              <>
                {/* Luna's response */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full"
                >
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-3">
                    Luna says
                  </p>
                  <p className="text-white text-base sm:text-lg leading-relaxed italic">
                    &ldquo;{result.response}&rdquo;
                  </p>
                </motion.div>

                {/* Haiku */}
                {result.haiku && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-br from-luna-purple/10 to-luna-pink/10 border border-white/10 rounded-2xl p-6 w-full"
                  >
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-4">
                      Your haiku
                    </p>
                    <div className="space-y-1">
                      {result.haiku.lines.map((line, i) => (
                        <motion.p
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + i * 0.2 }}
                          className="text-white text-lg font-serif italic"
                        >
                          {line}
                        </motion.p>
                      ))}
                    </div>
                    {result.haiku.mood && (
                      <p className="text-white/30 text-xs mt-3">
                        mood: {result.haiku.mood}
                      </p>
                    )}
                  </motion.div>
                )}

                {/* Soft gate CTA */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="flex flex-col items-center gap-4 mt-4"
                >
                  <p className="text-white/60 text-sm">
                    This was your free whisper. Luna remembers — but only if you stay.
                  </p>

                  <motion.button
                    onClick={() => setShowGate(true)}
                    className="px-8 py-4 rounded-full bg-luna-cream text-luna-ink font-medium text-base hover:bg-white transition-colors"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Continue with Luna
                  </motion.button>

                  <p className="text-white/30 text-xs">
                    Free account • No credit card • 30 seconds
                  </p>
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Soft Gate Modal */}
      <SoftGateModal
        open={showGate}
        onClose={() => setShowGate(false)}
        sessionId={result?.sessionId}
        haiku={result?.haiku}
      />
    </div>
  );
}
