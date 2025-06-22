import React, { useEffect, useState } from 'react'
import { useAuth } from './hooks/useAuth'
// 临时使用调试版本的认证表单
import { AuthFormDebug } from './components/AuthFormDebug'
// 导入完整的主应用组件
import MainApp from './components/MainApp'
import ConsistentBackground from './components/ConsistentBackground'
import './App.css'

function App() {
  // 使用我们的认证Hook
  const { user, isAuthenticated, isLoading, signOut } = useAuth()

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <ConsistentBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-white">加载中...</p>
          </div>
        </div>
      </ConsistentBackground>
    )
  }

  return (
    <ConsistentBackground>
      {/* 如果用户未登录，显示登录表单 */}
      {!isAuthenticated && (
        <div className="py-8">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h1 className="text-3xl font-bold text-white mb-4">
              欢迎使用 HERHZZZ
            </h1>
            <p className="text-gray-200 mb-8">
              女性专属的睡眠白噪音伴侣 - 请登录或注册以继续
            </p>
            {/* 使用增强的调试版本 */}
            <AuthFormDebug />
          </div>
        </div>
      )}

      {/* 如果用户已登录，显示 HERHZZZ 完整应用 */}
      {isAuthenticated && user && (
        <MainApp />
      )}
    </ConsistentBackground>
  )
}

export default App
