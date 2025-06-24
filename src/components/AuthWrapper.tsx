import React, { createContext, useContext } from 'react'
import { useAuth, AuthState } from '@/hooks/useAuth'
import { isSupabaseConfigured } from '@/lib/supabase'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { useState } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'

// 创建认证上下文
const AuthContext = createContext<AuthState & {
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, userData?: any) => Promise<any>
  signOut: () => Promise<void>
  updateProfile: (updates: any) => Promise<any>
} | null>(null)

// 演示模式提示组件
function DemoModeNotice() {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-yellow-800">演示模式</h3>
          <p className="text-sm text-yellow-700 mt-1">
            Supabase未配置，应用运行在演示模式下。要启用完整功能，请配置环境变量。
          </p>
        </div>
      </div>
    </div>
  )
}

// 认证提供者组件
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 如果Supabase未配置，提供模拟的认证状态
  if (!isSupabaseConfigured) {
    const mockAuth = {
      user: null,
      profile: null,
      loading: false,
      error: null,
      signIn: async () => {},
      signUp: async () => {},
      signOut: async () => {},
      updateProfile: async () => {}
    }
    
    return (
      <AuthContext.Provider value={mockAuth}>
        {children}
      </AuthContext.Provider>
    )
  }

  const auth = useAuth()
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

// 使用认证上下文的 hook
export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}

// 登录表单组件
function LoginForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp, error } = useAuthContext()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        await signIn(email, password)
      } else {
        await signUp(email, password, { username })
      }
    } catch (err) {
      console.error('认证失败:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            HerHzzz
          </CardTitle>
          <CardDescription>
            {isLogin ? '登录您的账户' : '创建新账户'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSupabaseConfigured && <DemoModeNotice />}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  required={!isLogin}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading || !isSupabaseConfigured}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {!isSupabaseConfigured ? '需要配置Supabase' : (isLogin ? '登录' : '注册')}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm"
              disabled={!isSupabaseConfigured}
            >
              {isLogin ? '还没有账户？注册' : '已有账户？登录'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 用户资料组件
function UserProfile() {
  const { user, profile, signOut } = useAuthContext()

  return (
    <div className="p-4 border-b bg-white/50 backdrop-blur-sm">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
            {profile?.username?.[0] || user?.email?.[0] || 'U'}
          </div>
          <div>
            <p className="font-medium">{profile?.username || '用户'}</p>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={signOut}>
          退出登录
        </Button>
      </div>
    </div>
  )
}

// 认证包装器主组件
export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext()

  // 如果Supabase未配置，直接显示应用内容（演示模式）
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="p-4 border-b bg-white/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <DemoModeNotice />
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                演
              </div>
              <div>
                <p className="font-medium">演示模式</p>
                <p className="text-sm text-gray-600">体验HerHzzz的基本功能</p>
              </div>
            </div>
          </div>
        </div>
        <main className="max-w-4xl mx-auto p-4">
          {children}
        </main>
      </div>
    )
  }

  if (loading) {
    return null
  }
  if (!user) {
    return <LoginForm />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <UserProfile />
      <main className="max-w-4xl mx-auto p-4">
        {children}
      </main>
    </div>
  )
} 