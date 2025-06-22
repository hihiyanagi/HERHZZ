import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { EnvDebugger } from '@/components/EnvDebugger'

// 带调试信息的认证表单组件
export const AuthFormDebug: React.FC = () => {
  // 表单状态
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState('')

  // 获取认证功能
  const { signIn, signUp } = useAuth()

  // 检查配置
  const checkConfiguration = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    let configInfo = '🔧 配置检查:\n'
    configInfo += `Supabase URL: ${supabaseUrl ? '✅ 已配置' : '❌ 未配置'}\n`
    configInfo += `Supabase Anon Key: ${supabaseAnonKey ? '✅ 已配置' : '❌ 未配置'}\n`
    
    if (supabaseUrl) {
      configInfo += `URL: ${supabaseUrl}\n`
    }
    if (supabaseAnonKey) {
      configInfo += `Key: ${supabaseAnonKey.substring(0, 20)}...\n`
    }
    
    // 添加环境变量详细信息
    configInfo += '\n📋 环境变量详情:\n'
    configInfo += `NODE_ENV: ${import.meta.env.MODE}\n`
    configInfo += `所有VITE_变量: ${Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')).join(', ')}\n`
    
    setDebugInfo(configInfo)
  }

  // 测试连接
  const testConnection = async () => {
    setDebugInfo('🔗 测试Supabase连接...')
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        setDebugInfo(`❌ 连接失败: ${error.message}`)
      } else {
        setDebugInfo('✅ Supabase连接正常')
      }
    } catch (err) {
      setDebugInfo(`❌ 连接异常: ${err instanceof Error ? err.message : '未知错误'}`)
    }
  }

  // 处理表单提交（带详细调试）
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    setDebugInfo('')

    try {
      if (isSignUp) {
        setDebugInfo('📝 开始注册流程...')
        
        // 显示请求详情
        console.log('注册请求参数:', { email, password: '***' })
        
        const { data, error } = await signUp(email, password)
        
        // 详细的错误信息
        if (error) {
          console.error('注册错误详情:', error)
          setError(`注册失败: ${error.message}`)
          
          // 根据错误类型提供具体建议
          let suggestion = ''
          if (error.message.includes('Invalid login credentials')) {
            suggestion = '建议: 检查邮箱格式和密码强度'
          } else if (error.message.includes('Email not confirmed')) {
            suggestion = '建议: 请检查邮箱并点击验证链接'
          } else if (error.message.includes('User already registered')) {
            suggestion = '建议: 该邮箱已注册，请直接登录'
          } else if (error.message.includes('signup is disabled')) {
            suggestion = '建议: Supabase项目中的用户注册功能可能被禁用'
          } else if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
            suggestion = '建议: 网络连接问题或Supabase配置错误，请检查URL和密钥'
          }
          
          setDebugInfo(`❌ 注册失败\n错误: ${error.message}\n${suggestion}`)
        } else {
          console.log('注册成功:', data)
          setMessage('注册成功！请检查邮箱验证链接。')
          setDebugInfo('✅ 注册请求成功，请检查邮箱')
        }
      } else {
        setDebugInfo('🔐 开始登录流程...')
        
        const { data, error } = await signIn(email, password)
        
        if (error) {
          console.error('登录错误详情:', error)
          setError(`登录失败: ${error.message}`)
          setDebugInfo(`❌ 登录失败: ${error.message}`)
        } else {
          console.log('登录成功:', data)
          setMessage('登录成功！')
          setDebugInfo('✅ 登录成功')
        }
      }
    } catch (err) {
      console.error('认证异常:', err)
      const errorMsg = err instanceof Error ? err.message : '操作失败，请重试'
      setError(errorMsg)
      setDebugInfo(`❌ 异常: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* 环境变量调试器 */}
      <EnvDebugger />

      {/* 调试工具栏 */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">🛠️ 调试工具</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Button onClick={checkConfiguration} variant="outline" size="sm">
              检查配置
            </Button>
            <Button onClick={testConnection} variant="outline" size="sm">
              测试连接
            </Button>
          </div>
          
          {debugInfo && (
            <pre className="text-xs bg-white p-2 rounded border overflow-auto whitespace-pre-wrap">
              {debugInfo}
            </pre>
          )}
        </CardContent>
      </Card>

      {/* 原有的认证表单 */}
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{isSignUp ? '注册账户' : '登录账户'}</CardTitle>
          <CardDescription>
            {isSignUp ? '创建新账户以开始使用' : '登录到你的账户'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 邮箱输入框 */}
            <div className="space-y-2">
              <Label htmlFor="email">邮箱地址</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* 密码输入框 */}
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
              />
              {isSignUp && (
                <p className="text-sm text-gray-500">密码至少6个字符</p>
              )}
            </div>

            {/* 错误提示 */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* 成功提示 */}
            {message && (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {/* 提交按钮 */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? '处理中...' : (isSignUp ? '注册' : '登录')}
            </Button>

            {/* 切换登录/注册模式 */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                  setMessage('')
                  setDebugInfo('')
                }}
                className="text-sm text-blue-600 hover:underline"
                disabled={loading}
              >
                {isSignUp ? '已有账户？点击登录' : '没有账户？点击注册'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 