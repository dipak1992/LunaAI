'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { DaySummary, HeatmapCell } from '@/types/insights';

interface CalendarHeatmapProps {
  days: DaySummary[];
  /** How many weeks to show (default 13 = ~3 months) */
  weeks?: number;
}

// Score → colour stop (maps 1-10 onto a purple→rose gradient)
function scoreToColor(score: number | null, count: number): string {
  if (count === 0 || score === null) return 'rgba(255,255,255,0.04)';
  // 1 = deep storm purple, 10 = warm rose/gold
  const t = (score - 1) / 9; // 0..1
  // interpolate: low=storm purple (#6B5B95), high=aurora rose (#FF9EC7)
  const r = Math.round(107 + (255 - 107) * t);
  const g = Math.round(91  + (158 - 91)  * t);
  const b = Math.round(149 + (199 - 149) * t);
  const alpha = 0.3 + 0.7 * t;
  return `rgba(${r},${g},${b},${alpha})`;
}

function scoreToBorder(score: number | null, count: number): string {
  if (count === 0 || score === null) return 'rgba(255,255,255,0.06)';
  const t = (score - 1) / 9;
  const r = Math.round(107 + (255 - 107) * t);
  const g = Math.round(91  + (158 - 91)  * t);
  const b = Math.round(149 + (199 - 149) * t);
  return `rgba(${r},${g},${b},0.6)`;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function CalendarHeatmap({ days, weeks = 13 }: CalendarHeatmapProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  // Build a lookup: date string → DaySummary
  const byDate = useMemo(() => {
    const m = new Map<string, DaySummary>();
    for (const d of days) m.set(d.log_date, d);
    return m;
  }, [days]);

  // Build grid: weeks × 7 cells, ending today
  const cells = useMemo<HeatmapCell[][]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Align to Sunday
    const endSunday = new Date(today);
    endSunday.setDate(today.getDate() + (6 - today.getDay()));

    const grid: HeatmapCell[][] = [];
    for (let w = weeks - 1; w >= 0; w--) {
      const week: HeatmapCell[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(endSunday);
        date.setDate(endSunday.getDate() - w * 7 - (6 - d));
        const iso = date.toISOString().slice(0, 10);
        const summary = byDate.get(iso);
        week.push({
          date: iso,
          score: summary?.avg_weather_score ?? null,
          count: summary?.check_in_count ?? 0,
        });
      }
      grid.push(week);
    }
    return grid;
  }, [byDate, weeks]);

  // Month labels: find first cell of each month
  const monthLabels = useMemo(() => {
    const labels: { weekIdx: number; label: string }[] = [];
    let lastMonth = -1;
    cells.forEach((week, wi) => {
      const d = new Date(week[0].date);
      if (d.getMonth() !== lastMonth) {
        labels.push({ weekIdx: wi, label: MONTH_ABBR[d.getMonth()] });
        lastMonth = d.getMonth();
      }
    });
    return labels;
  }, [cells]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      {/* Month labels */}
      <div className="flex mb-1" style={{ paddingLeft: '2rem' }}>
        {cells.map((_, wi) => {
          const label = monthLabels.find(m => m.weekIdx === wi);
          return (
            <div key={wi} className="flex-shrink-0" style={{ width: '1.75rem' }}>
              {label && (
                <span className="text-xs text-white/58 leading-none">{label.label}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-0">
        {/* Day-of-week labels */}
        <div className="flex flex-col gap-0.5 mr-1 flex-shrink-0">
          {DAY_LABELS.map((label, i) => (
            <div
              key={label}
              className="flex items-center justify-end"
              style={{ height: '1.5rem' }}
            >
              {i % 2 === 1 && (
                <span className="text-xs text-white/54 pr-1 leading-none">{label}</span>
              )}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-0.5">
          {cells.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((cell) => {
                const isToday = cell.date === today;
                const isFuture = cell.date > today;
                const summary = byDate.get(cell.date);
                const tooltipText = cell.count > 0
                  ? `${cell.date}: ${cell.count} check-in${cell.count > 1 ? 's' : ''}, score ${cell.score ?? '–'}`
                  : cell.date;
                const isSelected = selectedDate === cell.date;

                return (
                  <motion.div
                    key={cell.date}
                    className="relative group outline-none"
                    style={{ width: '1.5rem', height: '1.5rem' }}
                    whileHover={!isFuture ? { scale: 1.3, zIndex: 10 } : {}}
                    transition={{ duration: 0.15 }}
                    tabIndex={isFuture ? -1 : 0}
                    role={isFuture ? undefined : 'button'}
                    aria-label={tooltipText}
                    aria-expanded={isSelected}
                    onClick={() => {
                      if (!isFuture) setSelectedDate(isSelected ? null : cell.date);
                    }}
                    onKeyDown={(event) => {
                      if (isFuture) return;
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedDate(isSelected ? null : cell.date);
                      }
                    }}
                  >
                    <div
                      className="w-full h-full rounded-sm transition-all duration-200"
                      style={{
                        background: isFuture
                          ? 'rgba(255,255,255,0.02)'
                          : scoreToColor(cell.score, cell.count),
                        border: `1px solid ${isFuture ? 'rgba(255,255,255,0.03)' : scoreToBorder(cell.score, cell.count)}`,
                        boxShadow: isToday ? '0 0 0 2px rgba(255,158,199,0.6)' : undefined,
                        opacity: isFuture ? 0.3 : 1,
                      }}
                    />
                    {/* Tooltip */}
                    {!isFuture && (
                      <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 pointer-events-none transition-opacity duration-150 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus:opacity-100'}`}>
                        <div className="rounded-lg border border-white/10 bg-luna-night/95 px-2.5 py-1.5 text-xs text-white/92 whitespace-nowrap shadow-luna">
                          <div className="font-medium">{tooltipText}</div>
                          {summary?.dominant_tone && (
                            <div className="text-white/68 mt-0.5 capitalize">{summary.dominant_tone}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-xs text-white/58">Stormy</span>
        {[1, 3, 5, 7, 9].map(s => (
          <div
            key={s}
            className="w-3.5 h-3.5 rounded-sm"
            style={{
              background: scoreToColor(s, 1),
              border: `1px solid ${scoreToBorder(s, 1)}`,
            }}
          />
        ))}
        <span className="text-xs text-white/58">Clear</span>
      </div>
    </div>
  );
}
