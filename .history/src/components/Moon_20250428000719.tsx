import React, { useEffect, useState } from "react";
import TwinklingStars from "./TwinklingStars";

interface MoonProps {
  size?: number;
  moonColorScheme?: "cool" | "warm";
}

const Moon: React.FC<MoonProps> = ({ size = 200, moonColorScheme = "cool" }) => {
  const [rotationAngle, setRotationAngle] = useState(0);
  
  // 使用useEffect添加轻微的旋转动画
  useEffect(() => {
    const interval = setInterval(() => {
      setRotationAngle(prev => (prev + 0.1) % 360);
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  // 星星颜色配置
  const moonStarColors = moonColorScheme === "warm" 
    ? ["#ffffff", "#fffde6", "#fff6c0"] // 更亮的黄色系星星，匹配新的月亮颜色
    : ["#ffffff", "#f0f0ff", "#e8e8ff"]; // 冷色系星星
  
  // 黄色渐变色配置，使用图片中的色系
  const yellowGradient = `linear-gradient(135deg, 
    #FFF5A0 0%, 
    #FDF386 20%, 
    #FEF878 40%, 
    #FEFA71 60%, 
    #F7F962 80%, 
    #F0F753 100%
  )`;
  
  const glowColors = moonColorScheme === "warm"
    ? { from: "from-[#FEFA71]/30", to: "to-[#FFE566]/50" } // 更明亮的黄色光晕
    : { from: "from-[#8c7db1]/10", to: "to-[#a395c9]/30" }; // 原蓝紫色光晕
  
  return (
    <div className="relative flex items-center justify-center animate-float">
      {/* 外部光晕效果 - 添加脉动动画 */}
      <div 
        className={`absolute rounded-full bg-gradient-to-r ${glowColors.from} ${glowColors.to} blur-xl animate-pulse`}
        style={{
          width: `${size * 1.6}px`,
          height: `${size * 1.6}px`,
        }}
      />
      
      {/* 主月球 */}
      <div 
        className="rounded-full shadow-xl overflow-hidden relative z-10"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: moonColorScheme === "warm" ? yellowGradient : "#20202c",
        }}
      >
        {/* 轻微旋转的容器 */}
        <div className="w-full h-full relative" 
          style={{ 
            transform: `rotate(${rotationAngle}deg)`,
            transition: 'transform 0.5s ease-out'
          }}>
          {/* 月球内部星星 */}
          <TwinklingStars count={15} starColors={moonStarColors} />
          
          {/* 添加纹理与渐变 */}
          <div 
            className="absolute inset-0 bg-gradient-radial"
            style={{
              backgroundImage: moonColorScheme === "warm" 
                ? "radial-gradient(circle, transparent 30%, rgba(254, 250, 113, 0.4) 70%)"
                : "radial-gradient(circle, transparent, rgba(32, 32, 44, 0.8))"
            }}
          ></div>
          
          {/* 为温暖色调添加动态光效 */}
          {moonColorScheme === "warm" && (
            <div className="absolute inset-0 bg-gradient-to-tr from-[#FFE566]/20 to-transparent animate-pulse"></div>
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
              <div className="absolute w-12 h-12 rounded-full bg-[#F8F07D] top-[20%] left-[30%] opacity-40 animate-pulse-slow"></div>
              <div className="absolute w-8 h-8 rounded-full bg-[#FFF292] bottom-[25%] right-[35%] opacity-30 animate-pulse-slow"></div>
              <div className="absolute w-6 h-6 rounded-full bg-[#F7F962] top-[35%] right-[20%] opacity-35 animate-pulse"></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Moon; 