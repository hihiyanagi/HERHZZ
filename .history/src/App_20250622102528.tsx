import React, { useEffect, useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { AuthForm } from './components/AuthForm'
import './App.css'

function App() {
  // 使用我们的认证Hook
  const { user, isAuthenticated, isLoading } = useAuth()

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* 如果用户未登录，显示登录表单 */}
        {!isAuthenticated && (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              欢迎使用 Supabase 认证
            </h1>
            <p className="text-gray-600 mb-8">
              请登录或注册以继续
            </p>
            <AuthForm />
          </div>
        )}

        {/* 如果用户已登录，显示欢迎信息 */}
        {isAuthenticated && user && (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              欢迎回来！
            </h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600 mb-2">您已成功登录</p>
              <p className="font-medium">邮箱: {user.email}</p>
              <p className="text-sm text-gray-500">用户ID: {user.id}</p>
            </div>
          </div>
        )}
        
      </div>
    </div>
  )
}

export default App
