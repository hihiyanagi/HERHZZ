import React, { useState } from "react";
import { Calendar } from "lucide-react";
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

interface PersonalCycleProps {
  onReset: () => void;
}

type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";

interface PhaseGuideText {
  phase: CyclePhase;
  sounds: { name: string; audioSrc: string }[];
  guideText: string[];
}

const phaseGuides: Record<CyclePhase, PhaseGuideText> = {
  menstrual: {
    phase: "menstrual",
    sounds: [
      { name: "🎵 摇篮潮汐", audioSrc: "/audio/yaolan_chaoxi.mp3" },
      { name: "🎵 星际睡龙", audioSrc: "/audio/xingji_shuilong.mp3" },
      { name: "🎵 银河风琴", audioSrc: "/audio/yinhe_fengqin.mp3" }
    ],
    guideText: [
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
    guideText: [
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
    guideText: [
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
    guideText: [
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
  
  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setError(null);
  };
  
  const handleSubmit = async () => {
    if (date) {
      try {
        setSubmitting(true);
        setError(null);
        
        console.log('🔄 开始保存月经周期数据...');
        console.log('📅 选择的日期:', date);
        console.log('👤 当前用户:', user);
        
        if (!user) {
          throw new Error('用户未登录，请先登录');
        }
        
        const phase = determineCyclePhase(date, new Date());
        console.log('🔄 计算的周期阶段:', phase);
        setCurrentPhase(phase);
        
        const formattedDate = date.toISOString().split('T')[0];
        console.log('📝 格式化的日期:', formattedDate);
        
        const cycleData = {
          user_id: user.id,
          start_date: formattedDate,
          symptoms: [],
          notes: `周期开始于 ${format(date, "yyyy年MM月dd日")}`
        };
        console.log('💾 准备保存的数据:', cycleData);
        
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
            errorMessage = '数据库权限错误，请联系管理员';
          } else if (error.message.includes('validation') || error.message.includes('constraint')) {
            errorMessage = '数据格式错误，请检查输入的日期';
          } else {
            errorMessage = `保存失败: ${error.message}`;
          }
        } else {
          console.error('未知错误类型:', error);
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
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8 animate-float tracking-wide">
              输入你的周期
            </h2>
            
            <div className="backdrop-blur-sm bg-white/5 rounded-lg p-6 mb-6 animate-fade-in">
              <p className="text-white mb-6">
                请选择你当前或最近一次月经的开始日期，我们将为你推荐适合的白噪音。
              </p>
              
              {/* 错误信息显示 */}
              {error && (
                <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-200 text-sm font-medium">⚠️ {error}</p>
                  <p className="text-red-100/80 text-xs mt-2">
                    如果问题持续，请：
                    <br />• 检查网络连接
                    <br />• 确保已登录
                    <br />• 尝试刷新页面
                    <br />• 使用调试工具检查详细信息
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
                      onClick={() => {
                        const debugSection = document.getElementById('debug')
                        if (debugSection) {
                          debugSection.scrollIntoView({ behavior: 'smooth' })
                          // 自动切换到高级诊断
                          const advancedBtn = debugSection.querySelector('button:contains("🚀 高级诊断")') as HTMLButtonElement
                          if (advancedBtn) {
                            setTimeout(() => advancedBtn.click(), 500)
                          }
                        }
                      }}
                      className="px-3 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 text-xs rounded border border-blue-500/30 transition-colors"
                    >
                      🔧 打开诊断工具
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
              
              {/* 添加调试提示 */}
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-200 text-xs">
                  💡 遇到问题？点击页面顶部的"🔧 调试"按钮查看详细信息
                </p>
              </div>
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
                <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-6 animate-float tracking-wide">
                  {currentPhase === "menstrual" && "月经期"}
                  {currentPhase === "follicular" && "卵泡期"}
                  {currentPhase === "ovulation" && "排卵期"}
                  {currentPhase === "luteal" && "黄体期"}
                </h2>
                
                <div className="backdrop-blur-md bg-white/5 rounded-lg p-6 mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  <h3 className="text-xl font-semibold text-white mb-4 text-left">推荐白噪音</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {phaseGuides[currentPhase].sounds.map((sound, index) => (
                      <AudioPlayer 
                        key={index} 
                        title={sound.name} 
                        audioSrc={sound.audioSrc}
                        sleepDuration={sleepDuration}
                      />
                    ))}
                  </div>
                  
                  <div className="my-8 border-t border-white/10 pt-8">
                    <SleepTimer onDurationChange={handleDurationChange} />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-4 text-left">梦境引导语</h3>
                  <div className="rounded-lg p-4 bg-white/5">
                    {phaseGuides[currentPhase].guideText.map((line, index) => (
                      <p key={index} className="text-white mb-2" style={{ animationDelay: `${0.5 + index * 0.1}s` }}>{line}</p>
                    ))}
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
