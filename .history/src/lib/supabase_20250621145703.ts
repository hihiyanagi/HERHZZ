import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('缺少 Supabase 环境变量。请检查 .env 文件中的 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库类型定义
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username?: string
          avatar_url?: string
          birth_year?: number
          timezone: string
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username?: string
          avatar_url?: string
          birth_year?: number
          timezone?: string
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          username?: string
          avatar_url?: string
          birth_year?: number
          timezone?: string
          onboarding_completed?: boolean
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          user_id: string
          default_cycle_length: number
          average_menstrual_days: number
          notification_enabled: boolean
          theme_preference: string
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
          theme_preference?: string
          privacy_mode?: boolean
          data_sharing_consent?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          default_cycle_length?: number
          average_menstrual_days?: number
          notification_enabled?: boolean
          theme_preference?: string
          privacy_mode?: boolean
          data_sharing_consent?: boolean
          updated_at?: string
        }
      }
      menstrual_cycles: {
        Row: {
          id: string
          user_id: string
          start_date: string
          end_date?: string
          cycle_length?: number
          flow_intensity?: string
          symptoms?: string[]
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          start_date: string
          end_date?: string
          cycle_length?: number
          flow_intensity?: string
          symptoms?: string[]
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          start_date?: string
          end_date?: string
          cycle_length?: number
          flow_intensity?: string
          symptoms?: string[]
          notes?: string
          updated_at?: string
        }
      }
      audio_sessions: {
        Row: {
          id: string
          user_id: string
          cycle_id?: string
          audio_name: string
          cycle_phase: string
          start_time: string
          end_time?: string
          duration_minutes?: number
          completed: boolean
          sleep_timer_minutes?: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          cycle_id?: string
          audio_name: string
          cycle_phase: string
          start_time: string
          end_time?: string
          duration_minutes?: number
          completed?: boolean
          sleep_timer_minutes?: number
          created_at?: string
        }
        Update: {
          audio_name?: string
          cycle_phase?: string
          end_time?: string
          duration_minutes?: number
          completed?: boolean
          sleep_timer_minutes?: number
        }
      }
      sleep_records: {
        Row: {
          id: string
          user_id: string
          session_id?: string
          sleep_date: string
          bedtime?: string
          wake_time?: string
          sleep_duration_hours?: number
          sleep_quality_rating?: number
          cycle_phase: string
          audio_used?: string
          notes?: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id?: string
          sleep_date: string
          bedtime?: string
          wake_time?: string
          sleep_duration_hours?: number
          sleep_quality_rating?: number
          cycle_phase: string
          audio_used?: string
          notes?: string
          created_at?: string
        }
        Update: {
          bedtime?: string
          wake_time?: string
          sleep_duration_hours?: number
          sleep_quality_rating?: number
          cycle_phase?: string
          audio_used?: string
          notes?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 