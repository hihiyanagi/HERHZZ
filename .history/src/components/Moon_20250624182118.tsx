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
      setRotationAngle(prev => (prev + 0.05) % 360); // 降低旋转速度，更加真实
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  // 星星颜色配置
  const moonStarColors = moonColorScheme === "warm" 
    ? ["#ffffff", "#fffde6", "#fff6c0"] // 更亮的黄色系星星，匹配新的月亮颜色
    : ["#ffffff", "#f0f0ff", "#e8e8ff"]; // 冷色系星星
  
  // 黄色渐变色配置，使用图片中的色系 - 增强底色立体感
  const yellowGradient = `radial-gradient(circle at 30% 30%,
    #FFF5A0 0%, 
    #FDF386 30%, 
    #FEF878 50%, 
    #FEFA71 70%, 
    #F4F758 85%,
    #E8EB52 100%
  )`;
  
  const glowColors = moonColorScheme === "warm"
    ? { from: "from-[#FEFA71]/30", to: "to-[#FFE566]/50" } // 更明亮的黄色光晕
    : { from: "from-[#8c7db1]/10", to: "to-[#a395c9]/30" }; // 原蓝紫色光晕
  
  // 简化的月球坑洼SVG
  const cratersSVG = `
    <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <!-- 小型环形坑 - 摩登简约风格 -->
      <circle cx="120" cy="100" r="15" fill="none" stroke="#E8E4A1" stroke-width="1.2" opacity="0.4" />
      <circle cx="70" cy="280" r="18" fill="none" stroke="#E8E4A1" stroke-width="1.2" opacity="0.3" />
      <circle cx="300" cy="150" r="20" fill="none" stroke="#E8E4A1" stroke-width="1.2" opacity="0.35" />
      
      <!-- 中型环形坑 -->
      <circle cx="170" cy="110" r="30" fill="none" stroke="#E5E09B" stroke-width="1.5" opacity="0.4" />
      <circle cx="260" cy="190" r="35" fill="none" stroke="#E5E09B" stroke-width="1.5" opacity="0.35" />
      
      <!-- 大型环形坑 - 简化设计 -->
      <circle cx="150" cy="250" r="55" fill="none" stroke="#DCDC95" stroke-width="1.8" opacity="0.45" />
      
      <!-- 月海区域(较暗的区域) - 干净简洁的设计 -->
      <ellipse cx="100" cy="150" rx="80" ry="70" fill="#D1CC72" opacity="0.1" />
      <ellipse cx="280" cy="230" rx="100" ry="90" fill="#D1CC72" opacity="0.08" />
    </svg>
  `;
  
  // 将SVG转换为数据URL
  const cratersURL = `data:image/svg+xml,${encodeURIComponent(cratersSVG)}`;
  
  // 移动端检测
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  // 移动端优化的圆形样式
  const mobileOptimizedCircleStyle = {
    // 强制抗锯齿渲染
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    // 优化图形渲染
    imageRendering: 'crisp-edges' as const,
    // 强制使用高质量渲染
    WebkitTransform: 'translateZ(0)',
    transform: 'translateZ(0)',
    // 确保完美圆角
    borderRadius: '50%',
    // 添加细微的边框来改善边缘渲染
    border: '0.5px solid rgba(255, 255, 255, 0.1)',
  };

  return (
    <div 
      className="relative flex items-center justify-center animate-float moon-container"
      style={{
        // 统一所有平台的基础样式，去除可能导致边界显示的属性
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        outline: 'none',
        border: 'none',
        // 移除isolation: 'isolate'和translateZ(0)，这些可能导致边界显示
      }}
    >
      {/* 增强的光晕效果 - 桌面端和移动端分别优化 */}
      <div 
        className="absolute rounded-full animate-pulse"
        style={{
          width: `${size * 1.2}px`,
          height: `${size * 1.2}px`,
          background: moonColorScheme === "warm" 
            ? `radial-gradient(circle, rgba(254, 250, 113, 0.4) 0%, rgba(255, 229, 102, 0.25) 40%, transparent 70%)`
            : `radial-gradient(circle, rgba(140, 125, 177, 0.25) 0%, rgba(163, 149, 201, 0.15) 40%, transparent 70%)`,
          outline: 'none',
          border: 'none',
          WebkitTapHighlightColor: 'transparent',
          // 桌面端添加模糊效果增强光晕
          ...(!isMobile ? {
            filter: 'blur(1px)',
            WebkitFilter: 'blur(1px)',
          } : {
            WebkitFontSmoothing: 'antialiased',
            borderRadius: '50%',
          })
        }}
      />
      
      {/* 桌面端额外的外层光晕 */}
      {!isMobile && (
        <div 
          className="absolute rounded-full animate-pulse"
          style={{
            width: `${size * 1.6}px`,
            height: `${size * 1.6}px`,
            background: moonColorScheme === "warm" 
              ? `radial-gradient(circle, rgba(254, 250, 113, 0.15) 0%, rgba(255, 229, 102, 0.1) 30%, transparent 60%)`
              : `radial-gradient(circle, rgba(140, 125, 177, 0.1) 0%, rgba(163, 149, 201, 0.05) 30%, transparent 60%)`,
            filter: 'blur(2px)',
            WebkitFilter: 'blur(2px)',
            animationDelay: '0.5s',
          }}
        />
      )}
      
      {/* 主月球 */}
      <div 
        className="rounded-full shadow-xl overflow-hidden relative z-10"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: moonColorScheme === "warm" ? yellowGradient : "#20202c",
          // 统一阴影效果，不再区分移动端和桌面端  
          boxShadow: '0 0 20px rgba(255, 245, 160, 0.18), inset 0 0 30px rgba(255, 255, 255, 0.08)',
          outline: 'none',
          border: 'none',
          WebkitTapHighlightColor: 'transparent',
          // 移除translateZ(0)，避免创建硬件加速层边界
          // 移动端特殊优化
          ...(isMobile ? mobileOptimizedCircleStyle : {})
        }}
      >
        {/* 轻微旋转的容器 */}
        <div className="w-full h-full relative" 
          style={{ 
            transform: `rotate(${rotationAngle}deg)`,
            transition: 'transform 0.5s ease-out',
            // 确保旋转容器也是完美圆形
            borderRadius: '50%',
            overflow: 'hidden'
          }}>
          {/* 月球内部星星 */}
          <TwinklingStars count={15} starColors={moonStarColors} />
          
          {/* 添加纹理与渐变 */}
          <div 
            className="absolute inset-0 bg-gradient-radial"
            style={{
              backgroundImage: moonColorScheme === "warm" 
                ? "radial-gradient(circle at 30% 30%, transparent 30%, rgba(254, 250, 113, 0.4) 70%)"
                : "radial-gradient(circle, transparent, rgba(32, 32, 44, 0.8))",
              borderRadius: '50%'
            }}
          ></div>
          
          {/* 为温暖色调添加动态光效 */}
          {moonColorScheme === "warm" && (
            <div className="absolute inset-0 bg-gradient-to-tr from-[#FFE566]/20 to-transparent animate-pulse"
              style={{ borderRadius: '50%' }}
            ></div>
          )}
          
          {/* 添加月球表面纹理 - 简化版本 */}
          <div 
            className="absolute inset-0 mix-blend-soft-light"
            style={{
              backgroundImage: `url("${cratersURL}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '50%'
            }}
          ></div>
          
          {/* 添加噪点纹理增强表面质感 */}
          <div 
            className="absolute inset-0 opacity-10 mix-blend-overlay"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
              backgroundSize: 'cover',
              borderRadius: '50%'
            }}
          ></div>
        </div>
        
        {/* 月球表面特征 - 静态层不旋转 - 摩登简约风格 */}
        <div className="absolute inset-0 opacity-40 mix-blend-overlay"
          style={{ borderRadius: '50%' }}
        >
          {moonColorScheme === "warm" && (
            <>
              {/* 月球环形山和碰撞坑 - 简洁现代风格 */}
              <div className="absolute w-16 h-16 rounded-full bg-gradient-radial from-[#F5F3A5]/10 to-transparent top-[15%] left-[25%]"></div>
              <div className="absolute w-12 h-12 rounded-full bg-gradient-radial from-[#F8F07D]/10 to-transparent top-[20%] left-[30%] animate-pulse-slow"></div>
              <div className="absolute w-10 h-10 rounded-full bg-gradient-radial from-[#EEEC8F]/10 to-transparent bottom-[25%] right-[35%] animate-pulse-slow"></div>
              <div className="absolute w-8 h-8 rounded-full bg-gradient-radial from-[#FFF292]/10 to-transparent bottom-[35%] right-[28%]"></div>
              <div className="absolute w-20 h-20 rounded-full bg-gradient-radial from-[#F1EF94]/5 to-transparent top-[55%] left-[20%]"></div>
              
              {/* 更大的月海(较暗区域) - 简约设计 */}
              <div className="absolute w-32 h-32 rounded-full bg-gradient-radial from-[#DCDC95]/5 to-transparent top-[40%] left-[40%]"></div>
            </>
          )}
        </div>
        
        {/* 添加月球表面阴影，增强3D效果 */}
        <div 
          className="absolute inset-0 mix-blend-multiply"
          style={{
            background: 'radial-gradient(circle at 30% 30%, transparent 20%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.15) 80%, rgba(0,0,0,0.2) 100%)',
            borderRadius: '50%'
          }}
        ></div>
        
        {/* 添加高光，增强3D效果 - 保持摩登风格 */}
        <div 
          className="absolute inset-0 mix-blend-screen"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 5%, rgba(255,255,255,0.1) 20%, transparent 50%)',
            borderRadius: '50%'
          }}
        ></div>
        
        {/* 添加边缘阴影，增强球形感 */}
        <div className="absolute inset-0 rounded-full"
          style={{
            boxShadow: 'inset 0px 0px 20px 10px rgba(0,0,0,0.15)',
            borderRadius: '50%'
          }}
        ></div>
      </div>
    </div>
  );
};

export default Moon;