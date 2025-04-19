
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import AudioPlayer from "./AudioPlayer";

interface CycleInfoProps {
  onContinue: () => void;
}

// Placeholder for actual audio files
const AUDIO_FILES = {
  menstrual: [
    { title: "🎵 月之低雨", src: "#" },
    { title: "🎵 摇篮潮汐", src: "#" },
    { title: "🎵 银河风琴", src: "#" },
  ],
  follicular: [
    { title: "🎵 月光泡浴", src: "#" },
    { title: "🎵 银光森林", src: "#" },
    { title: "🎵 粉樱温泉", src: "#" },
  ],
  ovulation: [
    { title: "🎵 茸茸月声", src: "#" },
    { title: "🎵 雪地猫步", src: "#" },
    { title: "🎵 秋岛之夜", src: "#" },
  ],
  luteal: [
    { title: "🎵 月云软语", src: "#" },
    { title: "🎵 苔藓蒸汽", src: "#" },
    { title: "🎵 夜空寺庙", src: "#" },
  ],
};

const CycleInfo = ({ onContinue }: CycleInfoProps) => {
  const [activeTab, setActiveTab] = useState("menstrual");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-night-light to-moon-soft">
      <h2 className="text-2xl md:text-3xl font-bold text-night-dark text-center mb-8">
        基于你的周期，个性化声音
      </h2>

      <Tabs defaultValue="menstrual" value={activeTab} onValueChange={handleTabChange} className="max-w-3xl mx-auto">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger 
            value="menstrual" 
            className={cn(
              "data-[state=active]:bg-moon-DEFAULT data-[state=active]:text-white",
              "focus:ring-moon-DEFAULT"
            )}
          >
            月经期
          </TabsTrigger>
          <TabsTrigger 
            value="follicular" 
            className={cn(
              "data-[state=active]:bg-moon-DEFAULT data-[state=active]:text-white",
              "focus:ring-moon-DEFAULT"
            )}
          >
            卵泡期
          </TabsTrigger>
          <TabsTrigger 
            value="ovulation" 
            className={cn(
              "data-[state=active]:bg-moon-DEFAULT data-[state=active]:text-white",
              "focus:ring-moon-DEFAULT"
            )}
          >
            排卵期
          </TabsTrigger>
          <TabsTrigger 
            value="luteal" 
            className={cn(
              "data-[state=active]:bg-moon-DEFAULT data-[state=active]:text-white",
              "focus:ring-moon-DEFAULT"
            )}
          >
            黄体期
          </TabsTrigger>
        </TabsList>

        <TabsContent value="menstrual" className="animate-fade-in">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 mb-6 shadow-sm">
            <h3 className="text-xl font-semibold text-moon-dark mb-4">身体变化</h3>
            <p className="text-night-dark mb-4">
              雌激素、孕激素低，容易疲劳，情绪波动，痛经导致睡眠浅或中断。
            </p>
            <h3 className="text-xl font-semibold text-moon-dark mb-4">声音疗愈</h3>
            <p className="text-night-dark mb-4">
              需要被包裹，身体拥抱感
            </p>
            <p className="text-night-dark italic">
              40–60Hz，如"音频版热水袋"，低频声音有助于放松交感神经，营造"子宫感"或"胎内感"——让身体信任被包裹。
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {AUDIO_FILES.menstrual.map((audio, index) => (
              <AudioPlayer key={index} title={audio.title} audioSrc={audio.src} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="follicular" className="animate-fade-in">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 mb-6 shadow-sm">
            <h3 className="text-xl font-semibold text-moon-dark mb-4">身体变化</h3>
            <p className="text-night-dark mb-4">
              雌激素逐步上升，精力回暖，睡眠质量改善，更容易入睡与深睡。
            </p>
            <h3 className="text-xl font-semibold text-moon-dark mb-4">声音疗愈</h3>
            <p className="text-night-dark mb-4">
              清醒、向外探索、能量慢慢上升
            </p>
            <p className="text-night-dark italic">
              100–200Hz，与你上升的能量匹配，有助于平衡大脑活动，开启清醒而平和的休息通道。
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {AUDIO_FILES.follicular.map((audio, index) => (
              <AudioPlayer key={index} title={audio.title} audioSrc={audio.src} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ovulation" className="animate-fade-in">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 mb-6 shadow-sm">
            <h3 className="text-xl font-semibold text-moon-dark mb-4">身体变化</h3>
            <p className="text-night-dark mb-4">
              雌激素顶峰，体温略升，感官敏锐，容易夜间醒来或睡前情绪起伏。
            </p>
            <h3 className="text-xl font-semibold text-moon-dark mb-4">声音疗愈</h3>
            <p className="text-night-dark mb-4">
              感性、能量高峰、易感与脆弱并存
            </p>
            <p className="text-night-dark italic">
              528Hz 被称为"爱之频率"，共振心绪，调节情绪波动，让脆弱的夜晚变得柔软、充满安全感。
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {AUDIO_FILES.ovulation.map((audio, index) => (
              <AudioPlayer key={index} title={audio.title} audioSrc={audio.src} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="luteal" className="animate-fade-in">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 mb-6 shadow-sm">
            <h3 className="text-xl font-semibold text-moon-dark mb-4">身体变化</h3>
            <p className="text-night-dark mb-4">
              孕激素升高，容易嗜睡，但焦虑、烦躁感加剧，也可能出现"假性失眠"。
            </p>
            <h3 className="text-xl font-semibold text-moon-dark mb-4">声音疗愈</h3>
            <p className="text-night-dark mb-4">
              开始收缩、情绪起伏大、易疲惫
            </p>
            <p className="text-night-dark italic">
              60–80Hz 低频铺底，辅以 theta 波（4–8Hz）脑波引导，稳定情绪起伏，沉入梦境。
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {AUDIO_FILES.luteal.map((audio, index) => (
              <AudioPlayer key={index} title={audio.title} audioSrc={audio.src} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center mt-4">
        <button 
          onClick={onContinue}
          className="px-8 py-3 bg-moon-DEFAULT hover:bg-moon-dark text-white rounded-full font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
        >
          输入我的周期
        </button>
      </div>
    </div>
  );
};

export default CycleInfo;
