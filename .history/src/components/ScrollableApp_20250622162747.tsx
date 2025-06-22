import React from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import Introduction from './Introduction'
import CycleInfo from './CycleInfo'
import PersonalCycle from './PersonalCycle'
import PixelTrail from './PixelTrail'

// 滚动式 HERHZZZ 应用组件
const ScrollableApp: React.FC = () => {
  const { signOut, user } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  // 平滑滚动到指定部分
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  // PersonalCycle的重置功能
  const handleReset = () => {
    scrollToSection('personal-cycle')
  }

  return (
    <div className="min-h-screen">
      {/* 固定顶部导航 */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/20 border-b border-white/10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* 左侧：应用标题和快速导航 */}
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-bold text-white tracking-wider">
                HERHZZZ
              </h1>
              <div className="hidden md:flex space-x-4">
                <button
                  onClick={() => scrollToSection('introduction')}
                  className="px-3 py-1 rounded-md text-sm transition-colors text-white/70 hover:text-white hover:bg-white/10"
                >
                  月下序言
                </button>
                <button
                  onClick={() => scrollToSection('cycle-info')}
                  className="px-3 py-1 rounded-md text-sm transition-colors text-white/70 hover:text-white hover:bg-white/10"
                >
                  生理月律
                </button>
                <button
                  onClick={() => scrollToSection('personal-cycle')}
                  className="px-3 py-1 rounded-md text-sm transition-colors text-white/70 hover:text-white hover:bg-white/10"
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

      {/* 移动端底部快速导航 */}
      <div className="fixed bottom-4 right-4 z-50 md:hidden">
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => scrollToSection('introduction')}
            className="w-12 h-12 rounded-full backdrop-blur-md bg-white/20 border border-white/30 flex items-center justify-center text-white text-xl hover:bg-white/30 transition-all"
          >
            🌙
          </button>
          <button
            onClick={() => scrollToSection('cycle-info')}
            className="w-12 h-12 rounded-full backdrop-blur-md bg-white/20 border border-white/30 flex items-center justify-center text-white text-xl hover:bg-white/30 transition-all"
          >
            📚
          </button>
          <button
            onClick={() => scrollToSection('personal-cycle')}
            className="w-12 h-12 rounded-full backdrop-blur-md bg-white/20 border border-white/30 flex items-center justify-center text-white text-xl hover:bg-white/30 transition-all"
          >
            💫
          </button>
        </div>
      </div>

      {/* 主要内容区域 - 垂直滚动布局 */}
      <main className="pt-16">
        
        {/* 第一部分：Introduction */}
        <section id="introduction" className="min-h-screen">
          <Introduction />
        </section>

        {/* 第二部分：CycleInfo */}
        <section id="cycle-info" className="py-6">
          <CycleInfo />
        </section>

        {/* 第三部分：PersonalCycle */}
        <section id="personal-cycle" className="py-6 pb-16">
          <PersonalCycle onReset={handleReset} />
        </section>

      </main>
    </div>
  )
}

export default ScrollableApp 