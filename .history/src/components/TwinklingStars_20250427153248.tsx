import React from "react";

interface StarProps {
  size: number;
  top: string;
  left: string;
  animationDelay: string;
  color?: string;
}

const Star: React.FC<StarProps> = ({ size, top, left, animationDelay, color = "white" }) => {
  return (
    <div
      className="absolute rounded-full animate-twinkle"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        top,
        left,
        animationDelay,
        backgroundColor: color,
      }}
    />
  );
};

interface TwinklingStarsProps {
  count?: number;
  starColors?: string[];
}

const TwinklingStars: React.FC<TwinklingStarsProps> = ({ 
  count = 50,
  starColors = ["white"]
}) => {
  // Generate random stars
  const stars = Array.from({ length: count }).map((_, i) => {
    const size = Math.random() * 2 + 1; // Star size between 1-3px
    const top = `${Math.random() * 100}%`;
    const left = `${Math.random() * 100}%`;
    const animationDelay = `${Math.random() * 5}s`; // Random delay for twinkling effect
    const color = starColors[Math.floor(Math.random() * starColors.length)];
    
    return (
      <Star
        key={i}
        size={size}
        top={top}
        left={left}
        animationDelay={animationDelay}
        color={color}
      />
    );
  });

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {stars}
    </div>
  );
};

export default TwinklingStars; 