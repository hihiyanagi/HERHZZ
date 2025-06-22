import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { cycleService, settingsService } from '@/lib/database'

export type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal"

export interface CycleData {
  id: string
  start_date: string
  end_date?: string
  cycle_length?: number
  flow_intensity?: string
  symptoms?: string[]
  notes?: string
}

export interface CycleSettings {
  default_cycle_length: number
  average_menstrual_days: number
}

export function useCycle() {
  const { user } = useAuth()
  const [cycles, setCycles] = useState<CycleData[]>([])
  const [currentCycle, setCurrentCycle] = useState<CycleData | null>(null)
  const [settings, setSettings] = useState<CycleSettings>({
    default_cycle_length: 28,
    average_menstrual_days: 5
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 计算当前周期阶段
  const determineCyclePhase = (cycleStartDate: Date, currentDate: Date = new Date()): CyclePhase => {
    const daysDiff = Math.floor((currentDate.getTime() - cycleStartDate.getTime()) / (1000 * 60 * 60 * 24))
    const cycleDays = daysDiff % settings.default_cycle_length
    
    if (cycleDays < settings.average_menstrual_days) return "menstrual"
    if (cycleDays < settings.default_cycle_length * 0.4) return "follicular"
    if (cycleDays < settings.default_cycle_length * 0.6) return "ovulation"
    return "luteal"
  }

  // 获取当前周期阶段
  const getCurrentPhase = (): CyclePhase => {
    if (!currentCycle) return "menstrual"
    return determineCyclePhase(new Date(currentCycle.start_date))
  }

  // 计算周期天数
  const getCycleDayNumber = (): number => {
    if (!currentCycle) return 1
    const startDate = new Date(currentCycle.start_date)
    const currentDate = new Date()
    const daysDiff = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    return (daysDiff % settings.default_cycle_length) + 1
  }

  // 预测下次月经日期
  const getNextPeriodDate = (): Date => {
    if (!currentCycle) {
      const today = new Date()
      today.setDate(today.getDate() + settings.default_cycle_length)
      return today
    }
    
    const startDate = new Date(currentCycle.start_date)
    startDate.setDate(startDate.getDate() + settings.default_cycle_length)
    return startDate
  }

  // 加载数据
  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // 并行加载周期数据和设置
        const [cyclesData, settingsData] = await Promise.all([
          cycleService.getUserCycles(user.id),
          settingsService.getUserSettings(user.id)
        ])

        setCycles(cyclesData)
        
        // 设置当前周期（最近的一次）
        if (cyclesData.length > 0) {
          setCurrentCycle(cyclesData[0])
        }

        // 更新设置
        if (settingsData) {
          setSettings({
            default_cycle_length: settingsData.default_cycle_length,
            average_menstrual_days: settingsData.average_menstrual_days
          })
        }

      } catch (err) {
        console.error('加载周期数据失败:', err)
        setError(err instanceof Error ? err.message : '加载数据失败')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  // 添加新周期
  const addCycle = async (startDate: string, symptoms?: string[], notes?: string) => {
    if (!user) throw new Error('用户未登录')

    try {
      const newCycle = await cycleService.addCycle({
        user_id: user.id,
        start_date: startDate,
        symptoms: symptoms || [],
        notes: notes || ''
      })

      setCycles(prev => [newCycle, ...prev])
      setCurrentCycle(newCycle)
      return newCycle
    } catch (err) {
      console.error('添加周期失败:', err)
      throw err
    }
  }

  // 更新周期
  const updateCycle = async (cycleId: string, updates: Partial<CycleData>) => {
    try {
      const updatedCycle = await cycleService.updateCycle(cycleId, updates)
      
      setCycles(prev => 
        prev.map(cycle => 
          cycle.id === cycleId ? updatedCycle : cycle
        )
      )

      if (currentCycle?.id === cycleId) {
        setCurrentCycle(updatedCycle)
      }

      return updatedCycle
    } catch (err) {
      console.error('更新周期失败:', err)
      throw err
    }
  }

  // 删除周期
  const deleteCycle = async (cycleId: string) => {
    try {
      await cycleService.deleteCycle(cycleId)
      
      setCycles(prev => prev.filter(cycle => cycle.id !== cycleId))
      
      if (currentCycle?.id === cycleId) {
        const remainingCycles = cycles.filter(cycle => cycle.id !== cycleId)
        setCurrentCycle(remainingCycles.length > 0 ? remainingCycles[0] : null)
      }
    } catch (err) {
      console.error('删除周期失败:', err)
      throw err
    }
  }

  // 更新设置
  const updateSettings = async (newSettings: Partial<CycleSettings>) => {
    if (!user) throw new Error('用户未登录')

    try {
      const updatedSettings = await settingsService.upsertUserSettings({
        user_id: user.id,
        ...settings,
        ...newSettings
      })

      setSettings({
        default_cycle_length: updatedSettings.default_cycle_length,
        average_menstrual_days: updatedSettings.average_menstrual_days
      })

      return updatedSettings
    } catch (err) {
      console.error('更新设置失败:', err)
      throw err
    }
  }

  return {
    cycles,
    currentCycle,
    settings,
    loading,
    error,
    getCurrentPhase,
    getCycleDayNumber,
    getNextPeriodDate,
    addCycle,
    updateCycle,
    deleteCycle,
    updateSettings
  }
} 