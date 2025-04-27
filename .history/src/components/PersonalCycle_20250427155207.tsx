import React, { useState } from "react";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import AudioPlayer from "./AudioPlayer";
import ArtisticBackground from "./ArtisticBackground";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface PersonalCycleProps {
  onReset: () => void;
}

type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";

interface PhaseGuideText {
  phase: CyclePhase;
  sounds: string[];
  guideText: string[];
}

const phaseGuides: Record<CyclePhase, PhaseGuideText> = {
  menstrual: {
    phase: "menstrual",
    sounds: ["🎵 月之低雨", "🎵 摇篮潮汐", "🎵 银河风琴"],
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
    sounds: ["🎵 月光泡浴", "🎵 银光森林", "🎵 粉樱温泉"],
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
    sounds: ["🎵 茸茸月声", "🎵 雪地猫步", "🎵 秋岛之夜"],
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
    sounds: ["🎵 月云软语", "🎵 苔藓蒸汽", "🎵 夜空寺庙"],
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
const determineCyclePhase = (cycleStartDate: Date, currentDate: Date): CyclePhase => {
  const daysDiff = Math.floor((currentDate.getTime() - cycleStartDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Average 28-day cycle: Menstrual (1-5), Follicular (6-11), Ovulation (12-16), Luteal (17-28)
  if (daysDiff < 5) return "menstrual";
  if (daysDiff < 11) return "follicular";
  if (daysDiff < 16) return "ovulation";
  return "luteal";
};

const PersonalCycle = ({ onReset }: PersonalCycleProps) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<CyclePhase | null>(null);
  
  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
  };
  
  const handleSubmit = () => {
    if (date) {
      const phase = determineCyclePhase(date, new Date());
      setCurrentPhase(phase);
      setHasSubmitted(true);
    }
  };

  return (
    <ArtisticBackground>
      <div className="p-6">
        <div className={`relative z-10 ${!hasSubmitted ? 'pt-8' : ''}`}>
          {!hasSubmitted ? (
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8 animate-float">
                输入你的周期
              </h2>
              
              <div className="backdrop-blur-sm bg-white/5 rounded-lg p-6 mb-6 animate-fade-in">
                <p className="text-white mb-6">
                  请选择你当前或最近一次月经的开始日期，我们将为你推荐适合的白噪音。
                </p>
                
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
                  disabled={!date}
                >
                  确认
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
                  <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-6 animate-title">
                    {currentPhase === "menstrual" && "月经期"}
                    {currentPhase === "follicular" && "卵泡期"}
                    {currentPhase === "ovulation" && "排卵期"}
                    {currentPhase === "luteal" && "黄体期"}
                  </h2>
                  
                  <div className="backdrop-blur-md bg-white/5 rounded-lg p-6 mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <h3 className="text-xl font-semibold text-white mb-4">推荐白噪音</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {phaseGuides[currentPhase].sounds.map((sound, index) => (
                        <AudioPlayer key={index} title={sound} audioSrc="#" />
                      ))}
                    </div>
                    
                    <h3 className="text-xl font-semibold text-white mb-4">导入语</h3>
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
    </ArtisticBackground>
  );
};

export default PersonalCycle;
