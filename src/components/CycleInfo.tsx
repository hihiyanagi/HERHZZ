import React from 'react';
import { Moon, Cloud, Music, Waves } from 'lucide-react';

const CycleInfo = () => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-moon-dark">
        你的周期，你的睡眠声音
      </h2>

      {/* 周期阶段 */}
      <div className="flex justify-between mb-12 text-moon-dark">
        <div className="text-center opacity-70">月经期</div>
        <div className="text-center opacity-70">卵泡期</div>
        <div className="text-center opacity-70">排卵期</div>
        <div className="text-center opacity-70">黄体期</div>
      </div>

      {/* 身体变化说明 */}
      <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 mb-8">
        <h3 className="text-xl text-moon-dark font-medium mb-4 flex items-center">
          <Moon className="w-5 h-5 mr-2" />
          身体变化
        </h3>
        <p className="text-gray-700 leading-relaxed">
          雌激素、孕激素低，容易疲劳，情绪波动，痛经导致睡眠浅或中断。
        </p>
      </div>

      {/* 声音疗愈说明 */}
      <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 mb-12">
        <h3 className="text-xl text-moon-dark font-medium mb-4 flex items-center">
          <Cloud className="w-5 h-5 mr-2" />
          声音疗愈
        </h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          需要被包裹，身体拥抱感
        </p>
        <p className="text-gray-700 leading-relaxed italic">
          40-60Hz，如"音频版热水袋"，低频声音有助于放松交感神经，营造"子宫感"或"胎内感"——让身体信任被包裹。
        </p>
      </div>

      {/* 白噪音选项 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Music className="w-5 h-5 text-moon-dark mr-2" />
              <span className="text-moon-dark font-medium">月之低雨</span>
            </div>
            <button className="w-8 h-8 rounded-full bg-moon-light flex items-center justify-center hover:bg-moon-dark transition-colors">
              <span className="text-white">▶</span>
            </button>
          </div>
          <div className="h-2 bg-moon-light/30 rounded-full">
            <div className="h-full w-1/3 bg-moon-dark rounded-full"></div>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Waves className="w-5 h-5 text-moon-dark mr-2" />
              <span className="text-moon-dark font-medium">摇篮潮汐</span>
            </div>
            <button className="w-8 h-8 rounded-full bg-moon-light flex items-center justify-center hover:bg-moon-dark transition-colors">
              <span className="text-white">▶</span>
            </button>
          </div>
          <div className="h-2 bg-moon-light/30 rounded-full">
            <div className="h-full w-1/2 bg-moon-dark rounded-full"></div>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Moon className="w-5 h-5 text-moon-dark mr-2" />
              <span className="text-moon-dark font-medium">银河风琴</span>
            </div>
            <button className="w-8 h-8 rounded-full bg-moon-light flex items-center justify-center hover:bg-moon-dark transition-colors">
              <span className="text-white">▶</span>
            </button>
          </div>
          <div className="h-2 bg-moon-light/30 rounded-full">
            <div className="h-full w-2/3 bg-moon-dark rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycleInfo;
