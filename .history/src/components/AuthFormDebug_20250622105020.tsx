import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { EnvDebugger } from '@/components/EnvDebugger'

// 增强版认证表单 - 包含调试功能
export const AuthFormDebug: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState('')

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

  // 详细的错误处理函数
  const handleError = (error: any) => {
    console.error('认证错误详情:', error)
    
    let userMessage = ''
    let debugMessage = `错误代码: ${error.message}`
    
    switch (error.message) {
      case 'Invalid login credentials':
        userMessage = '登录凭据无效。请检查：\n1. 邮箱是否正确\n2. 密码是否正确\n3. 账户是否已验证'
        break
      case 'Email not confirmed':
        userMessage = '邮箱尚未验证。请检查您的邮箱并点击验证链接。'
        break
      case 'User not found':
        userMessage = '用户不存在。请检查邮箱地址或先注册账户。'
        break
      case 'Too many requests':
        userMessage = '请求过于频繁，请稍后再试。'
        break
      default:
        userMessage = `登录失败: ${error.message}`
    }
    
    setError(userMessage)
    setDebugInfo(debugMessage)
  }

  // 重新发送验证邮件
  const resendVerification = async () => {
    if (!email) {
      setError('请先输入邮箱地址')
      return
    }
    
    setLoading(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })
      
      if (error) {
        if (error.message.includes('User not found')) {
          setMessage('该邮箱地址未注册，请先注册账户')
        } else if (error.message.includes('already confirmed')) {
          setMessage('该邮箱已经验证过了，请直接登录')
        } else {
          setError(`重发验证邮件失败: ${error.message}`)
        }
      } else {
        setMessage('验证邮件已重新发送，请检查您的邮箱')
      }
    } catch (err) {
      setError('重发验证邮件时出错')
    } finally {
      setLoading(false)
    }
  }

  // 重置密码
  const resetPassword = async () => {
    if (!email) {
      setError('请先输入邮箱地址')
      return
    }
    
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) {
        setError(`密码重置失败: ${error.message}`)
      } else {
        setMessage('密码重置邮件已发送，请检查您的邮箱')
      }
    } catch (err) {
      setError('密码重置时出错')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    setDebugInfo('')

    try {
      if (isSignUp) {
        const { data, error } = await signUp(email, password)
        
        if (error) {
          handleError(error)
        } else {
          setMessage('注册成功！请检查邮箱中的验证链接，验证后即可登录。')
        }
      } else {
        const { data, error } = await signIn(email, password)
        
        if (error) {
          handleError(error)
        } else {
          setMessage('登录成功！')
        }
      }
    } catch (err) {
      setError('操作失败，请重试')
      console.error('认证操作异常:', err)
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

            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  <div className="whitespace-pre-line">{error}</div>
                  {debugInfo && (
                    <div className="mt-2 text-xs opacity-70">
                      调试信息: {debugInfo}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? '处理中...' : (isSignUp ? '注册' : '登录')}
            </Button>

            {/* 额外的帮助按钮 */}
            {!isSignUp && (
              <div className="space-y-2">
                <Button 
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={resendVerification}
                  disabled={loading}
                >
                  重新发送验证邮件
                </Button>
                
                <Button 
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={resetPassword}
                  disabled={loading}
                >
                  忘记密码？重置密码
                </Button>
              </div>
            )}

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