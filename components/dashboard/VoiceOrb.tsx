'use client';

import { motion } from 'framer-motion';
import type { RecordingState } from '@/types/voice';

interface VoiceOrbProps {
  state: RecordingState;
  audioLevel: number; // 0–1
  onClick: () => void;
  disabled?: boolean;
  size?: number;
}

const STATE_COLORS: Record<RecordingState, string> = {
  idle: 'from-luna-sunset via-luna-aurora-pink to-luna-storm',
  requesting: 'from-luna-sunset via-luna-aurora-pink to-luna-storm',
  recording: 'from-luna-aurora-pink via-luna-rose to-luna-storm',
  processing: 'from-luna-sunset via-luna-aurora-pink to-luna-aurora-lilac',
  done: 'from-luna-aurora-mint via-luna-aurora-lilac to-luna-aurora-pink',
  error: 'from-red-500 via-luna-rose to-red-400',
};

const STATE_LABELS: Record<RecordingState, string> = {
  idle: 'Tap to speak',
  requesting: 'Requesting mic…',
  recording: 'Tap to stop',
  processing: 'Luna is listening…',
  done: 'Done',
  error: 'Try again',
};

export function VoiceOrb({ state, audioLevel, onClick, disabled = false, size = 120 }: VoiceOrbProps) {
  const isRecording = state === 'recording';
  const isProcessing = state === 'processing';
  const isDisabled = disabled || state === 'requesting' || state === 'processing';

  // Scale the orb based on audio level when recording
  const dynamicScale = isRecording ? 1 + audioLevel * 0.25 : 1;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Outer glow ring */}
      <div className="relative flex items-center justify-center" style={{ width: size + 48, height: size + 48 }}>
        {/* Pulse rings when recording */}
        {isRecording && (
          <>
            <motion.div
              className="absolute rounded-full border border-luna-aurora-pink/30"
              style={{ width: size + 16, height: size + 16 }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute rounded-full border border-luna-aurora-lilac/20"
              style={{ width: size + 32, height: size + 32 }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            />
          </>
        )}

        {/* Processing spinner */}
        {isProcessing && (
          <motion.div
            className="absolute rounded-full border-2 border-transparent border-t-luna-sunset"
            style={{ width: size + 16, height: size + 16 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {/* Main orb button */}
        <motion.button
          onClick={onClick}
          disabled={isDisabled}
          className={`
            relative rounded-full bg-gradient-to-br ${STATE_COLORS[state]}
            shadow-lg cursor-pointer select-none
            disabled:cursor-not-allowed disabled:opacity-70
            focus:outline-none focus-visible:ring-2 focus-visible:ring-luna-aurora-pink focus-visible:ring-offset-2 focus-visible:ring-offset-luna-deep
          `}
          style={{ width: size, height: size }}
          animate={{ scale: dynamicScale }}
          whileHover={!isDisabled ? { scale: dynamicScale * 1.05 } : {}}
          whileTap={!isDisabled ? { scale: dynamicScale * 0.95 } : {}}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          aria-label={STATE_LABELS[state]}
        >
          {/* Inner glow */}
          <div className="absolute inset-0 rounded-full bg-white/10" />

          {/* Icon */}
          <div className="relative flex items-center justify-center w-full h-full">
            {isProcessing ? (
              <ProcessingIcon size={size * 0.35} />
            ) : isRecording ? (
              <StopIcon size={size * 0.3} />
            ) : (
              <MicIcon size={size * 0.35} />
            )}
          </div>
        </motion.button>
      </div>

      {/* State label */}
      <motion.p
        key={state}
        className="text-sm text-luna-mist/70 tracking-wide"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {STATE_LABELS[state]}
      </motion.p>
    </div>
  );
}

function MicIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
      />
    </svg>
  );
}

function StopIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function ProcessingIcon({ size }: { size: number }) {
  return (
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
        />
      </svg>
    </motion.div>
  );
}
