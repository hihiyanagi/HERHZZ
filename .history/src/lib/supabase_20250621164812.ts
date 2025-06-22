import { createClient } from '@supabase/supabase-js'

// 从环境变量获取 Supabase 配置
// VITE_ 前缀让这些环境变量在前端可用
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 Supabase 配置检查:')
console.log('URL:', supabaseUrl ? '✅ 已配置' : '❌ 未配置')
console.log('Anon Key:', supabaseAnonKey ? '✅ 已配置' : '❌ 未配置')

// 更安全的环境变量检查，不会导致应用崩溃
let supabase: any = null

try {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase环境变量未正确配置')
    console.warn('请检查 .env 文件中的以下配置:')
    console.warn('VITE_SUPABASE_URL=你的supabase项目url')
    console.warn('VITE_SUPABASE_ANON_KEY=你的supabase匿名密钥')
    
    // 创建一个占位符客户端，避免应用崩溃
    supabase = {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: new Error('Supabase未配置') }),
        signUp: () => Promise.resolve({ data: null, error: new Error('Supabase未配置，请检查环境变量') }),
        signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase未配置，请检查环境变量') }),
        signOut: () => Promise.resolve({ error: new Error('Supabase未配置') }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      }
    }
  } else {
    // 创建正常的 Supabase 客户端
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
  // 创建占位符客户端
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: new Error('Supabase配置错误') }),
      signUp: () => Promise.resolve({ data: null, error: new Error('Supabase配置错误') }),
      signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase配置错误') }),
      signOut: () => Promise.resolve({ error: new Error('Supabase配置错误') }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    }
  }
}

// 导出配置状态检查函数
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// 导出环境变量信息（用于调试）
export const getSupabaseConfig = () => {
  return {
    url: supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    configured: isSupabaseConfigured()
  }
}

export { supabase } 