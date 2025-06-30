import { createClient } from '@supabase/supabase-js'

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
          end_date: string | null
          cycle_length: number | null
          flow_intensity: string | null
          symptoms: string[] | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          start_date: string
          end_date?: string | null
          cycle_length?: number | null
          flow_intensity?: string | null
          symptoms?: string[] | null
          notes?: string | null
        }
        Update: {
          start_date?: string
          end_date?: string | null
          cycle_length?: number | null
          flow_intensity?: string | null
          symptoms?: string[] | null
          notes?: string | null
          updated_at?: string
        }
      }
      audio_sessions: {
        Row: {
          id: string
          user_id: string
          cycle_id: string | null
          audio_name: string
          cycle_phase: string
          start_time: string
          end_time: string | null
          duration_minutes: number | null
          completed: boolean
          sleep_timer_minutes: number | null
          created_at: string
        }
        Insert: {
          user_id: string
          cycle_id?: string | null
          audio_name: string
          cycle_phase: string
          start_time: string
          end_time?: string | null
          duration_minutes?: number | null
          completed?: boolean
          sleep_timer_minutes?: number | null
        }
        Update: {
          audio_name?: string
          cycle_phase?: string
          start_time?: string
          end_time?: string | null
          duration_minutes?: number | null
          completed?: boolean
          sleep_timer_minutes?: number | null
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
          cycle_phase: string
          audio_used: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          session_id?: string | null
          sleep_date: string
          bedtime?: string | null
          wake_time?: string | null
          sleep_duration_hours?: number | null
          sleep_quality_rating?: number | null
          cycle_phase: string
          audio_used?: string | null
          notes?: string | null
        }
        Update: {
          sleep_date?: string
          bedtime?: string | null
          wake_time?: string | null
          sleep_duration_hours?: number | null
          sleep_quality_rating?: number | null
          cycle_phase?: string
          audio_used?: string | null
          notes?: string | null
        }
      }
    }
  }
}

// 从环境变量获取 Supabase 配置
// VITE_ 前缀让这些环境变量在前端可用
// 使用空字符串作为默认值，避免undefined错误
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

console.log('🔧 Supabase 配置检查:')
console.log('URL:', supabaseUrl ? '✅ 已配置' : '❌ 未配置')
console.log('Anon Key:', supabaseAnonKey ? '✅ 已配置' : '❌ 未配置')

// 创建占位符客户端
const mockSupabaseClient = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signUp: () => Promise.resolve({ data: { user: { id: 'mock-user-id' } }, error: null }),
    signInWithPassword: () => Promise.resolve({ 
      data: { 
        user: { 
          id: 'mock-user-id',
          email: 'mock@example.com'
        },
        session: {
          access_token: 'mock-token',
          refresh_token: 'mock-refresh-token',
          expires_at: Date.now() + 3600000
        }
      }, 
      error: null 
    }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: (callback: any) => {
      // 立即触发一次回调，模拟已登录状态
      setTimeout(() => {
        callback('SIGNED_IN', {
          user: { 
            id: 'mock-user-id',
            email: 'mock@example.com'
          },
          session: {
            access_token: 'mock-token',
            refresh_token: 'mock-refresh-token',
            expires_at: Date.now() + 3600000
          }
        });
      }, 100);
      
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  },
  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: {}, error: null }),
        order: () => ({
          limit: () => Promise.resolve({ data: [], error: null })
        })
      }),
      order: () => ({
        limit: () => Promise.resolve({ data: [], error: null })
      })
    }),
    insert: () => Promise.resolve({ data: { id: 'mock-id' }, error: null }),
    update: () => ({
      eq: () => Promise.resolve({ data: {}, error: null })
    }),
    delete: () => ({
      eq: () => Promise.resolve({ data: {}, error: null })
    })
  })
};

// 更安全的环境变量检查，不会导致应用崩溃
let supabase: any = null;

try {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase环境变量未正确配置，使用模拟客户端')
    console.warn('请创建 .env 文件并添加以下配置:')
    console.warn('VITE_SUPABASE_URL=你的supabase项目url')
    console.warn('VITE_SUPABASE_ANON_KEY=你的supabase匿名密钥')
    
    // 使用模拟客户端
    supabase = mockSupabaseClient;
  } else {
    // 创建正常的 Supabase 客户端
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        // 自动刷新token，当token即将过期时自动更新
        autoRefreshToken: true,
        // 持久化会话，用户刷新页面后保持登录状态
        persistSession: true,
        // 检测会话恢复，页面加载时恢复用户会话
        detectSessionInUrl: true
      }
    })
    console.log('✅ Supabase 客户端创建成功')
  }
} catch (error) {
  console.error('❌ 创建 Supabase 客户端失败:', error)
  // 使用模拟客户端
  supabase = mockSupabaseClient;
}

// 导出配置状态检查函数
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// 导出环境变量信息（用于调试）
export const getSupabaseConfig = () => {
  return {
    url: supabaseUrl || '未配置',
    hasAnonKey: !!supabaseAnonKey,
    configured: isSupabaseConfigured(),
    usingMock: !isSupabaseConfigured()
  }
}

export { supabase } 