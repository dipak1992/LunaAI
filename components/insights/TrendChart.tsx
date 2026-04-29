'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { DaySummary, TrendMetric } from '@/types/insights';
import { TREND_METRIC_LABELS, TREND_METRIC_COLORS } from '@/types/insights';

interface TrendChartProps {
  days: DaySummary[];
}

const METRICS: TrendMetric[] = ['avg_weather_score', 'avg_severity', 'avg_energy', 'avg_sleep'];
const CHART_H = 120;
const CHART_W = 600; // viewBox width; scales with container

function buildPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

export default function TrendChart({ days }: TrendChartProps) {
  const [activeMetric, setActiveMetric] = useState<TrendMetric>('avg_weather_score');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const sorted = useMemo(
    () => [...days].sort((a, b) => a.log_date.localeCompare(b.log_date)),
    [days]
  );

  const { linePath, areaPath, points, minVal, maxVal } = useMemo(() => {
    const values = sorted.map(d => d[activeMetric] as number | null);
    const valid = values.filter((v): v is number => v !== null);
    if (valid.length === 0) {
      return { linePath: '', areaPath: '', points: [], minVal: 0, maxVal: 10 };
    }

    const minV = Math.max(0, Math.min(...valid) - 1);
    const maxV = Math.min(10, Math.max(...valid) + 1);
    const range = maxV - minV || 1;

    const pts: { x: number; y: number; idx: number }[] = [];
    const n = sorted.length;
    values.forEach((v, i) => {
      if (v === null) return;
      const x = n === 1 ? CHART_W / 2 : (i / (n - 1)) * CHART_W;
      const y = CHART_H - ((v - minV) / range) * CHART_H;
      pts.push({ x, y, idx: i });
    });

    const line = buildPath(pts);
    const area =
      pts.length > 0
        ? `${line} L ${pts[pts.length - 1].x} ${CHART_H} L ${pts[0].x} ${CHART_H} Z`
        : '';

    return { linePath: line, areaPath: area, points: pts, minVal: minV, maxVal: maxV };
  }, [sorted, activeMetric]);

  const color = TREND_METRIC_COLORS[activeMetric];
  const gradId = `trend-grad-${activeMetric}`;
  const activeIdx = selectedIdx ?? hoveredIdx;

  // X-axis date labels (show ~5 evenly spaced)
  const xLabels = useMemo(() => {
    if (sorted.length === 0) return [];
    const step = Math.max(1, Math.floor(sorted.length / 5));
    return sorted
      .filter((_, i) => i % step === 0 || i === sorted.length - 1)
      .map(d => {
        const dt = new Date(d.log_date + 'T00:00:00');
        return {
          label: dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          x: sorted.length === 1
            ? CHART_W / 2
            : (sorted.indexOf(d) / (sorted.length - 1)) * CHART_W,
        };
      });
  }, [sorted]);

  const activeDay = activeIdx !== null ? sorted[activeIdx] : null;
  const activeVal = activeDay ? (activeDay[activeMetric] as number | null) : null;
  const metricValues = sorted
    .map(d => d[activeMetric] as number | null)
    .filter((v): v is number => v !== null);
  const latestValue = metricValues.at(-1);
  const avgValue = metricValues.length
    ? Math.round((metricValues.reduce((sum, value) => sum + value, 0) / metricValues.length) * 10) / 10
    : null;

  return (
    <div className="w-full">
      {/* Metric tabs */}
      <div className="mb-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {METRICS.map(m => (
          <button
            key={m}
            onClick={() => {
              setActiveMetric(m);
              setHoveredIdx(null);
              setSelectedIdx(null);
            }}
            className={`min-h-11 rounded-full px-3 py-2 text-xs font-medium transition-all duration-200 sm:min-h-0 sm:py-1 ${
              activeMetric === m
                ? 'text-luna-night'
                : 'bg-white/5 text-white/68 hover:bg-white/10 hover:text-white/86'
            }`}
            style={
              activeMetric === m
                ? { background: TREND_METRIC_COLORS[m], color: '#0A0E27' }
                : {}
            }
          >
            {TREND_METRIC_LABELS[m]}
          </button>
        ))}
      </div>

      {avgValue !== null && (
        <div className="mb-4 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs leading-5 text-white/72">
          <span className="font-medium text-white/90">{TREND_METRIC_LABELS[activeMetric]}</span>
          {' '}averaged {avgValue}/10 across {metricValues.length} logged day{metricValues.length === 1 ? '' : 's'}
          {latestValue !== undefined ? `; latest logged value is ${latestValue}/10.` : '.'}
        </div>
      )}

      {/* Chart */}
      {sorted.length === 0 ? (
        <div className="flex items-center justify-center h-32 rounded-lg border border-white/10 bg-white/[0.035] text-white/68 text-sm">
          No data yet — complete your first check-in to see trends
        </div>
      ) : (
        <div className="relative w-full">
          {/* Hover tooltip */}
          {activeDay && activeVal !== null && (
            <div className="absolute top-0 right-0 rounded-lg border border-white/10 bg-luna-night/95 px-3 py-2 text-xs shadow-xl pointer-events-none z-10">
              <div className="text-white/70">{activeDay.log_date}</div>
              <div className="font-medium" style={{ color }}>
                {TREND_METRIC_LABELS[activeMetric]}: {activeVal}
              </div>
            </div>
          )}

          <svg
            viewBox={`0 0 ${CHART_W} ${CHART_H + 20}`}
            className="w-full"
            style={{ height: 160 }}
            onMouseLeave={() => setHoveredIdx(null)}
            aria-label={`${TREND_METRIC_LABELS[activeMetric]} trend chart`}
          >
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={color} stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Y-axis grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(t => {
              const y = CHART_H * (1 - t);
              const val = Math.round(minVal + t * (maxVal - minVal));
              return (
                <g key={t}>
                  <line
                    x1={0} y1={y} x2={CHART_W} y2={y}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={1}
                  />
                  <text
                    x={-4} y={y + 4}
                    textAnchor="end"
                    fontSize={10}
                    fill="rgba(255,255,255,0.55)"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Area fill */}
            {areaPath && (
              <path d={areaPath} fill={`url(#${gradId})`} />
            )}

            {/* Line */}
            {linePath && (
              <motion.path
                d={linePath}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            )}

            {/* Data points */}
            {points.map(pt => (
              <g key={pt.idx}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={activeIdx === pt.idx ? 5 : 3}
                  fill={color}
                  opacity={activeIdx === pt.idx ? 1 : 0.78}
                  style={{ transition: 'r 0.15s, opacity 0.15s' }}
                />
                {/* Invisible hit area */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={12}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIdx(pt.idx)}
                  onClick={() => setSelectedIdx(selectedIdx === pt.idx ? null : pt.idx)}
                />
              </g>
            ))}

            {/* X-axis labels */}
            {xLabels.map(({ label, x }) => (
              <text
                key={label}
                x={x}
                y={CHART_H + 16}
                textAnchor="middle"
                fontSize={10}
                fill="rgba(255,255,255,0.55)"
              >
                {label}
              </text>
            ))}
          </svg>
        </div>
      )}
    </div>
  );
}
