import { generateForecast } from './generate';

/**
 * Call this after a successful symptom_log insert to refresh the forecast
 * in the background (respects the 6h cache — won't call GPT if fresh).
 * Fire-and-forget — does NOT block the caller.
 */
export function scheduleForecastRefresh(userId: string): void {
  generateForecast(userId, { force: false }).catch((err) =>
    console.error('[forecast] background refresh error', err),
  );
}
