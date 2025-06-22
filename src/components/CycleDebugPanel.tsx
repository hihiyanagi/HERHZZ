import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useCycle } from '@/hooks/useCycle'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DebugLog {
  timestamp: string
  level: 'info' | 'success' | 'warning' | 'error'
  message: string
  data?: any
}

export const CycleDebugPanel: React.FC = () => {
  const { user, session, isAuthenticated } = useAuth()
  const { addCycle } = useCycle()
  const [logs, setLogs] = useState<DebugLog[]>([])
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isTestingSave, setIsTestingSave] = useState(false)

  const addLog = (level: DebugLog['level'], message: string, data?: any) => {
    const log: DebugLog = {
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      data
    }
    setLogs(prev => [log, ...prev])
  }

  // 测试基本连接
  const testConnection = async () => {
    setIsTestingConnection(true)
    addLog('info', '🔄 开始测试 Supabase 连接...')

    try {
      // 1. 测试基本连接
      const { data: healthCheck, error: healthError } = await supabase
        .from('menstrual_cycles')
        .select('id')
        .limit(1)

      if (healthError) {
        addLog('error', '❌ Supabase 连接失败', healthError)
        return
      }

      addLog('success', '✅ Supabase 连接正常')

      // 2. 检查用户认证
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      
      if (!currentSession) {
        addLog('warning', '⚠️ 用户未登录或会话过期')
        return
      }

      addLog('success', `✅ 用户已登录: ${currentSession.user.email}`)
      addLog('info', `🔑 Token 有效期: ${new Date(currentSession.expires_at! * 1000).toLocaleString()}`)

      // 3. 测试数据库权限
      try {
        const { data: permissionTest, error: permissionError } = await supabase
          .from('menstrual_cycles')
          .select('*')
          .eq('user_id', currentSession.user.id)
          .limit(1)

        if (permissionError) {
          addLog('error', '❌ 数据库权限检查失败', permissionError)
        } else {
          addLog('success', '✅ 数据库权限正常')
        }
      } catch (permissionErr) {
        addLog('error', '❌ 权限测试异常', permissionErr)
      }

    } catch (err) {
      addLog('error', '❌ 连接测试失败', err)
    } finally {
      setIsTestingConnection(false)
    }
  }

  // 测试保存功能
  const testSave = async () => {
    setIsTestingSave(true)
    addLog('info', '🔄 开始测试月经周期保存...')

    try {
      if (!user) {
        addLog('error', '❌ 用户未登录')
        return
      }

      const testDate = new Date().toISOString().split('T')[0]
      addLog('info', `📅 使用测试日期: ${testDate}`)

      // 尝试保存测试数据
      const result = await addCycle(testDate, ['测试症状'], '这是一条测试记录 - 可以安全删除')
      
      addLog('success', '✅ 保存测试成功！', result)
      addLog('info', '💡 测试记录已创建，你可以在应用中删除它')

    } catch (error) {
      addLog('error', '❌ 保存测试失败', {
        message: error instanceof Error ? error.message : '未知错误',
        name: error instanceof Error ? error.name : '未知',
        stack: error instanceof Error ? error.stack : '无堆栈信息'
      })

      // 提供具体的解决建议
      if (error instanceof Error) {
        if (error.message.includes('policy')) {
          addLog('warning', '💡 建议: 检查 Supabase 的行级安全策略配置')
        } else if (error.message.includes('permission')) {
          addLog('warning', '💡 建议: 检查数据库权限设置')
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          addLog('warning', '💡 建议: 检查网络连接和 Supabase URL 配置')
        } else if (error.message.includes('JWT') || error.message.includes('token')) {
          addLog('warning', '💡 建议: 尝试重新登录刷新认证令牌')
        }
      }
    } finally {
      setIsTestingSave(false)
    }
  }

  // 清除日志
  const clearLogs = () => {
    setLogs([])
  }

  const getLevelColor = (level: DebugLog['level']) => {
    switch (level) {
      case 'success': return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'error': return 'text-red-400 bg-red-500/10 border-red-500/20'
      case 'warning': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          🔧 月经周期保存问题诊断工具
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 当前状态 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">认证状态</h3>
            <p className={`text-sm ${isAuthenticated ? 'text-green-400' : 'text-red-400'}`}>
              {isAuthenticated ? '✅ 已登录' : '❌ 未登录'}
            </p>
            {user && (
              <p className="text-white/70 text-xs mt-1">{user.email}</p>
            )}
          </div>
          
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">会话状态</h3>
            <p className={`text-sm ${session ? 'text-green-400' : 'text-red-400'}`}>
              {session ? '✅ 会话有效' : '❌ 无会话'}
            </p>
            {session && (
              <p className="text-white/70 text-xs mt-1">
                过期: {new Date(session.expires_at! * 1000).toLocaleString()}
              </p>
            )}
          </div>
          
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">环境配置</h3>
            <p className="text-green-400 text-sm">✅ Supabase 已配置</p>
            <p className="text-white/70 text-xs mt-1">URL 和密钥已设置</p>
          </div>
        </div>

        {/* 测试按钮 */}
        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={testConnection}
            disabled={isTestingConnection}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isTestingConnection ? '测试中...' : '🔍 测试连接'}
          </Button>
          
          <Button
            onClick={testSave}
            disabled={isTestingSave || !isAuthenticated}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isTestingSave ? '保存中...' : '💾 测试保存'}
          </Button>
          
          <Button
            onClick={clearLogs}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            🗑️ 清除日志
          </Button>
        </div>

        {/* 日志显示 */}
        {logs.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <h3 className="text-white font-semibold mb-2">诊断日志</h3>
            {logs.map((log, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${getLevelColor(log.level)}`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-medium">{log.message}</span>
                  <span className="text-xs opacity-70">{log.timestamp}</span>
                </div>
                {log.data && (
                  <pre className="text-xs mt-2 opacity-80 overflow-x-auto bg-black/20 p-2 rounded">
                    {typeof log.data === 'string' 
                      ? log.data 
                      : JSON.stringify(log.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-6">
          <h3 className="text-blue-200 font-semibold mb-2">📋 使用说明</h3>
          <ul className="text-blue-100 text-sm space-y-1">
            <li>• <strong>测试连接</strong>：检查 Supabase 连接、用户认证和数据库权限</li>
            <li>• <strong>测试保存</strong>：模拟实际的月经周期数据保存操作</li>
            <li>• 如果测试失败，日志会显示具体错误和解决建议</li>
            <li>• 测试成功后，你可以尝试正常使用保存功能</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
} 