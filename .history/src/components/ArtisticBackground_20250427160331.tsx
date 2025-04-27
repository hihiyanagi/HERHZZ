import React from 'react';

interface ArtisticBackgroundProps {
  children: React.ReactNode;
}

const ArtisticBackground: React.FC<ArtisticBackgroundProps> = ({ 
  children
}) => {
  return (
    <div 
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        background: `
          linear-gradient(to bottom, 
            #3336ff,
            #2C39D4,
            #293ABE,
            #253BA8, 
            #223D92,
            #1E3E7C,
            #1A3F66,
            #164050
          )
        `
      }}
    >
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

      {/* 内容层 */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default ArtisticBackground; 