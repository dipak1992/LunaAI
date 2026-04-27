// ── Per-day summary (from daily_summaries view) ──────────────────────────────
export interface DaySummary {
  log_date: string;          // YYYY-MM-DD
  check_in_count: number;
  avg_weather_score: number | null;  // 1-10
  avg_severity: number | null;
  avg_energy: number | null;
  avg_sleep: number | null;
  all_triggers: string[];
  dominant_tone: string | null;
  first_log_at: string;
}

// ── Trigger frequency row ─────────────────────────────────────────────────────
export interface TriggerFrequency {
  trigger_name: string;
  occurrences: number;
  last_seen: string;         // YYYY-MM-DD
}

// ── Trend data point (for line/area charts) ───────────────────────────────────
export interface TrendPoint {
  date: string;              // YYYY-MM-DD
  value: number | null;
}

// ── Metric keys that can be charted ──────────────────────────────────────────
export type TrendMetric =
  | 'avg_weather_score'
  | 'avg_severity'
  | 'avg_energy'
  | 'avg_sleep';

export const TREND_METRIC_LABELS: Record<TrendMetric, string> = {
  avg_weather_score: 'Wellbeing',
  avg_severity:      'Symptom Severity',
  avg_energy:        'Energy',
  avg_sleep:         'Sleep Quality',
};

export const TREND_METRIC_COLORS: Record<TrendMetric, string> = {
  avg_weather_score: '#E9B8FF',
  avg_severity:      '#FF9EC7',
  avg_energy:        '#FFD4A3',
  avg_sleep:         '#A8E6CF',
};

// ── Full insights payload returned by /api/insights ──────────────────────────
export interface InsightsPayload {
  days: DaySummary[];                // last N days (sparse – only days with logs)
  triggers: TriggerFrequency[];      // top triggers sorted by occurrences desc
  streak: number;                    // current consecutive check-in days
  total_check_ins: number;
  date_range: { from: string; to: string };
}

// ── Heatmap cell (calendar view) ─────────────────────────────────────────────
export interface HeatmapCell {
  date: string;
  score: number | null;   // 0 = no data, 1-10 = weather score
  count: number;          // number of check-ins that day
}

// ── Emotional tone colours ────────────────────────────────────────────────────
export const TONE_COLORS: Record<string, string> = {
  calm:       '#A8E6CF',
  anxious:    '#FFD4A3',
  hopeful:    '#E9B8FF',
  frustrated: '#FF9EC7',
  tired:      '#6B5B95',
  energized:  '#FFE5B4',
  sad:        '#8FB8E8',
  grateful:   '#C8A8E9',
};

export function toneColor(tone: string | null): string {
  if (!tone) return '#6B5B95';
  return TONE_COLORS[tone.toLowerCase()] ?? '#6B5B95';
}
