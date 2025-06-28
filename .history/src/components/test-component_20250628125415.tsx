import React from 'react'
import { Lock, Crown, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const TestAudioCard = () => {
  // 模拟音频数据
  const mockAudios = [
    {
      audio_name: 'yaolan_chaoxi.mp3',
      audio_title: '摇篮潮汐',
      cycle_phase: 'menstrual',
      access_level: 'free' as const,
      can_access: true
    },
    {
      audio_name: 'yinhe_fengqin.mp3', 
      audio_title: '银河风琴',
      cycle_phase: 'menstrual',
      access_level: 'paid' as const,
      can_access: false
    },
    {
      audio_name: 'xuedi_maobu.mp3',
      audio_title: '雪地毛布', 
      cycle_phase: 'follicular',
      access_level: 'paid' as const,
      can_access: false
    }
  ]

  const handleLockClick = () => {
    alert('🔒 点击锁图标！即将跳转到订阅页面...')
    // 在实际应用中会是: window.location.href = '/subscription'
  }

  const handleCardClick = (audio: typeof mockAudios[0]) => {
    if (audio.can_access) {
      alert(`✅ 选择了音频: ${audio.audio_title}`)
    } else {
      alert(`❌ 需要VIP会员才能播放: ${audio.audio_title}`)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            🎵 音频卡片锁图标测试
          </h1>
          <p className="text-white/80 mb-6">
            点击受限音频右上角的锁图标可跳转到订阅页面
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockAudios.map((audio) => (
            <Card
              key={audio.audio_name}
              className={`cursor-pointer transition-all duration-200 relative bg-white/10 backdrop-blur-md border-white/20 hover:shadow-lg hover:scale-105 ${
                !audio.can_access ? 'opacity-75' : ''
              }`}
              onClick={() => handleCardClick(audio)}
            >
              {/* 🔒 锁图标 - 仅在无法访问时显示 */}
              {!audio.can_access && (
                <div 
                  className="absolute top-2 right-2 z-10 w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center cursor-pointer hover:from-gray-700 hover:to-gray-900 transition-all duration-200 shadow-lg group"
                  onClick={(e) => {
                    e.stopPropagation() // 阻止卡片点击事件
                    handleLockClick()
                  }}
                  title="需要VIP会员，点击升级"
                >
                  <Lock className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-200" />
                </div>
              )}
              
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm pr-2 text-white">{audio.audio_title}</h4>
                  <div className="flex items-center gap-1">
                    {audio.access_level === 'paid' && (
                      <Crown className="w-3 h-3 text-yellow-500" />
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={audio.access_level === 'free' ? 'secondary' : 'default'}
                    className="text-xs"
                  >
                    {audio.access_level === 'free' ? '免费' : 'VIP'}
                  </Badge>
                  {!audio.can_access && (
                    <span className="text-xs text-gray-300">需要会员</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-3">🎯 功能说明</h3>
            <div className="text-left text-white/80 space-y-2">
              <p>• ✅ <strong>免费音频</strong>：可以直接点击播放</p>
              <p>• 🔒 <strong>锁定音频</strong>：右上角有锁图标，点击锁图标跳转订阅页面</p>
              <p>• 👑 <strong>VIP标识</strong>：付费音频会显示皇冠图标</p>
              <p>• 🎨 <strong>悬停效果</strong>：锁图标有缩放动画效果</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestAudioCard 