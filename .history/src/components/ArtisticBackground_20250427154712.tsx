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
      {/* 创建随机线条网格的背景 */}
      <div 
        className="absolute inset-0 opacity-20" 
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(0, 0, 0, 0.3) 25%, rgba(0, 0, 0, 0.3) 26%, transparent 27%, transparent 74%, rgba(0, 0, 0, 0.3) 75%, rgba(0, 0, 0, 0.3) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(0, 0, 0, 0.3) 25%, rgba(0, 0, 0, 0.3) 26%, transparent 27%, transparent 74%, rgba(0, 0, 0, 0.3) 75%, rgba(0, 0, 0, 0.3) 76%, transparent 77%, transparent)
          `,
          backgroundSize: '80px 80px',
        }}
      />
      
      {/* 添加对角线 */}
      <div 
        className="absolute inset-0 opacity-10" 
        style={{
          backgroundImage: `
            linear-gradient(45deg, rgba(0, 0, 0, 0.3) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.3) 75%, rgba(0, 0, 0, 0.3)),
            linear-gradient(135deg, rgba(0, 0, 0, 0.3) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.3) 75%, rgba(0, 0, 0, 0.3))
          `,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* 白色星点 */}
      <div className="absolute inset-0">
        {Array.from({ length: 100 }).map((_, index) => (
          <div 
            key={`white-star-${index}`}
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>
      
      {/* 红色星点 */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, index) => (
          <div 
            key={`red-star-${index}`}
            className="absolute rounded-full bg-red-500"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.6 + 0.4,
            }}
          />
        ))}
      </div>
      
      {/* 橙色星点 */}
      <div className="absolute inset-0">
        {Array.from({ length: 25 }).map((_, index) => (
          <div 
            key={`orange-star-${index}`}
            className="absolute rounded-full bg-orange-400"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.6 + 0.4,
            }}
          />
        ))}
      </div>
      
      {/* 底部的白色月亮 */}
      {showMoon && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-4 z-0">
          <div className="relative">
            {/* 月亮的白色基础形状 */}
            <div 
              className="rounded-full bg-white shadow-lg"
              style={{
                width: '200px',
                height: '200px',
                boxShadow: '0 0 30px rgba(255, 255, 255, 0.5)',
              }}
            />
            
            {/* 月亮上的线条纹理 */}
            <div 
              className="absolute inset-0 rounded-full opacity-30"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, #1e366e 25%, transparent 25%, transparent 75%, #1e366e 75%, #1e366e),
                  linear-gradient(135deg, #1e366e 25%, transparent 25%, transparent 75%, #1e366e 75%, #1e366e)
                `,
                backgroundSize: '30px 30px',
              }}
            />
            
            {/* 月亮上的斑点 */}
            <div className="absolute inset-0">
              <div className="absolute top-[20%] left-[30%] w-10 h-8 rounded-full bg-[#1e366e] opacity-20"></div>
              <div className="absolute top-[50%] left-[60%] w-12 h-10 rounded-full bg-[#1e366e] opacity-15"></div>
              <div className="absolute top-[70%] left-[40%] w-6 h-6 rounded-full bg-[#1e366e] opacity-25"></div>
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