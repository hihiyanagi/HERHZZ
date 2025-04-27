import React from 'react';

interface ArtisticBackgroundProps {
  children: React.ReactNode;
  showMoon?: boolean;
}

const ArtisticBackground: React.FC<ArtisticBackgroundProps> = ({ 
  children, 
  showMoon = true 
}) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#2a4694] to-[#1e366e]">
      {/* 细线网格背景 */}
      <div 
        className="absolute inset-0 opacity-15" 
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 49.5%, rgba(0, 0, 0, 0.2) 49.8%, rgba(0, 0, 0, 0.2) 50.2%, transparent 50.5%),
            linear-gradient(90deg, transparent 49.5%, rgba(0, 0, 0, 0.2) 49.8%, rgba(0, 0, 0, 0.2) 50.2%, transparent 50.5%)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* 对角细线 */}
      <div 
        className="absolute inset-0 opacity-10" 
        style={{
          backgroundImage: `
            linear-gradient(45deg, transparent 49.5%, rgba(0, 0, 0, 0.15) 49.8%, rgba(0, 0, 0, 0.15) 50.2%, transparent 50.5%),
            linear-gradient(135deg, transparent 49.5%, rgba(0, 0, 0, 0.15) 49.8%, rgba(0, 0, 0, 0.15) 50.2%, transparent 50.5%)
          `,
          backgroundSize: '70px 70px',
        }}
      />
      
      {/* 不规则线条 - 使用SVG */}
      <div 
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%23000' stroke-width='0.2' opacity='0.3'%3E%3Cline x1='0' y1='20' x2='100' y2='15' /%3E%3Cline x1='15' y1='0' x2='30' y2='100' /%3E%3Cline x1='60' y1='0' x2='45' y2='100' /%3E%3Cline x1='0' y1='60' x2='100' y2='75' /%3E%3Cline x1='85' y1='0' x2='70' y2='100' /%3E%3Cline x1='0' y1='80' x2='100' y2='95' /%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '400px 400px',
        }}
      />
      
      {/* 白色星点 */}
      <div className="absolute inset-0">
        {Array.from({ length: 150 }).map((_, index) => (
          <div 
            key={`white-star-${index}`}
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 1.5 + 0.8}px`,
              height: `${Math.random() * 1.5 + 0.8}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>
      
      {/* 红色星点 */}
      <div className="absolute inset-0">
        {Array.from({ length: 40 }).map((_, index) => (
          <div 
            key={`red-star-${index}`}
            className="absolute rounded-full bg-red-500"
            style={{
              width: `${Math.random() * 1.5 + 0.8}px`,
              height: `${Math.random() * 1.5 + 0.8}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>
      
      {/* 橙色星点 */}
      <div className="absolute inset-0">
        {Array.from({ length: 35 }).map((_, index) => (
          <div 
            key={`orange-star-${index}`}
            className="absolute rounded-full bg-orange-400"
            style={{
              width: `${Math.random() * 1.5 + 0.8}px`,
              height: `${Math.random() * 1.5 + 0.8}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>
      
      {/* 底部的白色月亮 */}
      {showMoon && (
        <div className="absolute bottom-[-30px] left-1/2 transform -translate-x-1/2 z-0">
          <div className="relative">
            {/* 月亮的白色基础形状 */}
            <div 
              className="rounded-full bg-white shadow-lg"
              style={{
                width: '140px',
                height: '140px',
                boxShadow: '0 0 40px rgba(255, 255, 255, 0.6)',
              }}
            />
            
            {/* 月亮上的线条纹理 */}
            <div 
              className="absolute inset-0 rounded-full opacity-40"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, #1e366e 25%, transparent 25%, transparent 75%, #1e366e 75%, #1e366e),
                  linear-gradient(135deg, #1e366e 25%, transparent 25%, transparent 75%, #1e366e 75%, #1e366e)
                `,
                backgroundSize: '20px 20px',
              }}
            />
            
            {/* 不规则纹理，模拟图片中的破碎效果 */}
            <div 
              className="absolute inset-0 rounded-full" 
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`,
                mask: 'radial-gradient(circle, transparent 40%, black 60%)',
                maskSize: '100% 100%',
                opacity: 0.8,
              }}
            />
            
            {/* 月亮上的斑点 */}
            <div className="absolute inset-0">
              <div className="absolute top-[20%] left-[30%] w-8 h-6 rounded-full bg-[#1e366e] opacity-30"></div>
              <div className="absolute top-[50%] left-[60%] w-10 h-8 rounded-full bg-[#1e366e] opacity-25"></div>
              <div className="absolute top-[70%] left-[40%] w-6 h-6 rounded-full bg-[#1e366e] opacity-35"></div>
            </div>
          </div>
        </div>
      )}

      {/* 内容层 */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default ArtisticBackground; 