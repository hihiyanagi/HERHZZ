import React from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import Introduction from './Introduction'
import CycleInfo from './CycleInfo'
import PersonalCycle from './PersonalCycle'

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

  // 处理Introduction的继续按钮
  const handleContinue = () => {
    scrollToSection('cycle-info')
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
                  介绍
                </button>
                <button
                  onClick={() => scrollToSection('cycle-info')}
                  className="px-3 py-1 rounded-md text-sm transition-colors text-white/70 hover:text-white hover:bg-white/10"
                >
                  周期科普
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
          <Introduction onContinue={handleContinue} />
        </section>

        {/* 第二部分：CycleInfo */}
        <section id="cycle-info" className="min-h-screen py-16">
          <CycleInfo />
          
          {/* 引导到下一部分的按钮 */}
          <div className="text-center mt-12">
            <Button
              onClick={() => scrollToSection('personal-cycle')}
              className="bg-white/20 hover:bg-white/30 border border-white text-white px-8 py-3 rounded-full"
            >
              开始我的周期之旅 →
            </Button>
          </div>
        </section>

        {/* 第三部分：PersonalCycle */}
        <section id="personal-cycle" className="min-h-screen py-16">
          <PersonalCycle onReset={handleReset} />
        </section>

        {/* 底部信息 */}
        <footer className="py-12 text-center">
          <div className="backdrop-blur-sm bg-white/5 rounded-lg p-8 mx-4 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              🌙 感谢使用 HERHZZZ
            </h3>
            <p className="text-white/80 leading-relaxed mb-6">
              愿每一个夜晚，你都能与自己的身体温柔相处。<br/>
              月亮在我们的身体里，我们必定好梦。
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => scrollToSection('introduction')}
                className="px-6 py-2 bg-white/20 hover:bg-white/30 border border-white text-white rounded-full transition-all"
              >
                回到顶部
              </button>
              <button
                onClick={() => scrollToSection('personal-cycle')}
                className="px-6 py-2 bg-white/20 hover:bg-white/30 border border-white text-white rounded-full transition-all"
              >
                重新开始
              </button>
            </div>
          </div>
        </footer>

      </main>
    </div>
  )
}

export default ScrollableApp 