import React, { createContext, useContext } from 'react'
import { useAuth, AuthState } from '@/hooks/useAuth'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

// 创建认证上下文
const AuthContext = createContext<AuthState & {
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, userData?: any) => Promise<any>
  signOut: () => Promise<void>
  updateProfile: (updates: any) => Promise<any>
} | null>(null)

// 认证提供者组件
export function AuthProvider({ children }: { children: React.ReactNode }) {
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
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? '登录' : '注册'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm"
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
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