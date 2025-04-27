import React from "react";
import TwinklingStars from "./TwinklingStars";

interface MoonProps {
  size?: number;
  moonColorScheme?: "cool" | "warm";
}

const Moon: React.FC<MoonProps> = ({ size = 200, moonColorScheme = "cool" }) => {
  // 星星颜色配置
  const moonStarColors = ["#ffffff", "#f0f0ff", "#e8e8ff"];
  
  // 根据月亮颜色方案设置颜色
  const moonColor = moonColorScheme === "warm" 
    ? "#322b20" // 带黄色调的深色
    : "#20202c"; // 原来的蓝紫色调深色
    
  const glowColors = moonColorScheme === "warm"
    ? { from: "from-[#f5e8a5]/10", to: "to-[#e6c86e]/30" } // 温暖的月光光晕
    : { from: "from-[#8c7db1]/10", to: "to-[#a395c9]/30" }; // 原蓝紫色光晕
  
  return (
    <div className="relative flex items-center justify-center animate-float">
      {/* Shadow glow effect */}
      <div 
        className={`absolute rounded-full bg-gradient-to-r ${glowColors.from} ${glowColors.to} blur-xl`}
        style={{
          width: `${size * 1.2}px`,
          height: `${size * 1.2}px`,
        }}
      />
      
      {/* Main moon */}
      <div 
        className="rounded-full shadow-xl overflow-hidden relative z-10"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: moonColor,
        }}
      >
        {/* Stars inside the moon */}
        <div className="w-full h-full relative">
          <TwinklingStars count={15} starColors={moonStarColors} />
          
          {/* Create some texture with gradient overlays */}
          <div 
            className="absolute inset-0 bg-gradient-radial"
            style={{
              backgroundImage: moonColorScheme === "warm" 
                ? "radial-gradient(circle, transparent, rgba(50, 43, 32, 0.8))"
                : "radial-gradient(circle, transparent, rgba(32, 32, 44, 0.8))"
            }}
          ></div>
          
          {/* Add subtle warm overlay for the warm scheme */}
          {moonColorScheme === "warm" && (
            <div className="absolute inset-0 bg-gradient-to-tr from-[#e6c86e]/5 to-transparent"></div>
          )}
          
          {/* Add subtle noise texture */}
          <div 
            className="absolute inset-0 opacity-10 mix-blend-soft-light"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
              backgroundSize: 'cover',
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Moon; 