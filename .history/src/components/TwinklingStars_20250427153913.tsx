import React from "react";

interface StarProps {
  size: number;
  top: string;
  left: string;
  animationDelay: string;
  color?: string;
  hasPulse?: boolean;
}

const Star: React.FC<StarProps> = ({ 
  size, 
  top, 
  left, 
  animationDelay, 
  color = "white", 
  hasPulse = false 
}) => {
  // 为部分大一点的星星添加光晕
  const hasGlow = size > 2;
  
  return (
    <div
      className={`absolute rounded-full ${hasPulse ? 'animate-pulse-slow' : 'animate-twinkle'}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        top,
        left,
        animationDelay,
        backgroundColor: color,
        boxShadow: hasGlow ? `0 0 ${size * 1.5}px ${color}` : 'none',
      }}
    />
  );
};

interface TwinklingStarsProps {
  count?: number;
  starColors?: string[];
  hasPulsingStars?: boolean;
}

const TwinklingStars: React.FC<TwinklingStarsProps> = ({ 
  count = 50,
  starColors = ["white"],
  hasPulsingStars = true
}) => {
  // 生成随机星星
  const stars = Array.from({ length: count }).map((_, i) => {
    const size = Math.random() * 2.5 + 1; // 星星尺寸在1-3.5px之间
    const top = `${Math.random() * 100}%`;
    const left = `${Math.random() * 100}%`;
    const animationDelay = `${Math.random() * 5}s`; // 闪烁动画随机延迟
    const color = starColors[Math.floor(Math.random() * starColors.length)];
    // 约10%的星星使用脉冲效果而不是闪烁
    const hasPulse = hasPulsingStars && Math.random() > 0.9;
    
    return (
      <Star
        key={i}
        size={size}
        top={top}
        left={left}
        animationDelay={animationDelay}
        color={color}
        hasPulse={hasPulse}
      />
    );
  });

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {stars}
    </div>
  );
};

export default TwinklingStars; 