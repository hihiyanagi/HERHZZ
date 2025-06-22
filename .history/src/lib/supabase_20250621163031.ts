import { createClient } from '@supabase/supabase-js'

// 从环境变量获取 Supabase 配置
// VITE_ 前缀让这些环境变量在前端可用
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 检查必要的环境变量是否存在
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// 创建 Supabase 客户端
// 这个客户端会自动处理认证状态和JWT token的管理
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 自动刷新token，当token即将过期时自动更新
    autoRefreshToken: true,
    // 持久化会话，用户刷新页面后保持登录状态
    persistSession: true,
    // 检测会话恢复，页面加载时恢复用户会话
    detectSessionInUrl: true
  }
}) 