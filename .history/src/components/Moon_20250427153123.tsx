import React from "react";
import TwinklingStars from "./TwinklingStars";

interface MoonProps {
  size?: number;
}

const Moon: React.FC<MoonProps> = ({ size = 200 }) => {
  return (
    <div className="relative flex items-center justify-center animate-float">
      <div 
        className="rounded-full bg-night-dark shadow-lg overflow-hidden"
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
      >
        {/* Stars inside the moon */}
        <div className="w-full h-full relative">
          <TwinklingStars count={20} />
        </div>
      </div>
    </div>
  );
};

export default Moon; 