'use client';

import { motion } from 'framer-motion';
import type { EmotionalTone } from '@/types/voice';

interface WeatherScoreProps {
  score: number; // 1–10
  emotionalTone: EmotionalTone;
  className?: string;
}

const TONE_CONFIG: Record<
  EmotionalTone,
  { emoji: string; label: string; color: string; description: string }
> = {
  radiant: {
    emoji: '☀️',
    label: 'Radiant',
    color: 'text-luna-gold',
    description: 'You are glowing today',
  },
  hopeful: {
    emoji: '🌤️',
    label: 'Hopeful',
    color: 'text-luna-aurora-blue',
    description: 'Brighter skies ahead',
  },
  steady: {
    emoji: '⛅',
    label: 'Steady',
    color: 'text-luna-mist',
    description: 'Holding your ground',
  },
  tender: {
    emoji: '🌸',
    label: 'Tender',
    color: 'text-luna-pink',
    description: 'Gentle with yourself',
  },
  heavy: {
    emoji: '🌧️',
    label: 'Heavy',
    color: 'text-luna-purple',
    description: 'Carrying a lot today',
  },
  stormy: {
    emoji: '⛈️',
    label: 'Stormy',
    color: 'text-luna-rose',
    description: 'This too shall pass',
  },
  exhausted: {
    emoji: '🌑',
    label: 'Exhausted',
    color: 'text-luna-mist/60',
    description: 'Rest is sacred',
  },
};

function getScoreGradient(score: number): string {
  if (score >= 8) return 'from-luna-gold to-luna-aurora-pink';
  if (score >= 6) return 'from-luna-aurora-blue to-luna-purple';
  if (score >= 4) return 'from-luna-purple to-luna-pink';
  return 'from-luna-rose to-luna-purple';
}

function getScoreLabel(score: number): string {
  if (score >= 9) return 'Brilliant';
  if (score >= 7) return 'Good';
  if (score >= 5) return 'Fair';
  if (score >= 3) return 'Rough';
  return 'Hard';
}

export function WeatherScore({ score, emotionalTone, className = '' }: WeatherScoreProps) {
  const config = TONE_CONFIG[emotionalTone] ?? TONE_CONFIG.steady;
  const gradient = getScoreGradient(score);
  const scoreLabel = getScoreLabel(score);
  const circumference = 2 * Math.PI * 36; // r=36
  const dashOffset = circumference - (score / 10) * circumference;

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Circular score gauge */}
      <div className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
        <svg width={96} height={96} viewBox="0 0 96 96" className="-rotate-90">
          {/* Track */}
          <circle
            cx={48}
            cy={48}
            r={36}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={6}
          />
          {/* Progress */}
          <motion.circle
            cx={48}
            cy={48}
            r={36}
            fill="none"
            stroke="url(#scoreGrad)"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          />
          <defs>
            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-luna-pink)" />
              <stop offset="100%" stopColor="var(--color-luna-gold)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute flex flex-col items-center">
          <motion.span
            className={`text-2xl font-bold bg-gradient-to-br ${gradient} bg-clip-text text-transparent`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-[10px] text-luna-mist/50 uppercase tracking-widest">/ 10</span>
        </div>
      </div>

      {/* Score label */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <p className={`text-lg font-semibold ${config.color}`}>
          {config.emoji} {scoreLabel}
        </p>
        <p className="text-sm text-luna-mist/60 mt-0.5">{config.description}</p>
      </motion.div>

      {/* Tone badge */}
      <motion.div
        className="px-3 py-1 rounded-full glass text-xs text-luna-mist/70 tracking-wide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.8 }}
      >
        {config.label} day
      </motion.div>
    </div>
  );
}
