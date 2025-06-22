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
        {/* 月亮主体 */}
        <circle
          cx="16"
          cy="16"
          r="12"
          fill="url(#moonGradient)"
          stroke="rgba(251, 191, 36, 0.6)"
          strokeWidth="1"
        />
        
        {/* 月亮阴影部分（新月效果） */}
        <path
          d="M 10 8 A 8 8 0 0 0 10 24 A 10 10 0 0 1 10 8"
          fill="rgba(234, 179, 8, 0.3)"
        />
        
        {/* 月亮光晕 */}
        <circle
          cx="16"
          cy="16"
          r="14"
          fill="none"
          stroke="url(#moonGlowGradient)"
          strokeWidth="2"
          opacity="0.4"
        />
        
        {/* 渐变定义 */}
        <defs>
          <radialGradient id="moonGradient" cx="0.3" cy="0.3">
            <stop offset="0%" stopColor="rgba(254, 243, 199, 1)" />
            <stop offset="70%" stopColor="rgba(251, 191, 36, 0.9)" />
            <stop offset="100%" stopColor="rgba(217, 119, 6, 0.8)" />
          </radialGradient>
          
          <radialGradient id="moonGlowGradient" cx="0.5" cy="0.5">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="80%" stopColor="rgba(251, 191, 36, 0.2)" />
            <stop offset="100%" stopColor="rgba(251, 191, 36, 0.1)" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

export default MoonCursor; 