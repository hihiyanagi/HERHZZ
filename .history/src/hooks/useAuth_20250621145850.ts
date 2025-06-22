import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { authService, userService } from '@/lib/database'

export interface AuthState {
  user: User | null
  profile: any | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    // 获取当前会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        user: session?.user ?? null,
        loading: false
      }))

      // 如果有用户，获取用户资料
      if (session?.user) {
        loadUserProfile(session.user.id)
      }
    })

    // 监听认证状态变化
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setState(prev => ({
        ...prev,
        user: session?.user ?? null,
        loading: false
      }))

      if (session?.user) {
        await loadUserProfile(session.user.id)
      } else {
        setState(prev => ({ ...prev, profile: null }))
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      const profile = await userService.getProfile(userId)
      setState(prev => ({ ...prev, profile, error: null }))
    } catch (error) {
      console.error('加载用户资料失败:', error)
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : '加载用户资料失败'
      }))
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const result = await authService.signIn(email, password)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登录失败'
      setState(prev => ({ ...prev, error: errorMessage, loading: false }))
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const result = await authService.signUp(email, password, userData)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '注册失败'
      setState(prev => ({ ...prev, error: errorMessage, loading: false }))
      throw error
    }
  }

  const signOut = async () => {
    try {
      await authService.signOut()
      setState(prev => ({ ...prev, profile: null }))
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  const updateProfile = async (updates: any) => {
    if (!state.user) throw new Error('用户未登录')
    
    try {
      const updatedProfile = await userService.updateProfile(state.user.id, updates)
      setState(prev => ({ ...prev, profile: updatedProfile }))
      return updatedProfile
    } catch (error) {
      console.error('更新用户资料失败:', error)
      throw error
    }
  }

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    updateProfile
  }
} 