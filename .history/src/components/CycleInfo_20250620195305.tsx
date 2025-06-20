import React, { useState } from 'react';
import { Moon, Cloud, Music, Waves, Sun, Stars } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface SoundInfo {
  name: string;
  icon: LucideIcon;
  audioSrc: string;
}

interface CyclePhase {
  bodyChanges: string;
  soundHealing: {
    needs: string;
    description: string;
  };
  sounds: SoundInfo[];
}

interface CycleData {
  [key: string]: CyclePhase;
}

const CycleInfo = () => {
  const [activeTab, setActiveTab] = useState<string>('menstrual');

  const cycleData: CycleData = {
    menstrual: {
      bodyChanges: "雌激素、孕激素低，容易疲劳，情绪波动，痛经导致睡眠浅或中断。",
      soundHealing: {
        needs: "需要被包裹，身体拥抱感",
        description: '40-60Hz，如"音频版热水袋"，低频声音有助于放松交感神经，营造"子宫感"或"胎内感"——让身体信任被包裹。'
      },
      sounds: [
        { name: "摇篮潮汐", icon: Waves, audioSrc: "/audio/yaolan_chaoxi.mp3" },
        { name: "星际睡龙", icon: Music, audioSrc: "/audio/xingji_shuilong.mp3" },
        { name: "银河风琴", icon: Moon, audioSrc: "/audio/yinhe_fengqin.mp3" }
      ]
    },
    follicular: {
      bodyChanges: "雌激素逐步上升，精力回暖，睡眠质量改善，更容易入睡与深睡。",
      soundHealing: {
        needs: "清醒、向外探索、能量慢慢上升",
        description: '100-200Hz，与你上升的能量匹配，有助于平衡大脑活动，开启清醒而平和的休息通道。'
      },
      sounds: [
        { name: "月光泡浴", icon: Moon, audioSrc: "" },
        { name: "银光森林", icon: Stars, audioSrc: "" },
        { name: "粉樱温泉", icon: Sun, audioSrc: "" }
      ]
    },
    ovulation: {
      bodyChanges: "雌激素顶峰，体温略升，感官敏锐，容易夜间醒来或睡前情绪起伏。",
      soundHealing: {
        needs: "感性、能量高峰、易感与脆弱并存",
        description: '528Hz 被称为"爱之频率"，共振心绪，调节情绪波动，让脆弱的夜晚变得柔软、充满安全感。'
      },
      sounds: [
        { name: "茸茸月声", icon: Moon, audioSrc: "" },
        { name: "软眠猫呼", icon: Stars, audioSrc: "" },
        { name: "爱之频率", icon: Cloud, audioSrc: "" }
      ]
    },
    luteal: {
      bodyChanges: "孕激素升高，容易嗜睡，但焦虑、烦躁感加剧，也可能出现'假性失眠'。",
      soundHealing: {
        needs: "开始收缩、情绪起伏大、易疲惫",
        description: '60-80Hz 低频铺底，辅以 theta 波（4-8Hz）脑波引导，稳定情绪起伏，沉入梦境。'
      },
      sounds: [
        { name: "梦海深潜", icon: Cloud, audioSrc: "" },
        { name: "苔藓蒸汽", icon: Waves, audioSrc: "" },
        { name: "夜空寺庙", icon: Stars, audioSrc: "" }
      ]
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
        你的周期，你的睡眠声音
      </h2>

      {/* 周期阶段 Tabs */}
      <div className="flex justify-between mb-12 backdrop-blur-sm rounded-full p-1 border border-white/20">
        {[
          { id: 'menstrual', name: '月经期' },
          { id: 'follicular', name: '卵泡期' },
          { id: 'ovulation', name: '排卵期' },
          { id: 'luteal', name: '黄体期' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-4 rounded-full transition-all text-sm md:text-base font-medium
              ${activeTab === tab.id 
                ? 'bg-white/20 text-white shadow-lg' 
                : 'text-white hover:bg-white/10'}`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* 身体变化说明 */}
      <div className="backdrop-blur-sm rounded-lg p-6 mb-8 transform transition-all duration-300 border border-white/20">
        <h3 className="text-xl text-white font-medium mb-4 flex items-center">
          <Moon className="w-5 h-5 mr-2" />
          身体变化
        </h3>
        <p className="text-white leading-relaxed">
          {cycleData[activeTab].bodyChanges}
        </p>
      </div>

      {/* 声音疗愈说明 */}
      <div className="backdrop-blur-sm rounded-lg p-6 mb-12 transform transition-all duration-300 border border-white/20">
        <h3 className="text-xl text-white font-medium mb-4 flex items-center">
          <Cloud className="w-5 h-5 mr-2" />
          声音疗愈
        </h3>
        <p className="text-white leading-relaxed mb-4">
          {cycleData[activeTab].soundHealing.needs}
        </p>
        <p className="text-white/80 leading-relaxed italic">
          {cycleData[activeTab].soundHealing.description}
        </p>
      </div>

      {/* 白噪音选项 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cycleData[activeTab].sounds.map((sound, index) => (
          <div key={sound.name} className="backdrop-blur-sm rounded-lg p-6 hover:shadow-lg transition-all transform hover:scale-102 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <sound.icon className="w-5 h-5 text-white mr-2" />
                <span className="text-white font-medium">{sound.name}</span>
              </div>
              <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                <span className="text-white">▶</span>
              </button>
            </div>
            <div className="h-2 bg-white/20 rounded-full mb-2">
              <div className="h-full w-1/3 bg-white/50 rounded-full"></div>
            </div>
            {sound.audioSrc && (
              <audio controls src={sound.audioSrc} className="w-full mt-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CycleInfo;
