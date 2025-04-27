import React from "react";
import TwinklingStars from "./TwinklingStars";

interface MoonProps {
  size?: number;
  moonColorScheme?: "cool" | "warm";
}

const Moon: React.FC<MoonProps> = ({ size = 200, moonColorScheme = "cool" }) => {
  // 星星颜色配置
  const moonStarColors = moonColorScheme === "warm" 
    ? ["#ffffff", "#fffde6", "#fff6c0"] // 更亮的黄色系星星，匹配新的月亮颜色
    : ["#ffffff", "#f0f0ff", "#e8e8ff"]; // 冷色系星星
  
  // 根据月亮颜色方案设置颜色
  const moonColor = moonColorScheme === "warm" 
    ? "#FEFA71" // 更新为淡黄色
    : "#20202c"; // 原来的蓝紫色调深色
    
  const glowColors = moonColorScheme === "warm"
    ? { from: "from-[#FEFA71]/30", to: "to-[#FFE566]/50" } // 更明亮的黄色光晕
    : { from: "from-[#8c7db1]/10", to: "to-[#a395c9]/30" }; // 原蓝紫色光晕
  
  return (
    <div className="relative flex items-center justify-center animate-float">
      {/* 外部光晕效果 */}
      <div 
        className={`absolute rounded-full bg-gradient-to-r ${glowColors.from} ${glowColors.to} blur-xl`}
        style={{
          width: `${size * 1.5}px`,
          height: `${size * 1.5}px`,
        }}
      />
      
      {/* 主月球 */}
      <div 
        className="rounded-full shadow-xl overflow-hidden relative z-10"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: moonColor,
        }}
      >
        {/* 星星旋转容器 */}
        <div className="w-full h-full relative animate-spin-slow">
          {/* 月球内部星星 */}
          <TwinklingStars count={15} starColors={moonStarColors} />
          
          {/* 添加纹理与渐变 */}
          <div 
            className="absolute inset-0 bg-gradient-radial"
            style={{
              backgroundImage: moonColorScheme === "warm" 
                ? "radial-gradient(circle, transparent, rgba(254, 250, 113, 0.6))"
                : "radial-gradient(circle, transparent, rgba(32, 32, 44, 0.8))"
            }}
          ></div>
          
          {/* 为温暖色调添加额外的光亮 */}
          {moonColorScheme === "warm" && (
            <div className="absolute inset-0 bg-gradient-to-tr from-[#FFE566]/20 to-transparent"></div>
          )}
          
          {/* 添加噪点纹理 */}
          <div 
            className="absolute inset-0 opacity-10 mix-blend-soft-light"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
              backgroundSize: 'cover',
            }}
          ></div>
        </div>
        
        {/* 月球表面特征 - 静态层不旋转 */}
        <div className="absolute inset-0 opacity-30 mix-blend-overlay">
          {moonColorScheme === "warm" && (
            <>
              <div className="absolute w-12 h-12 rounded-full bg-[#F8F07D] top-[20%] left-[30%] opacity-40"></div>
              <div className="absolute w-8 h-8 rounded-full bg-[#FFF292] bottom-[25%] right-[35%] opacity-30"></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Moon; 