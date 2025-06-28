import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
// 使用普通版本的认证表单
import { AuthForm } from './components/AuthForm'
// 导入滚动式应用组件
import ScrollableApp from './components/ScrollableApp'
import SubscriptionPage from './components/SubscriptionPage'
import TestAudioCard from './components/test-component'
import ConsistentBackground from './components/ConsistentBackground'
import CheckoutPage from './pages/CheckoutPage'
import PaymentResultPage from './components/PaymentResultPage'
import './App.css'

function App() {
  // 使用我们的认证Hook
  const { user, isAuthenticated, isLoading } = useAuth()

  // 完全移除加载状态 - 直接显示背景，无任何加载提示
  if (isLoading) {
    return (
      <ConsistentBackground>
        <div></div>
      </ConsistentBackground>
    )
  }

  return (
    <Router>
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

        {/* 如果用户已登录，显示路由系统 */}
        {isAuthenticated && user && (
          <Routes>
            {/* 主页路由 */}
            <Route path="/" element={<ScrollableApp />} />
            
            {/* 订阅页面路由 */}
            <Route path="/subscription" element={<SubscriptionPage />} />
            
            {/* 测试页面路由 */}
            <Route path="/test" element={<TestAudioCard />} />
            
            {/* 默认重定向到主页 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </ConsistentBackground>
    </Router>
  )
}

export default App
