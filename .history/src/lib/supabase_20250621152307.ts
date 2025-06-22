import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// 数据库类型定义
export interface Database {
  public: {
    Tables: {
      user_settings: {
        Row: {
          user_id: string
          default_cycle_length: number
          average_menstrual_days: number
          notification_enabled: boolean
          theme_preference: 'light' | 'dark' | 'system'
          privacy_mode: boolean
          data_sharing_consent: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          default_cycle_length?: number
          average_menstrual_days?: number
          notification_enabled?: boolean
          theme_preference?: 'light' | 'dark' | 'system'
          privacy_mode?: boolean
          data_sharing_consent?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          default_cycle_length?: number
          average_menstrual_days?: number
          notification_enabled?: boolean
          theme_preference?: 'light' | 'dark' | 'system'
          privacy_mode?: boolean
          data_sharing_consent?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      menstrual_cycles: {
        Row: {
          id: string
          user_id: string
          start_date: string
          end_date: string | null
          cycle_length: number | null
          flow_intensity: 'light' | 'normal' | 'heavy' | null
          symptoms: string[]
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          start_date: string
          end_date?: string | null
          cycle_length?: number | null
          flow_intensity?: 'light' | 'normal' | 'heavy' | null
          symptoms?: string[]
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          start_date?: string
          end_date?: string | null
          cycle_length?: number | null
          flow_intensity?: 'light' | 'normal' | 'heavy' | null
          symptoms?: string[]
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      audio_sessions: {
        Row: {
          id: string
          user_id: string
          cycle_id: string | null
          audio_name: string
          cycle_phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal'
          start_time: string
          end_time: string | null
          duration_minutes: number | null
          completed: boolean
          sleep_timer_minutes: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          cycle_id?: string | null
          audio_name: string
          cycle_phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal'
          start_time: string
          end_time?: string | null
          duration_minutes?: number | null
          completed?: boolean
          sleep_timer_minutes?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          cycle_id?: string | null
          audio_name?: string
          cycle_phase?: 'menstrual' | 'follicular' | 'ovulation' | 'luteal'
          start_time?: string
          end_time?: string | null
          duration_minutes?: number | null
          completed?: boolean
          sleep_timer_minutes?: number | null
          created_at?: string
        }
      }
      sleep_records: {
        Row: {
          id: string
          user_id: string
          session_id: string | null
          sleep_date: string
          bedtime: string | null
          wake_time: string | null
          sleep_duration_hours: number | null
          sleep_quality_rating: number | null
          cycle_phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal'
          audio_used: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id?: string | null
          sleep_date: string
          bedtime?: string | null
          wake_time?: string | null
          sleep_duration_hours?: number | null
          sleep_quality_rating?: number | null
          cycle_phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal'
          audio_used?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string | null
          sleep_date?: string
          bedtime?: string | null
          wake_time?: string | null
          sleep_duration_hours?: number | null
          sleep_quality_rating?: number | null
          cycle_phase?: 'menstrual' | 'follicular' | 'ovulation' | 'luteal'
          audio_used?: string | null
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_cycle_phase: {
        Args: {
          p_user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey) 