export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          menopause_stage: 'perimenopause' | 'menopause' | 'postmenopause' | null;
          birth_year: number | null;
          timezone: string | null;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          menopause_stage?: 'perimenopause' | 'menopause' | 'postmenopause' | null;
          birth_year?: number | null;
          timezone?: string | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          menopause_stage?: 'perimenopause' | 'menopause' | 'postmenopause' | null;
          birth_year?: number | null;
          timezone?: string | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      symptom_logs: {
        Row: {
          id: string;
          user_id: string;
          logged_at: string;
          symptoms: Json;
          severity: number;
          mood: string | null;
          energy_level: number | null;
          sleep_quality: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          logged_at?: string;
          symptoms: Json;
          severity: number;
          mood?: string | null;
          energy_level?: number | null;
          sleep_quality?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          logged_at?: string;
          symptoms?: Json;
          severity?: number;
          mood?: string | null;
          energy_level?: number | null;
          sleep_quality?: number | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      user_memory: {
        Row: {
          id: string;
          user_id: string;
          memory_type: 'trigger' | 'remedy' | 'pattern' | 'goal' | 'personal';
          content: string;
          embedding: string | null;
          confidence: number;
          last_referenced: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          memory_type: 'trigger' | 'remedy' | 'pattern' | 'goal' | 'personal';
          content: string;
          embedding?: string | null;
          confidence?: number;
          last_referenced?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          memory_type?: 'trigger' | 'remedy' | 'pattern' | 'goal' | 'personal';
          content?: string;
          embedding?: string | null;
          confidence?: number;
          last_referenced?: string | null;
          created_at?: string;
        };
      };
      forecasts: {
        Row: {
          id: string;
          user_id: string;
          forecast_date: string;
          predicted_symptoms: Json;
          confidence: number;
          weather_data: Json | null;
          actual_outcome: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          forecast_date: string;
          predicted_symptoms: Json;
          confidence?: number;
          weather_data?: Json | null;
          actual_outcome?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          forecast_date?: string;
          predicted_symptoms?: Json;
          confidence?: number;
          weather_data?: Json | null;
          actual_outcome?: Json | null;
          created_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          user_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: 'user' | 'assistant' | 'system';
          content?: string;
          metadata?: Json | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      menopause_stage: 'perimenopause' | 'menopause' | 'postmenopause';
      memory_type: 'trigger' | 'remedy' | 'pattern' | 'goal' | 'personal';
      chat_role: 'user' | 'assistant' | 'system';
    };
  };
}
