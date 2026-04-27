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

  const hoveredDay = hoveredIdx !== null ? sorted[hoveredIdx] : null;
  const hoveredVal = hoveredDay ? (hoveredDay[activeMetric] as number | null) : null;

  return (
    <div className="w-full">
      {/* Metric tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {METRICS.map(m => (
          <button
            key={m}
            onClick={() => setActiveMetric(m)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
              activeMetric === m
                ? 'text-luna-night'
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
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

      {/* Chart */}
      {sorted.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-white/30 text-sm">
          No data yet — complete your first check-in to see trends
        </div>
      ) : (
        <div className="relative w-full">
          {/* Hover tooltip */}
          {hoveredDay && hoveredVal !== null && (
            <div className="absolute top-0 right-0 glass rounded-xl px-3 py-2 text-xs pointer-events-none z-10">
              <div className="text-white/50">{hoveredDay.log_date}</div>
              <div className="font-medium" style={{ color }}>
                {TREND_METRIC_LABELS[activeMetric]}: {hoveredVal}
              </div>
            </div>
          )}

          <svg
            viewBox={`0 0 ${CHART_W} ${CHART_H + 20}`}
            className="w-full"
            style={{ height: 160 }}
            onMouseLeave={() => setHoveredIdx(null)}
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
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth={1}
                  />
                  <text
                    x={-4} y={y + 4}
                    textAnchor="end"
                    fontSize={10}
                    fill="rgba(255,255,255,0.25)"
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
                  r={hoveredIdx === pt.idx ? 5 : 3}
                  fill={color}
                  opacity={hoveredIdx === pt.idx ? 1 : 0.7}
                  style={{ transition: 'r 0.15s, opacity 0.15s' }}
                />
                {/* Invisible hit area */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={12}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIdx(pt.idx)}
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
                fill="rgba(255,255,255,0.25)"
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
