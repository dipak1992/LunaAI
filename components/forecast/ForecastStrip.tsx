'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import StormAlert from './StormAlert';
import {
  type ForecastRecord,
  type ForecastDay,
  stormLevelToWeather,
} from '@/lib/forecast/types';

interface FetchResponse {
  forecast: ForecastRecord | null;
  log_count: number;
  min_required: number;
}

export default function ForecastStrip() {
  const [data, setData] = useState<FetchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadLatest = useCallback(async () => {
    try {
      const res = await fetch('/api/forecast', { cache: 'no-store' });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerGeneration = useCallback(
    async (force = false) => {
      if (generating) return;
      setGenerating(true);
      setError(null);
      try {
        const res = await fetch('/api/forecast/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ force }),
        });
        const json = await res.json();
        if (!res.ok) {
          if (json.error === 'need_more_logs') {
            setError(json.message);
          } else {
            setError(json.error ?? "Couldn't read the sky right now.");
          }
          return;
        }
        setData((prev) => ({
          forecast: json.forecast,
          log_count: prev?.log_count ?? 0,
          min_required: prev?.min_required ?? 7,
        }));
      } catch (err) {
        console.error(err);
        setError("Couldn't read the sky right now.");
      } finally {
        setGenerating(false);
      }
    },
    [generating],
  );

  useEffect(() => {
    loadLatest();
  }, [loadLatest]);

  // Auto-generate if user has enough logs but no forecast yet
  useEffect(() => {
    if (
      !loading &&
      data &&
      !data.forecast &&
      data.log_count >= data.min_required
    ) {
      triggerGeneration(false);
    }
  }, [loading, data, triggerGeneration]);

  if (loading) {
    return <ForecastSkeleton />;
  }

  // Empty state — not enough logs
  if (
    !data?.forecast &&
    (data?.log_count ?? 0) < (data?.min_required ?? 7)
  ) {
    const remaining = (data?.min_required ?? 7) - (data?.log_count ?? 0);
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-luna-whisper/10 bg-luna-whisper/[0.02] px-6 py-8 text-center">
        <p className="font-serif text-lg italic text-luna-cream">
          Your sky is still forming.
        </p>
        <p className="text-sm text-luna-whisper/60">
          {remaining} more check-{remaining === 1 ? 'in' : 'ins'} and Luna
          will read your weather.
        </p>
      </div>
    );
  }

  // Has enough logs but still generating first time
  if (!data?.forecast) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-luna-whisper/10 bg-luna-whisper/[0.02] px-6 py-8 text-center">
        {generating ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            >
              <RefreshCw size={24} className="text-luna-aurora-lilac" strokeWidth={1.5} />
            </motion.div>
            <p className="text-sm text-luna-whisper/70">
              Luna is reading your sky…
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-luna-whisper/70">
              {error ?? 'Ready to read your weather.'}
            </p>
            <button
              onClick={() => triggerGeneration(true)}
              className="rounded-full bg-luna-cream px-5 py-2 text-sm font-medium text-luna-ink transition-transform hover:scale-[1.03]"
            >
              Generate forecast
            </button>
          </>
        )}
      </div>
    );
  }

  const days = data.forecast.forecast as ForecastDay[];

  return (
    <div className="flex flex-col gap-4">
      <StormAlert days={days} />

      <div className="rounded-2xl border border-luna-whisper/10 bg-luna-whisper/[0.02] p-4 md:p-5">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-luna-whisper/40">
              Next 7 days
            </p>
            <p className="font-serif text-base italic text-luna-cream">
              Your weather ahead
            </p>
          </div>
          <button
            onClick={() => triggerGeneration(true)}
            disabled={generating}
            className="flex items-center gap-2 rounded-full border border-luna-whisper/15 px-3 py-1.5 text-xs text-luna-whisper/70 transition-colors hover:text-luna-cream disabled:opacity-50"
          >
            <motion.span
              animate={generating ? { rotate: 360 } : { rotate: 0 }}
              transition={
                generating
                  ? { duration: 1.2, repeat: Infinity, ease: 'linear' }
                  : {}
              }
            >
              <RefreshCw size={12} strokeWidth={2} />
            </motion.span>
            Refresh
          </button>
        </div>

        {/* Day tiles */}
        <div className="grid grid-cols-7 gap-1.5 md:gap-2">
          {days.map((day, i) => (
            <DayTile
              key={day.date}
              day={day}
              index={i}
              isHovered={hoveredDay === day.date}
              onHover={setHoveredDay}
            />
          ))}
        </div>

        {/* Biggest trigger */}
        {data.forecast.biggest_trigger && (
          <p className="mt-3 text-center text-xs text-luna-whisper/40">
            Biggest pattern:{' '}
            <span className="text-luna-whisper/70">
              {data.forecast.biggest_trigger}
            </span>
          </p>
        )}

        {error && (
          <p className="mt-3 text-center text-xs text-luna-aurora-pink/70">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Day tile ──────────────────────────────────────────────────────────────────

function DayTile({
  day,
  index,
  isHovered,
  onHover,
}: {
  day: ForecastDay;
  index: number;
  isHovered: boolean;
  onHover: (d: string | null) => void;
}) {
  const kind = stormLevelToWeather(day.storm_level);
  const isToday = index === 0;

  return (
    <div
      className="relative"
      onMouseEnter={() => onHover(day.date)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(day.date)}
      onBlur={() => onHover(null)}
    >
      <motion.div
        tabIndex={0}
        className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border p-2 transition-all outline-none md:p-3 ${
          isToday
            ? 'border-luna-aurora-lilac/40 bg-luna-aurora-lilac/5'
            : 'border-luna-whisper/10 bg-luna-whisper/[0.02] hover:border-luna-whisper/25 hover:bg-luna-whisper/[0.05]'
        }`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
      >
        <p className="text-[10px] font-medium uppercase tracking-wider text-luna-whisper/50">
          {isToday ? 'Today' : day.day_name.slice(0, 3)}
        </p>
        <WeatherIcon kind={kind} size={22} />
        <p className="text-[11px] text-luna-whisper/60">{day.storm_level}/10</p>
      </motion.div>

      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute bottom-full left-1/2 z-20 mb-2 w-52 -translate-x-1/2 rounded-xl border border-luna-whisper/15 bg-luna-night/95 p-3 shadow-xl backdrop-blur-xl"
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <p className="mb-1 font-serif text-sm italic text-luna-cream">
              {day.day_name}
            </p>
            {day.summary && (
              <p className="mb-2 text-xs italic text-luna-whisper/60">
                &ldquo;{day.summary}&rdquo;
              </p>
            )}
            {day.likely_symptoms.length > 0 && (
              <div className="mb-2">
                <p className="mb-0.5 text-[10px] uppercase tracking-wider text-luna-whisper/40">
                  Likely
                </p>
                <p className="text-xs text-luna-whisper/70">
                  {day.likely_symptoms.slice(0, 3).join(' · ')}
                </p>
              </div>
            )}
            {day.preparation_tips.length > 0 && (
              <div>
                <p className="mb-0.5 text-[10px] uppercase tracking-wider text-luna-whisper/40">
                  Prepare
                </p>
                <ul className="space-y-0.5">
                  {day.preparation_tips.slice(0, 3).map((tip, idx) => (
                    <li key={idx} className="text-xs text-luna-whisper/70">
                      · {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="mt-2 text-[10px] text-luna-whisper/30">
              confidence {Math.round(day.confidence * 100)}%
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ForecastSkeleton() {
  return (
    <div className="rounded-2xl border border-luna-whisper/10 bg-luna-whisper/[0.02] p-4 md:p-5">
      <div className="mb-4 h-10 w-32 animate-pulse rounded-lg bg-luna-whisper/5" />
      <div className="grid grid-cols-7 gap-1.5 md:gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl bg-luna-whisper/5"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
