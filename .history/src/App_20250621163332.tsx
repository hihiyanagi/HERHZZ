import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { AuthForm } from '@/components/AuthForm'
import { api } from '@/lib/api'
import './App.css'

function App() {
  // 获取认证状态和功能
  const { user, isAuthenticated, isLoading, signOut } = useAuth()
  
  // 用于存储从后端API获取的数据
  const [apiData, setApiData] = useState<any>(null)
  const [apiLoading, setApiLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  // 测试受保护的API调用
  const testProtectedApi = async () => {
    setApiLoading(true)
    setApiError(null)
    
    try {
      // 调用后端受保护的API
      // 这个请求会自动在请求头中包含JWT Token
      const data = await api.get('/api/protected')
      setApiData(data)
    } catch (error) {
      setApiError(error instanceof Error ? error.message : '请求失败')
    } finally {
      setApiLoading(false)
    }
  }

  // 获取用户个人资料
  const getUserProfile = async () => {
    setApiLoading(true)
    setApiError(null)
    
    try {
      const data = await api.get('/api/user/profile')
      setApiData(data)
    } catch (error) {
      setApiError(error instanceof Error ? error.message : '请求失败')
    } finally {
      setApiLoading(false)
    }
  }

  // 处理登出
  const handleSignOut = async () => {
    try {
      await signOut()
      setApiData(null) // 清除API数据
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  // 如果正在加载认证状态，显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 未登录状态 - 显示登录/注册表单 */}
        {!isAuthenticated && (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Supabase 用户认证演示
            </h1>
            <p className="text-gray-600 mb-8">
              请登录或注册以访问受保护的功能
            </p>
            <AuthForm />
          </div>
        )}

        {/* 已登录状态 - 显示用户信息和功能 */}
        {isAuthenticated && user && (
          <div className="space-y-6">
            {/* 用户信息卡片 */}
            <Card>
              <CardHeader>
                <CardTitle>欢迎回来！</CardTitle>
                <CardDescription>
                  您已成功登录，可以使用所有功能
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>用户ID:</strong> {user.id}</p>
                  <p><strong>邮箱:</strong> {user.email}</p>
                  <p><strong>登录时间:</strong> {new Date(user.last_sign_in_at || '').toLocaleString()}</p>
                </div>
                
                <div className="mt-4 space-x-2">
                  <Button onClick={testProtectedApi} disabled={apiLoading}>
                    {apiLoading ? '请求中...' : '测试受保护API'}
                  </Button>
                  
                  <Button onClick={getUserProfile} disabled={apiLoading} variant="outline">
                    {apiLoading ? '请求中...' : '获取个人资料'}
                  </Button>
                  
                  <Button onClick={handleSignOut} variant="destructive">
                    登出
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* API响应显示 */}
            {apiError && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800">API请求错误</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-red-600">{apiError}</p>
                </CardContent>
              </Card>
            )}

            {apiData && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800">API响应数据</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm text-green-700 bg-white p-4 rounded border overflow-auto">
                    {JSON.stringify(apiData, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* 使用说明 */}
            <Card>
              <CardHeader>
                <CardTitle>功能说明</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>✅ <strong>前端认证:</strong> 使用 Supabase Auth 进行用户注册、登录、登出</p>
                  <p>✅ <strong>JWT Token:</strong> 自动获取并保存用户的 JWT Token</p>
                  <p>✅ <strong>API请求:</strong> 在每次API请求中自动添加 Authorization 头</p>
                  <p>✅ <strong>后端验证:</strong> FastAPI 后端验证 JWT Token 的有效性</p>
                  <p>✅ <strong>用户识别:</strong> 从 Token 中提取用户 ID 和其他信息</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
