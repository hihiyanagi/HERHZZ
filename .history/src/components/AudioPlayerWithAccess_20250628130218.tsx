import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Clock, 
  Lock, 
  Crown,
  Sparkles 
} from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { 
  getUserAudioAccess, 
  checkAudioAccess,
  checkUserMembershipValid
} from '@/lib/subscription'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'

interface AudioItem {
  audio_name: string
  audio_title: string
  cycle_phase: string
  access_level: 'free' | 'paid'
  can_access: boolean
}

interface AudioPlayerWithAccessProps {
  currentCyclePhase?: string
}

export default function AudioPlayerWithAccess({ currentCyclePhase }: AudioPlayerWithAccessProps) {
  const { user } = useAuth()
  const audioRef = useRef<HTMLAudioElement>(null)
  
  const [audioList, setAudioList] = useState<AudioItem[]>([])
  const [selectedAudio, setSelectedAudio] = useState<AudioItem | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isVipUser, setIsVipUser] = useState(false)

  // 加载音频列表和用户权限
  useEffect(() => {
    loadAudioData()
  }, [user])

  // 音频时间更新
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    
    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', () => setIsPlaying(false))

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', () => setIsPlaying(false))
    }
  }, [selectedAudio])

  const loadAudioData = async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      
      // 获取用户VIP状态
      const vipStatus = await checkUserMembershipValid()
      setIsVipUser(vipStatus)
      
      // 🎯 临时模拟数据 - 确保有受限音频显示锁图标
      const mockAudioData = [
        // 免费音频 (每个周期一个)
        {
          audio_name: 'yaolan_chaoxi.mp3',
          audio_title: '摇篮潮汐',
          cycle_phase: 'menstrual',
          access_level: 'free' as const,
          can_access: true
        },
        {
          audio_name: 'yueguang_paoyu.mp3',
          audio_title: '月光泡浴',
          cycle_phase: 'follicular',
          access_level: 'free' as const,
          can_access: true
        },
        {
          audio_name: 'rongrong_yuesheng.mp3',
          audio_title: '融融月升',
          cycle_phase: 'ovulation',
          access_level: 'free' as const,
          can_access: true
        },
        {
          audio_name: 'yekong_simiao.mp3',
          audio_title: '夜空寺庙',
          cycle_phase: 'luteal',
          access_level: 'free' as const,
          can_access: true
        },
        // 付费音频 (VIP用户可访问，非VIP显示锁图标)
        {
          audio_name: 'yinhe_fengqin.mp3',
          audio_title: '银河风琴',
          cycle_phase: 'menstrual',
          access_level: 'paid' as const,
          can_access: vipStatus
        },
        {
          audio_name: 'xuedi_maobu.mp3',
          audio_title: '雪地毛布',
          cycle_phase: 'menstrual',
          access_level: 'paid' as const,
          can_access: vipStatus
        },
        {
          audio_name: 'taixian_zhengqi.mp3',
          audio_title: '太仙正气',
          cycle_phase: 'follicular',
          access_level: 'paid' as const,
          can_access: vipStatus
        },
        {
          audio_name: 'xingji_shuilong.mp3',
          audio_title: '星际水龙',
          cycle_phase: 'follicular',
          access_level: 'paid' as const,
          can_access: vipStatus
        },
        {
          audio_name: 'fenying_wenquan.mp3',
          audio_title: '分影温泉',
          cycle_phase: 'ovulation',
          access_level: 'paid' as const,
          can_access: vipStatus
        },
        {
          audio_name: 'yinguang_senlin.mp3',
          audio_title: '银光森林',
          cycle_phase: 'ovulation',
          access_level: 'paid' as const,
          can_access: vipStatus
        },
        {
          audio_name: 'qiudao_zhiye.mp3',
          audio_title: '秋道之夜',
          cycle_phase: 'luteal',
          access_level: 'paid' as const,
          can_access: vipStatus
        },
        {
          audio_name: 'yueyun_ruanyu.mp3',
          audio_title: '月韵软语',
          cycle_phase: 'luteal',
          access_level: 'paid' as const,
          can_access: vipStatus
        }
      ]
      
      // 使用模拟数据而不是从数据库获取
      setAudioList(mockAudioData)
      
      // 如果有当前周期阶段，优先选择对应的免费音频
      if (currentCyclePhase) {
        const phaseAudio = mockAudioData.find(
          audio => audio.cycle_phase === currentCyclePhase && audio.can_access
        )
        if (phaseAudio) {
          setSelectedAudio(phaseAudio)
        }
      }
      
    } catch (error) {
      console.error('加载音频数据失败:', error)
      toast({
        title: "加载失败",
        description: "无法加载音频列表，请稍后重试",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 播放/暂停
  const togglePlay = async () => {
    if (!selectedAudio || !audioRef.current) return

    // 检查访问权限
    const hasAccess = await checkAudioAccess(selectedAudio.audio_name)
    if (!hasAccess) {
      toast({
        title: "需要会员权限",
        description: "此音频需要会员权限才能播放",
        variant: "destructive"
      })
      return
    }

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      try {
        await audioRef.current.play()
        setIsPlaying(true)
      } catch (error) {
        console.error('播放失败:', error)
        toast({
          title: "播放失败",
          description: "音频播放失败，请检查网络连接",
          variant: "destructive"
        })
      }
    }
  }

  // 选择音频
  const selectAudio = (audio: AudioItem) => {
    if (isPlaying) {
      audioRef.current?.pause()
      setIsPlaying(false)
    }
    setSelectedAudio(audio)
    setCurrentTime(0)
  }

  // 跳转到指定时间
  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  // 音量控制
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
    setIsMuted(newVolume === 0)
  }

  // 静音切换
  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume
        setIsMuted(false)
      } else {
        audioRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  // 格式化时间
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // 周期阶段中文映射
  const phaseNames = {
    'menstrual': '月经期',
    'follicular': '卵泡期', 
    'ovulation': '排卵期',
    'luteal': '黄体期'
  }

  // 按周期阶段分组音频
  const audiosByPhase = audioList.reduce((acc, audio) => {
    if (!acc[audio.cycle_phase]) {
      acc[audio.cycle_phase] = []
    }
    acc[audio.cycle_phase].push(audio)
    return acc
  }, {} as Record<string, AudioItem[]>)

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p>加载音频列表...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 用户状态提示 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">助眠音频</h2>
        <div className="flex items-center gap-2">
          {isVipUser ? (
            <Badge className="bg-yellow-500 text-white">
              <Crown className="w-3 h-3 mr-1" />
              VIP会员
            </Badge>
          ) : (
            <Badge variant="outline">
              免费用户
            </Badge>
          )}
        </div>
      </div>

      {/* 非VIP用户提示 */}
      {!isVipUser && (
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            您当前是免费用户，每个周期阶段可以免费听1首音频。
            <Button 
              variant="link" 
              className="p-0 h-auto font-medium text-blue-600"
              onClick={() => window.location.href = '/subscription'}
            >
              升级会员
            </Button>
            解锁全部12首音频。
          </AlertDescription>
        </Alert>
      )}

      {/* 播放器控制面板 */}
      {selectedAudio && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {selectedAudio.audio_title}
                  {selectedAudio.access_level === 'paid' && (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                </CardTitle>
                <CardDescription>
                  {phaseNames[selectedAudio.cycle_phase as keyof typeof phaseNames] || selectedAudio.cycle_phase} • {selectedAudio.access_level === 'free' ? '免费' : 'VIP专享'}
                </CardDescription>
              </div>
              {!selectedAudio.can_access && (
                <Lock className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* 播放控制 */}
            <div className="flex items-center gap-4">
              <Button
                onClick={togglePlay}
                disabled={!selectedAudio.can_access}
                size="lg"
                className="rounded-full"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              
              <div className="flex-1">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={1}
                  onValueChange={(value) => seekTo(value[0])}
                  disabled={!selectedAudio.can_access}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  disabled={!selectedAudio.can_access}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  disabled={!selectedAudio.can_access}
                  className="w-20"
                />
              </div>
            </div>

            {/* 访问控制提示 */}
            {!selectedAudio.can_access && (
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  此音频需要VIP会员权限。
                  <Button 
                    variant="link" 
                    className="p-0 h-auto font-medium"
                    onClick={() => window.location.href = '/subscription'}
                  >
                    立即升级
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* 音频列表 */}
      <div className="space-y-6">
        {Object.entries(audiosByPhase).map(([phase, audios]) => (
          <div key={phase}>
            <h3 className="text-lg font-semibold mb-3">{phaseNames[phase as keyof typeof phaseNames] || phase}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {audios.map((audio) => (
                <Card
                  key={audio.audio_name}
                  className={`cursor-pointer transition-all duration-200 relative ${
                    selectedAudio?.audio_name === audio.audio_name
                      ? 'ring-2 ring-blue-500 bg-blue-50'
                      : 'hover:shadow-md'
                  } ${
                    !audio.can_access ? 'opacity-60' : ''
                  }`}
                  onClick={() => selectAudio(audio)}
                >
                  {/* 锁图标 - 仅在无法访问时显示 */}
                  {!audio.can_access && (
                    <div 
                      className="absolute top-2 right-2 z-10 w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center cursor-pointer hover:from-gray-700 hover:to-gray-900 transition-all duration-200 shadow-lg group"
                      onClick={(e) => {
                        e.stopPropagation() // 阻止卡片点击事件
                        window.location.href = '/subscription'
                      }}
                      title="需要VIP会员，点击升级"
                    >
                      <Lock className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-200" />
                    </div>
                  )}
                  
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm pr-2">{audio.audio_title}</h4>
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
                        <span className="text-xs text-gray-500">需要会员</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 隐藏的音频元素 */}
      {selectedAudio && (
        <audio
          ref={audioRef}
          src={`/audio/${selectedAudio.audio_name}`}
          preload="metadata"
        />
      )}
    </div>
  )
} 