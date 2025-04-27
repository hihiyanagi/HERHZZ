import React from 'react';
import TwinklingStars from './TwinklingStars';

interface ConsistentBackgroundProps {
  children: React.ReactNode;
}

const ConsistentBackground: React.FC<ConsistentBackgroundProps> = ({ children }) => {
  // Star color to match the gradient
  const bgStarColors = ["#ffffff", "#a0a7dd", "#8e9ef0"];
  
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Main gradient background that matches the colors from the image */}
      <div 
        className="fixed inset-0"
        style={{
          background: `linear-gradient(to bottom, 
            #3336FF, /* Palatinate blue (top) */
            #2C39D2, /* Persian blue area */
            #223D92, /* Marian blue area */
            #1E3E7C, /* Yale blue area */
            #164050  /* Midnight green (bottom) */
          )`,
          backgroundSize: '100% 100%',
          backgroundAttachment: 'fixed',
          zIndex: -10
        }}
      />
      
      {/* Twinkling stars for the night sky effect */}
      <div className="fixed inset-0" style={{ zIndex: -5 }}>
        <TwinklingStars count={60} starColors={bgStarColors} />
      </div>
      
      {/* Additional subtle patterns for texture */}
      <div 
        className="fixed inset-0 opacity-15" 
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 49.5%, rgba(255, 255, 255, 0.1) 49.8%, rgba(255, 255, 255, 0.1) 50.2%, transparent 50.5%),
            linear-gradient(90deg, transparent 49.5%, rgba(255, 255, 255, 0.1) 49.8%, rgba(255, 255, 255, 0.1) 50.2%, transparent 50.5%)
          `,
          backgroundSize: '60px 60px',
          backgroundAttachment: 'fixed',
          zIndex: -3
        }}
      />
      
      {/* Content container */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default ConsistentBackground; 