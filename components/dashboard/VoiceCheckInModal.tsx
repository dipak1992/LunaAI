'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Edit3, Mic, Sparkles } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { VoiceOrb } from '@/components/dashboard/VoiceOrb';
import { WeatherScore } from '@/components/dashboard/WeatherScore';
import { SparkleParticles, AmbientSparkles } from '@/components/dashboard/SparkleParticles';
import SparkleBurst from '@/components/effects/SparkleBurst';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { formatDuration } from '@/lib/utils/audio';
import type { VoiceCheckInResult } from '@/types/voice';
import UpgradeModal from '@/components/subscription/UpgradeModal';
import CrisisModal from '@/components/safety/CrisisModal';
import { useUpgradeModal } from '@/lib/hooks/useUpgradeModal';
import { useHaptics } from '@/lib/hooks/useHaptics';
import { playSound } from '@/lib/sound/player';
import { useWhisper } from '@/components/ui/WhisperToast';

interface VoiceCheckInModalProps {
  open: boolean;
  onClose: () => void;
  onComplete?: (result: VoiceCheckInResult) => void;
  userName?: string;
}

type ModalView = 'record' | 'result' | 'error';
type InputMode = 'voice' | 'text';

const QUICK_CHECK_INS = [
  'hot flashes',
  'poor sleep',
  'anxious',
  'low energy',
];

export function VoiceCheckInModal({
  open,
  onClose,
  onComplete,
  userName = 'friend',
}: VoiceCheckInModalProps) {
  const [view, setView] = useState<ModalView>('record');
  const [result, setResult] = useState<VoiceCheckInResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSparkles, setShowSparkles] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [crisisOpen, setCrisisOpen] = useState(false);
  const [crisisMessage, setCrisisMessage] = useState('');
  const [crisisLevel, setCrisisLevel] = useState<'yellow' | 'amber' | 'red'>('red');
  const [inputMode, setInputMode] = useState<InputMode>('voice');
  const [textInput, setTextInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submittingText, setSubmittingText] = useState(false);
  const {
    open: upgradeOpen,
    feature: upgradeFeature,
    prompt: promptUpgrade,
    close: closeUpgrade,
  } = useUpgradeModal();

  const recorder = useVoiceRecorder();
  const haptics = useHaptics();
  const whisper = useWhisper();

  const handleCheckInResponse = useCallback(async (res: Response) => {
    const data = await res.json();

    if (res.status === 402 || data?.error === 'limit_reached') {
      recorder.reset();
      onClose();
      promptUpgrade('checkin');
      return;
    }

    if (data?.crisis) {
      recorder.reset();
      setCrisisLevel(data.crisis.level ?? 'red');
      setCrisisMessage(data.crisis.message ?? '');
      setCrisisOpen(true);
      onClose();
      return;
    }

    if (!res.ok) {
      throw new Error(data.error ?? `Server error ${res.status}`);
    }

    setResult(data as VoiceCheckInResult);
    setView('result');
    setShowSparkles(true);
    setSparkleKey(Date.now());
    haptics('success');
    playSound('chime', 0.25);
    whisper('Your check-in is saved.', 'warm');
    setTimeout(() => setShowSparkles(false), 2000);
    onComplete?.(data as VoiceCheckInResult);
  }, [haptics, onClose, onComplete, promptUpgrade, recorder, whisper]);

  const submitAudio = useCallback(async (blob: Blob) => {
    setSubmitError(null);

    const formData = new FormData();
    const ext = blob.type.includes('ogg') ? 'ogg' : blob.type.includes('mp4') ? 'mp4' : 'webm';
    formData.append('audio', blob, `checkin.${ext}`);

    try {
      const res = await fetch('/api/voice-checkin', {
        method: 'POST',
        body: formData,
      });

      await handleCheckInResponse(res);
    } catch (err) {
      haptics('error');
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setSubmitError(message);
      setView('error');
    }
  }, [handleCheckInResponse, haptics]);

  // Reset when modal opens
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      setView('record');
      setResult(null);
      setSubmitError(null);
      setShowSparkles(false);
      setTextInput('');
      setSelectedTags([]);
      setSubmittingText(false);
      recorder.reset();
    }, 0);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // When audioBlob is ready (state = 'processing'), submit to API
  useEffect(() => {
    if (recorder.state !== 'processing' || !recorder.audioBlob) return;
    const blob = recorder.audioBlob;
    const id = window.setTimeout(() => submitAudio(blob), 0);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorder.state, recorder.audioBlob]);

  const submitText = useCallback(async () => {
    const text = textInput.trim();
    if ((!text && selectedTags.length === 0) || submittingText) return;

    setSubmitError(null);
    setSubmittingText(true);

    try {
      const res = await fetch('/api/voice-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, quickTags: selectedTags }),
      });

      await handleCheckInResponse(res);
    } catch (err) {
      haptics('error');
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setSubmitError(message);
      setView('error');
    } finally {
      setSubmittingText(false);
    }
  }, [handleCheckInResponse, haptics, selectedTags, submittingText, textInput]);

  const handleOrbClick = useCallback(() => {
    if (recorder.state === 'idle' || recorder.state === 'error') {
      recorder.startRecording();
    } else if (recorder.state === 'recording') {
      recorder.stopRecording();
    }
  }, [recorder]);

  const handleClose = useCallback(() => {
    recorder.reset();
    onClose();
  }, [recorder, onClose]);

  const handleRetry = useCallback(() => {
    recorder.reset();
    setSubmitError(null);
    setTextInput('');
    setSelectedTags([]);
    setSubmittingText(false);
    setView('record');
  }, [recorder]);

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  };

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        maxWidth="max-w-md"
        ariaLabel="Voice check-in"
        closeOnBackdrop={
          (recorder.state === 'idle' && !submittingText) || view === 'result' || view === 'error'
        }
      >
        <div className="relative overflow-hidden rounded-2xl">
        <SparkleBurst trigger={sparkleKey} />
        {/* Ambient sparkles on result */}
        <AmbientSparkles active={view === 'result'} />

        {/* Burst sparkles on completion */}
        <SparkleParticles active={showSparkles} originX={50} originY={40} count={20} />

        {/* Header */}
	        <div className="flex items-center justify-between px-5 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4">
          <div>
            <h2 className="font-fraunces text-xl text-luna-mist">
              {view === 'result' ? 'Your check-in' : 'How are you feeling?'}
            </h2>
            <p className="text-sm text-luna-mist/50 mt-0.5">
              {view === 'result'
                ? 'Luna heard you'
                : `Good ${getTimeOfDay()}, ${userName}`}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full text-luna-mist/40 hover:text-luna-mist/80 hover:bg-white/5 transition-colors"
            aria-label="Close"
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
	        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <AnimatePresence mode="wait">
            {/* ── Record view ── */}
            {view === 'record' && (
              <motion.div
                key="record"
	                className="flex flex-col items-center gap-4 py-2 sm:gap-6 sm:py-4"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
	                <div className="grid w-full grid-cols-2 gap-2 rounded-2xl bg-white/5 p-1">
	                  {[
	                    { value: 'voice' as const, label: 'Voice', icon: Mic },
	                    { value: 'text' as const, label: 'Type', icon: Edit3 },
	                  ].map(({ value, label, icon: Icon }) => (
	                    <button
	                      key={value}
	                      type="button"
	                      onClick={() => {
	                        recorder.reset();
	                        setInputMode(value);
	                      }}
	                      className={`flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm transition-all ${
	                        inputMode === value
	                          ? 'bg-luna-cream text-luna-ink'
	                          : 'text-luna-mist/60 hover:bg-white/5 hover:text-luna-mist'
	                      }`}
	                    >
	                      <Icon className="h-4 w-4" aria-hidden="true" />
	                      {label}
	                    </button>
	                  ))}
	                </div>

	                {/* Prompt text */}
	                <p className="text-center text-luna-mist/70 text-sm leading-relaxed max-w-xs">
	                  {inputMode === 'voice' && recorder.state === 'idle' &&
	                    'Speak freely — share how your body feels, your mood, your sleep, anything on your mind.'}
	                  {inputMode === 'voice' && recorder.state === 'requesting' && 'Requesting microphone access…'}
	                  {inputMode === 'voice' && recorder.state === 'recording' && (
	                    <span className="text-luna-aurora-pink">
	                      Recording… {formatDuration(recorder.duration)}
	                    </span>
	                  )}
	                  {inputMode === 'voice' && recorder.state === 'processing' && 'Luna is transcribing your words…'}
	                  {inputMode === 'voice' && recorder.state === 'error' && (
	                    <span className="text-luna-rose">{recorder.error}</span>
	                  )}
	                  {inputMode === 'text' &&
	                    'Use the chips, add a few words, or both. Keep it quick.'}
	                </p>

	                {inputMode === 'voice' ? (
	                  <>
	                    <VoiceOrb
	                      state={recorder.state}
	                      audioLevel={recorder.audioLevel}
	                      onClick={handleOrbClick}
	                      size={112}
	                    />

	                    {recorder.state === 'recording' && (
	                      <AudioLevelBars level={recorder.audioLevel} />
	                    )}

	                    {recorder.state === 'idle' && (
	                      <p className="text-xs text-luna-mist/35 text-center">
	                        Tap once to start. Tap again to stop.
	                      </p>
	                    )}
	                  </>
	                ) : (
	                  <div className="w-full space-y-4">
	                    <div className="grid grid-cols-2 gap-2">
	                      {QUICK_CHECK_INS.map((tag) => {
	                        const selected = selectedTags.includes(tag);
	                        return (
	                          <button
	                            key={tag}
	                            type="button"
	                            onClick={() => toggleTag(tag)}
	                            className={`min-h-11 rounded-xl border px-3 text-sm capitalize transition-all ${
	                              selected
	                                ? 'border-luna-aurora-pink/50 bg-luna-aurora-pink/15 text-luna-cream'
	                                : 'border-white/10 bg-white/[0.03] text-luna-mist/65 hover:border-white/20 hover:text-luna-mist'
	                            }`}
	                          >
	                            {tag}
	                          </button>
	                        );
	                      })}
	                    </div>

	                    <textarea
	                      value={textInput}
	                      onChange={(event) => setTextInput(event.target.value)}
	                      placeholder="Anything else Luna should know?"
	                      rows={3}
	                      disabled={submittingText}
	                      className="min-h-24 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-luna-mist placeholder:text-luna-mist/35 transition-colors focus:border-luna-aurora-pink/40 disabled:opacity-60"
	                    />

	                    <button
	                      type="button"
	                      onClick={submitText}
	                      disabled={submittingText || (!textInput.trim() && selectedTags.length === 0)}
	                      className="flex min-h-12 w-full items-center justify-center rounded-full bg-luna-cream px-5 text-sm font-semibold text-luna-ink transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
	                    >
	                      {submittingText ? 'Saving check-in...' : 'Save check-in'}
	                    </button>
	                  </div>
	                )}
	              </motion.div>
	            )}

            {/* ── Result view ── */}
            {view === 'result' && result && (
              <motion.div
                key="result"
	                className="flex flex-col gap-4 sm:gap-5"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
              >
                {/* Weather score */}
	                <div className="flex justify-center py-1 sm:py-2">
                  <WeatherScore
                    score={result.weatherScore}
                    emotionalTone={result.emotionalTone}
                  />
                </div>

                {/* Luna's response */}
                <div className="glass rounded-xl p-4">
                  <p className="text-xs text-luna-aurora-pink/75 uppercase tracking-[0.14em] mb-2">
                    Luna says
                  </p>
                  <p className="text-luna-mist/90 text-sm leading-relaxed italic font-fraunces">
                    &ldquo;{result.lunaResponse}&rdquo;
                  </p>
                </div>

                {/* Transcript */}
	                <details className="group hidden sm:block">
                  <summary className="text-xs text-luna-mist/40 cursor-pointer hover:text-luna-mist/60 transition-colors list-none flex items-center gap-1">
                    <svg
                      width={12}
                      height={12}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="group-open:rotate-90 transition-transform"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    View transcript
                  </summary>
                  <p className="mt-2 text-xs text-luna-mist/50 leading-relaxed pl-4 border-l border-white/10">
                    {result.transcript}
                  </p>
                </details>

                {/* Tags */}
                {(result.triggers.length > 0 || result.remedies.length > 0) && (
                  <div className="flex flex-wrap gap-2">
                    {result.triggers.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs bg-luna-rose/20 text-luna-rose border border-luna-rose/30"
                      >
                        <Activity className="h-3 w-3" aria-hidden="true" />
                        {t}
                      </span>
                    ))}
                    {result.remedies.map((r) => (
                      <span
                        key={r}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs bg-luna-aurora-mint/20 text-luna-aurora-mint border border-luna-aurora-mint/30"
                      >
                        <Sparkles className="h-3 w-3" aria-hidden="true" />
                        {r}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleRetry}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-luna-mist/60 text-sm hover:bg-white/5 transition-colors"
                  >
                    Check in again
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 py-2.5 rounded-xl bg-luna-cream text-luna-ink text-sm font-semibold hover:bg-white transition-colors"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Error view ── */}
            {view === 'error' && (
              <motion.div
                key="error"
                className="flex flex-col items-center gap-5 py-4"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-16 h-16 rounded-full bg-luna-rose/20 flex items-center justify-center">
                  <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#F0A0B8" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-luna-mist/80 text-sm">{submitError ?? recorder.error ?? 'Something went wrong.'}</p>
                  <p className="text-luna-mist/40 text-xs mt-1">Please try again</p>
                </div>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={handleClose}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-luna-mist/60 text-sm hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRetry}
                    className="flex-1 py-2.5 rounded-xl bg-luna-cream text-luna-ink text-sm font-semibold hover:bg-white transition-colors"
                  >
                    Try again
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        </div>
      </Modal>
      <UpgradeModal open={upgradeOpen} onClose={closeUpgrade} feature={upgradeFeature} />
      <CrisisModal
        open={crisisOpen}
        level={crisisLevel}
        message={crisisMessage}
        onClose={() => setCrisisOpen(false)}
      />
    </>
  );
}

// ── Audio level visualiser bars ───────────────────────────────────────────────

function AudioLevelBars({ level }: { level: number }) {
  const bars = 7;
  return (
    <div className="flex items-center gap-1 h-8">
      {Array.from({ length: bars }, (_, i) => {
        const center = Math.floor(bars / 2);
        const distance = Math.abs(i - center);
        const maxHeight = 32 - distance * 4;
        const height = Math.max(4, maxHeight * level + 4);
        return (
          <motion.div
            key={i}
            className="w-1 rounded-full bg-gradient-to-t from-luna-aurora-lilac to-luna-aurora-pink"
            animate={{ height }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}
