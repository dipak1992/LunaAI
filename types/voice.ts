// Voice check-in types for Luna AI

export type RecordingState = 'idle' | 'requesting' | 'recording' | 'processing' | 'done' | 'error';

export interface VoiceCheckInResult {
  transcript: string;
  aiSummary: string;
  lunaResponse: string;
  weatherScore: number; // 1–10
  emotionalTone: EmotionalTone;
  triggers: string[];
  remedies: string[];
  logId: string;
}

export type EmotionalTone =
  | 'radiant'
  | 'hopeful'
  | 'steady'
  | 'tender'
  | 'heavy'
  | 'stormy'
  | 'exhausted';

export interface SymptomExtraction {
  symptoms: string[];
  severity: number; // 1–10
  mood: string;
  energy_level: number; // 1–10
  sleep_quality: number; // 1–10
  triggers: string[];
  remedies: string[];
  emotional_tone: EmotionalTone;
  weather_score: number; // 1–10
  ai_summary: string;
  luna_response: string;
}

export interface AudioLevel {
  level: number; // 0–1 normalised RMS
  timestamp: number;
}

export interface UseVoiceRecorderReturn {
  state: RecordingState;
  audioLevel: number;
  duration: number; // seconds
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  reset: () => void;
  audioBlob: Blob | null;
}
