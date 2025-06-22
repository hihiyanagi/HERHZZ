import React, { useEffect, useState } from 'react'
import { useAuth } from './hooks/useAuth'
// 临时使用调试版本的认证表单
import { AuthFormDebug } from './components/AuthFormDebug'
// 导入新的仪表板组件
import { Dashboard } from './components/Dashboard'
import './App.css'

function App() {
  // 使用我们的认证Hook
  const { user, isAuthenticated, isLoading, signOut } = useAuth()

  // 如果正在加载，显示加载状态
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
    <div className="min-h-screen bg-gray-50">
      {/* 如果用户未登录，显示登录表单 */}
      {!isAuthenticated && (
        <div className="py-8">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              欢迎使用 Supabase 认证
            </h1>
            <p className="text-gray-600 mb-8">
              请登录或注册以继续
            </p>
            {/* 使用增强的调试版本 */}
            <AuthFormDebug />
          </div>
        </div>
      )}

      {/* 如果用户已登录，显示仪表板 */}
      {isAuthenticated && user && (
        <Dashboard />
      )}
    </div>
  )
}

export default App
