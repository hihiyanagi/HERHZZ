import React from "react";
import TwinklingStars from "./TwinklingStars";

interface MoonProps {
  size?: number;
}

const Moon: React.FC<MoonProps> = ({ size = 200 }) => {
  return (
    <div className="relative flex items-center justify-center animate-float">
      {/* Shadow glow effect */}
      <div 
        className="absolute rounded-full bg-gradient-to-r from-[#8c7db1]/10 to-[#a395c9]/30 blur-xl"
        style={{
          width: `${size * 1.2}px`,
          height: `${size * 1.2}px`,
        }}
      />
      
      {/* Main moon */}
      <div 
        className="rounded-full bg-[#20202c] shadow-xl overflow-hidden relative z-10"
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
      >
        {/* Stars inside the moon */}
        <div className="w-full h-full relative">
          <TwinklingStars count={15} />
          
          {/* Create some texture with gradient overlays */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent to-[#20202c]/80"></div>
          
          {/* Add subtle noise texture */}
          <div 
            className="absolute inset-0 opacity-10 mix-blend-soft-light"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
              backgroundSize: 'cover',
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Moon; 