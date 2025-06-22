import React, { useEffect, useRef } from 'react';

const MoonCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + 'px';
        cursorRef.current.style.top = e.clientY + 'px';
      }
    };

    // 隐藏默认光标
    document.body.style.cursor = 'none';
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      // 恢复默认光标
      document.body.style.cursor = 'auto';
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed pointer-events-none z-[9999] transform -translate-x-1/2 -translate-y-1/2"
      style={{
        width: '32px',
        height: '32px',
        transition: 'transform 0.1s ease-out',
      }}
    >
      {/* 月亮SVG图标 */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* 新月主体 - 使用path绘制月牙形状 */}
        <path
          d="M 8 16 C 8 10, 12 6, 16 6 C 14 8, 13 12, 13 16 C 13 20, 14 24, 16 26 C 12 26, 8 22, 8 16 Z"
          fill="url(#crescentGradient)"
          stroke="rgba(251, 191, 36, 0.8)"
          strokeWidth="0.5"
        />
        
        {/* 新月内部高光 */}
        <path
          d="M 10 16 C 10 12, 12 9, 15 8 C 14 10, 13.5 13, 13.5 16 C 13.5 19, 14 22, 15 24 C 12 23, 10 20, 10 16 Z"
          fill="rgba(254, 243, 199, 0.6)"
        />
        
        {/* 新月外部光晕 */}
        <path
          d="M 6 16 C 6 9, 11 4, 18 4 C 15 6, 13 11, 13 16 C 13 21, 15 26, 18 28 C 11 28, 6 23, 6 16 Z"
          fill="none"
          stroke="url(#crescentGlowGradient)"
          strokeWidth="1.5"
          opacity="0.3"
        />
        
        {/* 渐变定义 */}
        <defs>
          <linearGradient id="crescentGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(254, 243, 199, 1)" />
            <stop offset="40%" stopColor="rgba(251, 191, 36, 0.95)" />
            <stop offset="80%" stopColor="rgba(217, 119, 6, 0.9)" />
            <stop offset="100%" stopColor="rgba(180, 83, 9, 0.8)" />
          </linearGradient>
          
          <linearGradient id="crescentGlowGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(251, 191, 36, 0.4)" />
            <stop offset="50%" stopColor="rgba(251, 191, 36, 0.2)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default MoonCursor; 