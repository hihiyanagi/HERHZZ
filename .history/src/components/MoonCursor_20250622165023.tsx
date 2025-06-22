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
      {/* 鼠标指针SVG图标 */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* 鼠标指针主体 */}
        <path
          d="M 4 4 L 4 26 L 10 20 L 16 28 L 20 26 L 14 18 L 22 18 L 4 4 Z"
          fill="url(#pointerGradient)"
          stroke="rgba(236, 72, 153, 0.8)"
          strokeWidth="0.5"
        />
        
        {/* 鼠标指针内部高光 */}
        <path
          d="M 6 6 L 6 22 L 10 18 L 14 24 L 16 23 L 12 17 L 18 17 L 6 6 Z"
          fill="rgba(251, 207, 232, 0.6)"
        />
        
        {/* 鼠标指针外部光晕 */}
        <path
          d="M 2 2 L 2 28 L 11 21 L 18 30 L 22 28 L 15 19 L 24 19 L 2 2 Z"
          fill="none"
          stroke="url(#pointerGlowGradient)"
          strokeWidth="1.5"
          opacity="0.3"
        />
        
        {/* 渐变定义 */}
        <defs>
          <linearGradient id="pointerGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(251, 207, 232, 1)" />
            <stop offset="30%" stopColor="rgba(244, 114, 182, 0.95)" />
            <stop offset="70%" stopColor="rgba(236, 72, 153, 0.9)" />
            <stop offset="100%" stopColor="rgba(190, 24, 93, 0.8)" />
          </linearGradient>
          
          <linearGradient id="pointerGlowGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(244, 114, 182, 0.4)" />
            <stop offset="50%" stopColor="rgba(236, 72, 153, 0.2)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default MoonCursor; 