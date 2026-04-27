export interface ForecastDay {
  date: string;                   // ISO date (YYYY-MM-DD)
  day_name: string;               // "Monday"
  storm_level: number;            // 1-10
  likely_symptoms: string[];      // ["hot flashes", "fatigue"]
  preparation_tips: string[];     // ["hydrate early", "gentle walk"]
  confidence: number;             // 0-1
  summary: string;                // one poetic sentence
}

export interface ForecastPayload {
  forecast: ForecastDay[];
  patterns_detected: string[];
  biggest_trigger: string | null;
}

export interface ForecastRecord extends ForecastPayload {
  id: string;
  generated_at: string;
  source_log_count: number;
}

export type WeatherKind =
  | 'clear'
  | 'partly'
  | 'cloudy'
  | 'rain'
  | 'storm'
  | 'thunder';

export function stormLevelToWeather(level: number): WeatherKind {
  if (level <= 2) return 'clear';
  if (level <= 4) return 'partly';
  if (level <= 5) return 'cloudy';
  if (level <= 7) return 'rain';
  if (level <= 8) return 'storm';
  return 'thunder';
}
