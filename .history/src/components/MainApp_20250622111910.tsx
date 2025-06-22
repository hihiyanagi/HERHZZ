import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import Introduction from './Introduction'
import CycleInfo from './CycleInfo'
import PersonalCycle from './PersonalCycle'

// 应用页面类型
type AppPage = 'introduction' | 'cycleInfo' | 'personalCycle'

// HERHZZZ 主应用组件
const MainApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AppPage>('introduction')
  const { signOut, user } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  // 导航到下一页
  const handleContinue = () => {
    if (currentPage === 'introduction') {
      setCurrentPage('cycleInfo')
    } else if (currentPage === 'cycleInfo') {
      setCurrentPage('personalCycle')
    }
  }

  // 重置到个人周期页面（从PersonalCycle组件调用）
  const handleReset = () => {
    setCurrentPage('personalCycle')
  }

  // 导航菜单
  const renderNavigation = () => {
    // 介绍页不显示导航
    if (currentPage === 'introduction') {
      return null
    }

    return (
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/20 border-b border-white/10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* 左侧：应用标题和导航 */}
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-bold text-white tracking-wider">
                HERHZZZ
              </h1>
              <div className="hidden md:flex space-x-4">
                <button
                  onClick={() => setCurrentPage('introduction')}
                  className="px-3 py-1 rounded-md text-sm transition-colors text-white/70 hover:text-white hover:bg-white/10"
                >
                  介绍
                </button>
                <button
                  onClick={() => setCurrentPage('cycleInfo')}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    currentPage === 'cycleInfo' 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  周期科普
                </button>
                <button
                  onClick={() => setCurrentPage('personalCycle')}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    currentPage === 'personalCycle' 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  我的周期
                </button>
              </div>
            </div>

            {/* 右侧：用户信息和登出 */}
            <div className="flex items-center space-x-4">
              <span className="text-white/70 text-sm hidden sm:block">
                {user?.email}
              </span>
              <Button 
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="bg-transparent border-white/30 text-white hover:bg-white/10"
              >
                登出
              </Button>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  // 移动端底部导航
  const renderMobileNavigation = () => {
    // 介绍页不显示导航
    if (currentPage === 'introduction') {
      return null
    }

    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden backdrop-blur-md bg-black/20 border-t border-white/10">
        <div className="flex justify-around py-2">
          <button
            onClick={() => setCurrentPage('introduction')}
            className="flex flex-col items-center py-2 px-4 text-xs text-white/70"
          >
            <span className="mb-1">🌙</span>
            介绍
          </button>
          <button
            onClick={() => setCurrentPage('cycleInfo')}
            className={`flex flex-col items-center py-2 px-4 text-xs ${
              currentPage === 'cycleInfo' ? 'text-white' : 'text-white/70'
            }`}
          >
            <span className="mb-1">📚</span>
            周期科普
          </button>
          <button
            onClick={() => setCurrentPage('personalCycle')}
            className={`flex flex-col items-center py-2 px-4 text-xs ${
              currentPage === 'personalCycle' ? 'text-white' : 'text-white/70'
            }`}
          >
            <span className="mb-1">💫</span>
            我的周期
          </button>
        </div>
      </div>
    )
  }

  // 页面内容渲染
  const renderPageContent = () => {
    const pageStyle = currentPage === 'introduction' ? '' : 'pt-16 pb-20 md:pb-8'
    
    switch (currentPage) {
      case 'introduction':
        return <Introduction onContinue={handleContinue} />
      
      case 'cycleInfo':
        return (
          <div className={pageStyle}>
            <CycleInfo />
            <div className="text-center mt-12">
              <Button
                onClick={() => setCurrentPage('personalCycle')}
                className="bg-white/20 hover:bg-white/30 border border-white text-white px-8 py-3 rounded-full"
              >
                开始我的周期之旅 →
              </Button>
            </div>
          </div>
        )
      
      case 'personalCycle':
        return (
          <div className={pageStyle}>
            <PersonalCycle onReset={handleReset} />
          </div>
        )
      
      default:
        return <Introduction onContinue={handleContinue} />
    }
  }

  return (
    <div className="min-h-screen">
      {/* 顶部导航 */}
      {renderNavigation()}
      
      {/* 主要内容 */}
      <main>
        {renderPageContent()}
      </main>
      
      {/* 移动端底部导航 */}
      {renderMobileNavigation()}
    </div>
  )
}

export default MainApp 