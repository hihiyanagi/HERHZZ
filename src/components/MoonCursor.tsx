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
          d="M 4 4 C 4 3, 5 3, 5 3 L 20 18 C 20.5 18.5, 20.5 19, 20 19.5 L 14 19.5 L 17 27 C 17.2 27.5, 16.8 28, 16.3 27.8 L 12 26 C 11.7 25.9, 11.5 25.6, 11.5 25.3 L 10 20.5 L 6 24.5 C 5.5 25, 4.5 24.7, 4.5 24 L 4 4 Z"
          fill="url(#pointerGradient)"
          stroke="rgba(236, 72, 153, 0.4)"
          strokeWidth="0.3"
        />
        
        {/* 鼠标指针内部高光 */}
        <path
          d="M 6 6 L 17 17 L 13 17 L 15.5 24 L 13 23 L 11 19 L 8 22 L 6 6 Z"
          fill="rgba(251, 207, 232, 0.3)"
        />
        
        {/* 鼠标指针外部光晕 */}
        <path
          d="M 2 2 C 2 1, 3 1, 3 1 L 22 20 C 22.8 20.8, 22.8 21.5, 22 22.3 L 15 22.3 L 18.5 31 C 18.8 31.8, 18.2 32.5, 17.4 32.2 L 11.5 30 C 11 29.8, 10.7 29.3, 10.7 28.8 L 9 23.5 L 4.5 27.5 C 3.8 28.2, 2.5 27.8, 2.5 26.8 L 2 2 Z"
          fill="none"
          stroke="url(#pointerGlowGradient)"
          strokeWidth="1"
          opacity="0.15"
        />
        
        {/* 渐变定义 */}
        <defs>
          <linearGradient id="pointerGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(251, 207, 232, 0.9)" />
            <stop offset="50%" stopColor="rgba(244, 114, 182, 0.8)" />
            <stop offset="100%" stopColor="rgba(236, 72, 153, 0.7)" />
          </linearGradient>
          
          <linearGradient id="pointerGlowGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(244, 114, 182, 0.2)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default MoonCursor; 