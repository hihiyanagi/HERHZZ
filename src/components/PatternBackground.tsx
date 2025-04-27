import React from 'react';

interface PatternBackgroundProps {
  children: React.ReactNode;
}

const PatternBackground: React.FC<PatternBackgroundProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#1e2963]">
      {/* 背景图案 - 不规则的黑色形状 */}
      <div className="absolute inset-0 z-0">
        {/* 左上角三角形 */}
        <div className="absolute top-0 left-0 w-[40%] h-[20%] bg-black transform -skew-x-12"></div>
        
        {/* 右上角三角形 */}
        <div className="absolute top-0 right-0 w-[40%] h-[25%] bg-black transform skew-x-12"></div>
        
        {/* 左侧中间形状 */}
        <div className="absolute top-[30%] left-0 w-[30%] h-[40%] bg-black transform -skew-y-6"></div>
        
        {/* 右侧中间形状 */}
        <div className="absolute top-[35%] right-0 w-[25%] h-[30%] bg-black transform skew-y-6"></div>
        
        {/* 底部形状 */}
        <div className="absolute bottom-0 left-[20%] w-[60%] h-[20%] bg-black transform skew-x-3"></div>
        
        {/* 左下角形状 */}
        <div className="absolute bottom-0 left-0 w-[20%] h-[30%] bg-black"></div>
        
        {/* 右下角形状 */}
        <div className="absolute bottom-0 right-0 w-[20%] h-[20%] bg-black"></div>
        
        {/* 随机小圆点 */}
        <div className="absolute top-[10%] left-[20%] w-2 h-2 rounded-full bg-white/70"></div>
        <div className="absolute top-[25%] left-[10%] w-1.5 h-1.5 rounded-full bg-white/70"></div>
        <div className="absolute top-[40%] left-[40%] w-1.5 h-1.5 rounded-full bg-white/70"></div>
        <div className="absolute top-[15%] right-[30%] w-2 h-2 rounded-full bg-white/70"></div>
        <div className="absolute top-[60%] right-[15%] w-1.5 h-1.5 rounded-full bg-white/70"></div>
        <div className="absolute bottom-[30%] left-[30%] w-2 h-2 rounded-full bg-white/70"></div>
        <div className="absolute bottom-[20%] right-[40%] w-1.5 h-1.5 rounded-full bg-white/70"></div>
        
        {/* 橙色小圆点 */}
        <div className="absolute top-[5%] right-[45%] w-1.5 h-1.5 rounded-full bg-orange-500/90"></div>
        <div className="absolute top-[35%] left-[5%] w-1.5 h-1.5 rounded-full bg-orange-500/90"></div>
        <div className="absolute top-[60%] left-[65%] w-1.5 h-1.5 rounded-full bg-orange-500/90"></div>
        <div className="absolute bottom-[10%] left-[50%] w-1.5 h-1.5 rounded-full bg-orange-500/90"></div>
        <div className="absolute bottom-[50%] right-[5%] w-1.5 h-1.5 rounded-full bg-orange-500/90"></div>
      </div>

      {/* 内容 */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* 底部弯月 */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[300px] h-[150px] bg-black rounded-t-[300px] z-0 opacity-90"></div>
    </div>
  );
};

export default PatternBackground; 