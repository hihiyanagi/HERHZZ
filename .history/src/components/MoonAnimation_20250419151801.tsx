
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const MoonAnimation = () => {
  const [phase, setPhase] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((prevPhase) => (prevPhase + 1) % 8);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="relative w-24 h-24 mx-auto my-8 animate-float">
      <div className={cn(
        "absolute inset-0 rounded-full transition-all duration-1000 ease-in-out shadow-lg",
        phase === 0 && "bg-night-dark",
        phase === 1 && "bg-gradient-to-r from-night-dark to-moon-light",
        phase === 2 && "bg-gradient-to-r from-night-dark via-moon-light to-moon-light",
        phase === 3 && "bg-gradient-to-r from-night-dark via-moon-light to-white",
        phase === 4 && "bg-white",
        phase === 5 && "bg-gradient-to-l from-night-dark via-moon-light to-white",
        phase === 6 && "bg-gradient-to-l from-night-dark via-moon-light to-moon-light",
        phase === 7 && "bg-gradient-to-l from-night-dark to-moon-light",
      )}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute w-full h-full opacity-30">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i}
              className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse-soft"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 3}s`,
                width: `${Math.random() * 1.5 + 0.5}px`,
                height: `${Math.random() * 1.5 + 0.5}px`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoonAnimation;
