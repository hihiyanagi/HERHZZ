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
          d="M 4 6 C 4 4, 6 4, 6 4 L 18 16 C 19 17, 19 18, 18 19 L 14.5 19 C 14 19, 13.8 19.2, 13.8 19.7 L 16.2 26.5 C 16.5 27.5, 16 28.5, 15 28.2 L 11 26.8 C 10.5 26.6, 10.2 26.2, 10.2 25.7 L 10.2 21.5 C 10.2 21, 9.8 20.6, 9.3 20.6 L 6 23.5 C 5.2 24.2, 4 23.8, 4 22.8 L 4 6 Z"
          fill="url(#pointerGradient)"
          stroke="rgba(236, 72, 153, 0.8)"
          strokeWidth="0.5"
        />
        
        {/* 鼠标指针内部高光 */}
        <path
          d="M 6 7 C 6 6.5, 6.5 6, 7 6 L 16 15.5 C 16.5 16, 16.5 16.5, 16 17 L 13.5 17 C 13.2 17, 13 17.2, 13 17.5 L 14.8 23.5 C 15 24, 14.7 24.5, 14.2 24.3 L 12.2 23.5 C 12 23.4, 11.8 23.2, 11.8 23 L 11.8 20.5 C 11.8 20.2, 11.6 20, 11.3 20 L 8.5 22.2 C 8.2 22.5, 7.8 22.4, 7.8 22 L 6 7 Z"
          fill="rgba(251, 207, 232, 0.6)"
        />
        
        {/* 鼠标指针外部光晕 */}
        <path
          d="M 2 5 C 2 2, 5 2, 5 2 L 20 18 C 21.5 19.5, 21.5 21, 20 21 L 15.5 21 C 15 21, 14.6 21.4, 14.6 21.9 L 17.5 29.5 C 18 30.8, 17 32, 15.7 31.5 L 10.5 29.5 C 9.8 29.2, 9.4 28.5, 9.4 27.8 L 9.4 22.8 C 9.4 22.3, 9 21.9, 8.5 21.9 L 4.5 25.2 C 3.2 26.3, 1.5 25.5, 1.5 23.8 L 2 5 Z"
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