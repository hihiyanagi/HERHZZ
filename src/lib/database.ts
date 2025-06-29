import { supabase } from './supabase'
import type { Database } from './supabase'

type Tables = Database['public']['Tables']
type UserSettings = Tables['user_settings']['Row']
type UserSettingsInsert = Tables['user_settings']['Insert']
type MenstrualCycle = Tables['menstrual_cycles']['Row']
type MenstrualCycleInsert = Tables['menstrual_cycles']['Insert']
type AudioSession = Tables['audio_sessions']['Row']
type AudioSessionInsert = Tables['audio_sessions']['Insert']
type SleepRecord = Tables['sleep_records']['Row']
type SleepRecordInsert = Tables['sleep_records']['Insert']

// 用户相关操作（使用Supabase内置的auth.users）
export const userService = {
  // 获取当前用户
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // 获取用户资料（从auth.users获取基本信息）
  async getProfile(userId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user && user.id === userId) {
      return {
        id: user.id,
        email: user.email,
        // 从user metadata中获取额外信息
        username: user.user_metadata?.username || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    }
    return null
  },

  // 更新用户资料（更新到user metadata）
  async updateProfile(userId: string, updates: { username?: string; avatar_url?: string }) {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        username: updates.username,
        avatar_url: updates.avatar_url
      }
    })
    
    if (error) throw error
    return data.user
  }
}

// 用户设置相关操作
export const settingsService = {
  // 获取用户设置
  async getUserSettings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error) {
        console.error('获取用户设置失败:', error)
        // 返回默认设置而不是抛出错误
        return {
          user_id: userId,
          default_cycle_length: 28,
          average_menstrual_days: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
      
      return data
    } catch (e) {
      console.error('获取用户设置异常:', e)
      // 返回默认设置
      return {
        user_id: userId,
        default_cycle_length: 28,
        average_menstrual_days: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  },

  // 创建或更新用户设置
  async upsertUserSettings(settings: UserSettingsInsert) {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .upsert(settings)
        .select()
        .single()
      
      if (error) {
        console.error('更新用户设置失败:', error)
        return settings as UserSettings
      }
      
      return data
    } catch (e) {
      console.error('更新用户设置异常:', e)
      return settings as UserSettings
    }
  }
}

// 月经周期相关操作
export const cycleService = {
  // 获取用户的月经周期记录
  async getUserCycles(userId: string, limit = 12) {
    const { data, error } = await supabase
      .from('menstrual_cycles')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  },

  // 获取最近的月经周期
  async getLatestCycle(userId: string) {
    const { data, error } = await supabase
      .from('menstrual_cycles')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false })
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // 添加新的月经周期
  async addCycle(cycleData: MenstrualCycleInsert) {
    const { data, error } = await supabase
      .from('menstrual_cycles')
      .insert(cycleData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 更新月经周期
  async updateCycle(cycleId: string, updates: Partial<MenstrualCycle>) {
    const { data, error } = await supabase
      .from('menstrual_cycles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', cycleId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 删除月经周期
  async deleteCycle(cycleId: string) {
    const { error } = await supabase
      .from('menstrual_cycles')
      .delete()
      .eq('id', cycleId)
    
    if (error) throw error
  }
}

// 音频会话相关操作
export const audioService = {
  // 创建音频会话
  async createSession(sessionData: AudioSessionInsert) {
    const { data, error } = await supabase
      .from('audio_sessions')
      .insert(sessionData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 结束音频会话
  async endSession(sessionId: string, endTime: string, completed = true) {
    const { data, error } = await supabase
      .from('audio_sessions')
      .update({
        end_time: endTime,
        completed,
        duration_minutes: Math.floor(
          (new Date(endTime).getTime() - new Date().getTime()) / (1000 * 60)
        )
      })
      .eq('id', sessionId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 获取用户的音频会话历史
  async getUserSessions(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('audio_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  },

  // 获取统计数据
  async getSessionStats(userId: string, days = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data, error } = await supabase
      .from('audio_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
    
    if (error) throw error
    return data || []
  }
}

// 睡眠记录相关操作
export const sleepService = {
  // 添加睡眠记录
  async addSleepRecord(recordData: SleepRecordInsert) {
    const { data, error } = await supabase
      .from('sleep_records')
      .insert(recordData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 获取睡眠记录
  async getSleepRecords(userId: string, limit = 30) {
    const { data, error } = await supabase
      .from('sleep_records')
      .select('*')
      .eq('user_id', userId)
      .order('sleep_date', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  },

  // 更新睡眠记录
  async updateSleepRecord(recordId: string, updates: Partial<SleepRecord>) {
    const { data, error } = await supabase
      .from('sleep_records')
      .update(updates)
      .eq('id', recordId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// 认证相关操作
export const authService = {
  // 登录
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  },

  // 注册
  async signUp(email: string, password: string, userData?: { username?: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    
    if (error) throw error
    return data
  },

  // 登出
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // 重置密码
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }
} 