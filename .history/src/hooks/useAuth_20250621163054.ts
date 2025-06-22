import { useState, useEffect } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

// 认证状态接口定义
interface AuthState {
  user: User | null          // 当前登录用户信息
  session: Session | null    // 当前会话信息（包含JWT token）
  loading: boolean           // 是否正在加载认证状态
}

// 自定义认证Hook，管理用户登录状态
export const useAuth = () => {
  // 认证状态
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true, // 初始化时设为true，等待获取认证状态
  })

  useEffect(() => {
    // 获取初始会话状态
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
      })
    }

    getInitialSession()

    // 监听认证状态变化
    // 当用户登录、登出或token刷新时，这个监听器会被触发
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
        })
      }
    )

    // 清理监听器
    return () => subscription.unsubscribe()
  }, [])

  // 邮箱密码注册
  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) throw error
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as AuthError }
    }
  }

  // 邮箱密码登录
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as AuthError }
    }
  }

  // 登出
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      return { error: null }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  // 获取当前用户的JWT Token
  // 这个token用于向后端API发起请求时验证身份
  const getAccessToken = async (): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return session?.access_token ?? null
    } catch (error) {
      console.error('Error getting access token:', error)
      return null
    }
  }

  return {
    // 认证状态
    ...authState,
    
    // 认证方法
    signUp,
    signIn,
    signOut,
    getAccessToken,
    
    // 便捷的状态检查
    isAuthenticated: !!authState.user,
    isLoading: authState.loading,
  }
} 