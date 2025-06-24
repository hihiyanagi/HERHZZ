import React, { useEffect, useState } from 'react'
import { useAuth } from './hooks/useAuth'
// 使用普通版本的认证表单
import { AuthForm } from './components/AuthForm'
// 导入滚动式应用组件
import ScrollableApp from './components/ScrollableApp'
import ConsistentBackground from './components/ConsistentBackground'
import './App.css'

function App() {
  // 使用我们的认证Hook
  const { user, isAuthenticated, isLoading } = useAuth()

  // 完全移除加载状态 - 直接显示背景，无任何加载提示
  if (isLoading) {
    return <ConsistentBackground />
  }

  return (
    <ConsistentBackground>
      {/* 如果用户未登录，显示登录表单 */}
      {!isAuthenticated && (
        <div className="py-8">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h1 className="text-4xl md:text-6xl font-fancy moon-glow tracking-wider animate-title mb-4">
              HERHZZZ
            </h1>
            <p className="text-gray-200 mb-8">
              专为女性周期设计的睡眠白噪音平台，登录或注册开始旅程。
            </p>
            {/* 使用普通版本的认证表单 */}
            <AuthForm />
          </div>
        </div>
      )}

      {/* 如果用户已登录，显示 HERHZZZ 滚动式应用 */}
      {isAuthenticated && user && (
        <ScrollableApp />
      )}
    </ConsistentBackground>
  )
}

export default App
