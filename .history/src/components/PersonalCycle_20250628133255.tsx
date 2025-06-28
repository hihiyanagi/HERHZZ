import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Calendar, Lock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import AudioPlayer from "./AudioPlayer";
import SleepTimer from "./SleepTimer";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useCycle } from "@/hooks/useCycle";
import { useAuth } from "@/hooks/useAuth";
import { checkUserMembershipValid } from '@/lib/subscription';
import { toast } from '@/hooks/use-toast';
import { isSupabaseConfigured } from "@/lib/supabase";

interface PersonalCycleProps {
  onReset: () => void;
}

type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";

interface PhaseGuideText {
  phase: CyclePhase;
  sounds: { name: string; audioSrc: string }[];
  guideText: string[];
  desktopGuideText?: string[]; // 桌面端专用的梦境引导语
}

// 锁定音频组件
interface LockedAudioPlayerProps {
  title: string;
  className?: string;
  onClick: () => void;
}

const LockedAudioPlayer = ({ title, className, onClick }: LockedAudioPlayerProps) => {
  return (
    <div 
      className={cn("flex flex-col items-center p-3 rounded-lg backdrop-blur-sm border border-white/20 cursor-pointer hover:bg-white/5 transition-all", className)}
      onClick={onClick}
    >
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-sm font-medium text-white/70">{title}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full w-10 h-10 bg-transparent border border-white/30 text-white/70 hover:bg-white/10"
        >
          <Lock className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex items-center w-full">
        <div className="w-full text-center">
          <p className="text-white/50 text-xs">🔒 升级会员解锁</p>
        </div>
      </div>
    </div>
  );
};

const phaseGuides: Record<CyclePhase, PhaseGuideText> = {
  menstrual: {
    phase: "menstrual",
    sounds: [
      { name: "🎵 摇篮潮汐", audioSrc: "/audio/yaolan_chaoxi.mp3" },
      { name: "🎵 星际睡龙", audioSrc: "/audio/xingji_shuilong.mp3" },
      { name: "🎵 银河风琴", audioSrc: "/audio/yinhe_fengqin.mp3" }
    ],
    // 移动端版本（当前的断行）
    guideText: [
      "闭上眼睛，让整个人慢下来。",
      "呼吸轻一点，慢一点。",
      "你已经够努力了，",
      "允许自己，松一口气。",
      "想象一个热水袋贴近小腹，",
      "这不是疼痛的夜晚，",
      "这是你为自己守住的一点点安静。",
      "感受这道声音，",
      "它轻轻收缩，又缓缓释放。",
      "就像你在这一夜轻轻地，被抱住。"
    ],
    // 桌面端版本（GitHub最新版本）
    desktopGuideText: [
      "闭上眼睛，让整个人慢下来。",
      "呼吸轻一点，慢一点。",
      "你已经够努力了，允许自己，松一口气。",
      "想象一个热水袋贴近小腹，",
      "这不是疼痛的夜晚，这是你为自己守住的一点点安静。",
      "感受这道声音，它轻轻收缩，又缓缓释放。",
      "就像你在这一夜轻轻地，被抱住。"
    ]
  },
  follicular: {
    phase: "follicular",
    sounds: [
      { name: "🎵 月光泡浴", audioSrc: "/audio/yueguang_paoyu.mp3" },
      { name: "🎵 银光森林", audioSrc: "/audio/yinguang_senlin.mp3" },
      { name: "🎵 粉樱温泉", audioSrc: "/audio/fenying_wenquan.mp3" }
    ],
    // 移动端版本（当前的断行）
    guideText: [
      "听见了吗？",
      "有一点点能量，",
      "在你身体里悄悄冒芽。",
      "不急，它不会催你醒来，",
      "只是轻轻地，把你托起。",
      "想象自己泡在月光温泉中，",
      "身体像一片叶子，慢慢舒展。",
      "睡意像蒸气一样，慢慢升起。",
      "今晚，你不必用力入睡，",
      "睡眠会像森林的雾一样，",
      "自己落下来，",
      "落在你的额头、睫毛，",
      "和你轻柔的心。"
    ],
    // 桌面端版本（GitHub最新版本）
    desktopGuideText: [
      "听见了吗？有一点点能量，在你身体里悄悄冒芽。",
      "不急，它不会催你醒来，只是轻轻地，把你托起。",
      "想象自己泡在月光温泉中，",
      "身体像一片叶子，慢慢舒展。",
      "睡意像蒸气一样，慢慢升起。",
      "今晚，你不必用力入睡，",
      "睡眠会像森林的雾一样，自己落下来，",
      "落在你的额头，睫毛，和你轻柔的心。"
    ]
  },
  ovulation: {
    phase: "ovulation",
    sounds: [
      { name: "🎵 茸茸月声", audioSrc: "/audio/rongrong_yuesheng.mp3" },
      { name: "🎵 软眠猫呼", audioSrc: "/audio/xuedi_maobu.mp3" },
      { name: "🎵 爱之频率", audioSrc: "/audio/qiudao_zhiye.mp3" }
    ],
    // 移动端版本（当前的断行）
    guideText: [
      "有点清醒，也有点敏感。",
      "今天的你，像月夜盛开的花，",
      "脆弱、明亮，又那么美。",
      "让这段声音轻轻地，把你抱起来，",
      "像一只雪地里的猫，",
      "悄悄跳到你胸口，",
      "用鼻尖蹭你一下，再慢慢卷起身体",
      "从尾巴到耳尖，",
      "松一口气，打个小哈欠，",
      "悄无声息地，沉进梦的毛毯里。"
    ],
    // 桌面端版本（GitHub最新版本）
    desktopGuideText: [
      "有点清醒，也有点敏感。",
      "今天的你，像月夜盛开的花，",
      "脆弱、明亮，又那么美。",
      "让这段声音轻轻地，把你抱起来，",
      "像一只雪地里的猫，悄悄跳到你胸口，",
      "用鼻尖蹭你一下，再慢慢卷起身体——",
      "从尾巴到耳尖，松一口气，打个小哈欠，",
      "悄无声息地，沉进梦的毛毯里。"
    ]
  },
  luteal: {
    phase: "luteal",
    sounds: [
      { name: "🎵 梦海深潜", audioSrc: "/audio/yueyun_ruanyu.mp3" },
      { name: "🎵 苔藓蒸汽", audioSrc: "/audio/taixian_zhengqi.mp3" },
      { name: "🎵 夜空寺庙", audioSrc: "/audio/yekong_simiao.mp3" }
    ],
    // 移动端版本（当前的断行）
    guideText: [
      "今天的你，是否感到一点点疲惫，",
      "却又莫名烦躁？",
      "仿佛身心都在等待什么，",
      "却说不出是什么。",
      "没关系。让声音替你熄灯，",
      "替你收拾纷乱的情绪。",
      "想象自己走进一座寺庙，",
      "内心变得禅静。",
      "每一次呼吸，",
      "都是在为你稳住一片内在的湖水。",
      "不用入睡得多快，",
      "只要安住——情绪会自己下沉。",
      "夜色很大，你很小，",
      "沉入夜里成为星星。"
    ],
    // 桌面端版本（GitHub最新版本）
    desktopGuideText: [
      "今天的你，是否感到一点点疲惫，却又莫名烦躁？",
      "仿佛身心都在等待什么，却说不出是什么。",
      "没关系。让声音替你熄灯，替你收拾纷乱的情绪。",
      "想象自己走进一座寺庙，内心变得禅静。",
      "每一次呼吸，都是在为你稳住一片内在的湖水。",
      "不用入睡得多快，只要安住——情绪会自己下沉。",
      "夜色很大，你很小，沉入夜里成为星星。"
    ]
  }
};

// Helper function to determine the cycle phase based on the date
interface CycleSettings {
  cycleLength: number; // 允许用户自定义周期长度
  menstrualDays: number; // 经期天数
}

const determineCyclePhase = (
  cycleStartDate: Date, 
  currentDate: Date, 
  settings: CycleSettings = { cycleLength: 28, menstrualDays: 5 }
): CyclePhase => {
  const daysDiff = Math.floor((currentDate.getTime() - cycleStartDate.getTime()) / (1000 * 60 * 60 * 24));
  const cycleDays = daysDiff % settings.cycleLength;
  
  if (cycleDays < settings.menstrualDays) return "menstrual";
  if (cycleDays < settings.cycleLength * 0.4) return "follicular"; 
  if (cycleDays < settings.cycleLength * 0.6) return "ovulation";
  return "luteal";
};

const PersonalCycle = ({ onReset }: PersonalCycleProps) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<CyclePhase | null>(null);
  const [sleepDuration, setSleepDuration] = useState<number>(0);
  const { addCycle, loading: cycleLoading } = useCycle();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);
  const [isVipUser, setIsVipUser] = useState(false);
  const [membershipLoading, setMembershipLoading] = useState(true);
  const navigate = useNavigate();
  
  // 检查Supabase配置状态
  useEffect(() => {
    setIsSupabaseReady(isSupabaseConfigured());
  }, []);
  
  // 检查用户会员状态
  useEffect(() => {
    const checkMembershipStatus = async () => {
      if (!user) {
        setIsVipUser(false);
        setMembershipLoading(false);
        return;
      }

      try {
        setMembershipLoading(true);
        const isVip = await checkUserMembershipValid();
        setIsVipUser(isVip);
      } catch (error) {
        console.error('检查会员状态失败:', error);
        setIsVipUser(false);
      } finally {
        setMembershipLoading(false);
      }
    };

    checkMembershipStatus();
  }, [user]);

  // 处理上锁音频点击
  const handleLockedAudioClick = () => {
    toast({
      title: "🔒 需要会员权限",
      description: "升级为HERHZZZ会员，解锁全部高品质睡眠音频",
    });
    navigate('/subscription');
  };

  // 判断音频是否可以访问
  const canAccessAudio = (audioIndex: number) => {
    // 第一个音频（索引0）对所有用户免费
    if (audioIndex === 0) return true;
    // 其他音频需要VIP权限
    return isVipUser;
  };
  
  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setError(null);
  };
  
  // 临时本地存储方案
  const saveToLocalStorage = (date: Date, phase: CyclePhase) => {
    const cycleData = {
      startDate: date.toISOString().split('T')[0],
      phase,
      timestamp: new Date().toISOString(),
      notes: `周期开始于 ${format(date, "yyyy年MM月dd日")}`
    };
    
    // 保存到本地存储
    const existingData = JSON.parse(localStorage.getItem('menstrual_cycles') || '[]');
    existingData.unshift(cycleData);
    localStorage.setItem('menstrual_cycles', JSON.stringify(existingData));
    
    console.log('✅ 数据已保存到本地存储:', cycleData);
    return cycleData;
  };
  
  const handleSubmit = async () => {
    if (date) {
      try {
        setSubmitting(true);
        setError(null);
        
        console.log('🔄 开始保存月经周期数据...');
        console.log('📅 选择的日期:', date);
        console.log('🔧 Supabase配置状态:', isSupabaseReady);
        
        const phase = determineCyclePhase(date, new Date());
        console.log('🔄 计算的周期阶段:', phase);
        setCurrentPhase(phase);
        
        // 检查是否配置了Supabase
        if (!isSupabaseReady) {
          console.log('⚠️ Supabase未配置，使用本地存储...');
          
          // 使用本地存储作为临时解决方案
          saveToLocalStorage(date, phase);
          setHasSubmitted(true);
          
          console.log('✅ 数据已保存到本地存储，请配置Supabase以实现真正的数据同步');
          return;
        }
        
        // 检查用户登录状态
        if (!user) {
          throw new Error('用户未登录，请先登录');
        }
        
        const formattedDate = date.toISOString().split('T')[0];
        console.log('📝 格式化的日期:', formattedDate);
        
        const result = await addCycle(formattedDate, [], `周期开始于 ${format(date, "yyyy年MM月dd日")}`);
        console.log('✅ 数据保存成功:', result);
        
        setHasSubmitted(true);
        
        console.log('🎉 月经周期数据已成功保存到数据库');
      } catch (error) {
        console.error('❌ 保存月经周期数据失败:', error);
        
        let errorMessage = '保存失败，请重试';
        
        if (error instanceof Error) {
          console.error('错误详情:', {
            message: error.message,
            name: error.name,
            stack: error.stack
          });
          
          if (error.message.includes('用户未登录')) {
            errorMessage = '请先登录后再输入周期数据';
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage = '网络连接失败，请检查网络后重试';
          } else if (error.message.includes('permission') || error.message.includes('policy')) {
            errorMessage = 'Supabase权限错误，可能需要设置RLS策略';
          } else if (error.message.includes('validation') || error.message.includes('constraint')) {
            errorMessage = '数据格式错误，请检查输入的日期';
          } else {
            errorMessage = `保存失败: ${error.message}`;
          }
        }
        
        setError(errorMessage);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleDurationChange = (duration: number) => {
    setSleepDuration(duration);
    console.log(`Sleep duration set to: ${duration} minutes`);
  };

  return (
    <div className="p-6">
      <div className={`relative z-10 ${!hasSubmitted ? 'pt-8' : ''}`}>
        {!hasSubmitted ? (
          <div className="max-w-md mx-auto">
            <h2 className="text-4xl md:text-6xl font-biaoxiao moon-glow text-center mb-8 animate-float tracking-wide">
              输入你的周期
            </h2>
            
            {/* Supabase配置状态提示 */}
            {!isSupabaseReady && (
              <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-200 text-sm font-medium">⚠️ 数据库未配置</p>
                <p className="text-yellow-100/80 text-xs mt-2">
                  当前使用本地存储，数据仅保存在浏览器中。要实现真正的数据同步，请配置Supabase环境变量。
                </p>
                <details className="mt-2">
                  <summary className="text-yellow-200 text-xs cursor-pointer hover:text-yellow-100">
                    🔧 点击查看配置方法
                  </summary>
                  <div className="mt-2 text-yellow-100/80 text-xs">
                    <p>1. 编辑项目根目录的 <code className="bg-yellow-600/30 px-1 rounded">.env</code> 文件</p>
                    <p>2. 添加你的Supabase项目信息：</p>
                    <pre className="bg-yellow-600/20 p-2 rounded mt-1 text-xs">
VITE_SUPABASE_URL=你的项目URL
VITE_SUPABASE_ANON_KEY=你的匿名密钥
                    </pre>
                    <p>3. 重启开发服务器：<code className="bg-yellow-600/30 px-1 rounded">npm run dev</code></p>
                  </div>
                </details>
              </div>
            )}
            
            <div className="backdrop-blur-sm bg-white/5 rounded-lg p-6 mb-6 animate-fade-in">
              <div className="text-white mb-6">
                <p>请选择你最近一次月经的开始日期，</p>
                <p>将为你推荐与身体同频的白噪音。</p>
              </div>
              
              {/* 错误信息显示 */}
              {error && (
                <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-200 text-sm font-medium">⚠️ {error}</p>
                  <p className="text-red-100/80 text-xs mt-2">
                    如果问题持续，请：
                    <br />• 检查网络连接
                    <br />• 确保已登录
                    <br />• 配置Supabase环境变量
                    <br />• 尝试刷新页面
                  </p>
                  
                  {/* 添加快速解决方案 */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => window.location.reload()}
                      className="px-3 py-1 bg-red-600/30 hover:bg-red-600/50 text-red-200 text-xs rounded border border-red-500/30 transition-colors"
                    >
                      🔄 刷新页面
                    </button>
                    <button
                      onClick={() => setError(null)}
                      className="px-3 py-1 bg-gray-600/30 hover:bg-gray-600/50 text-gray-200 text-xs rounded border border-gray-500/30 transition-colors"
                    >
                      ❌ 关闭
                    </button>
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-transparent border-white text-white",
                        !date && "text-white/70"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>选择日期</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarUI
                      mode="single"
                      selected={date}
                      onSelect={handleDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <Button 
                onClick={handleSubmit}
                className="w-full bg-transparent hover:bg-white/20 border border-white text-white"
                disabled={!date || submitting}
              >
                {submitting ? '保存中...' : '确认'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <button 
              onClick={() => setHasSubmitted(false)}
              className="mb-6 flex items-center text-white hover:text-moon-light transition-colors"
            >
              <span className="mr-1">←</span> 返回修改
            </button>
            
            {currentPhase && (
              <>
                <h2 className="text-4xl md:text-6xl font-biaoxiao moon-glow text-center mb-6 animate-float tracking-wide">
                  {currentPhase === "menstrual" && "月经期"}
                  {currentPhase === "follicular" && "卵泡期"}
                  {currentPhase === "ovulation" && "排卵期"}
                  {currentPhase === "luteal" && "黄体期"}
                </h2>
                
                <div className="backdrop-blur-md bg-white/5 rounded-lg p-6 mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  <h3 className="text-xl font-semibold text-white mb-4 text-left">推荐白噪音</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {phaseGuides[currentPhase].sounds.map((sound, index) => (
                      <LockedAudioPlayer 
                        key={index} 
                        title={sound.name} 
                        onClick={() => {}}
                      />
                    ))}
                  </div>
                  
                  <div className="my-8 border-t border-white/10 pt-8">
                    <SleepTimer onDurationChange={handleDurationChange} />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-4 text-left">梦境引导语</h3>
                  <div className="rounded-lg p-4 bg-white/5">
                    {/* 移动端版本 - 使用断行版本 */}
                    <div className="block md:hidden">
                      {phaseGuides[currentPhase].guideText.map((line, index) => (
                        <p key={index} className="text-sm text-white mb-2" style={{ animationDelay: `${0.5 + index * 0.1}s` }}>{line}</p>
                      ))}
                    </div>
                    
                    {/* 桌面端版本 - 使用GitHub最新版本 */}
                    <div className="hidden md:block">
                      {(phaseGuides[currentPhase].desktopGuideText || phaseGuides[currentPhase].guideText).map((line, index) => (
                        <p key={index} className="text-base text-white mb-2" style={{ animationDelay: `${0.5 + index * 0.1}s` }}>{line}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalCycle;
