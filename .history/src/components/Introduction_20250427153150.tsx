import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import TwinklingStars from "./TwinklingStars";
import Moon from "./Moon";

interface IntroductionProps {
  onContinue?: () => void;
}

const Introduction = ({ onContinue }: IntroductionProps) => {
  const textRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-4");
          }
        });
      },
      { threshold: 0.1 }
    );

    const paragraphs = textRef.current?.querySelectorAll(".fade-in-section");
    paragraphs?.forEach((p) => {
      p.classList.add("opacity-0", "translate-y-4", "transition-all", "duration-1000", "ease-out");
      observer.observe(p);
    });

    return () => {
      paragraphs?.forEach(p => observer.unobserve(p));
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 relative bg-gradient-to-b from-[#e2e1f4] to-[#d8d8f0]">
      <TwinklingStars count={50} />
      
      <div className="flex flex-col items-center mb-6 z-10">
        <h2 className="text-5xl font-bold text-[#8c7db1] tracking-wider animate-title">
          HERHZZZ
        </h2>
      </div>
      
      <div className="mb-8 z-10">
        <Moon size={180} />
      </div>
      
      <h3 className="text-xl md:text-2xl font-semibold text-[#8c7db1] mb-12 z-10 animate-fade-in">
        女性。睡眠。月亮。
      </h3>
      
      <div ref={textRef} className="max-w-2xl text-[#6a6a8e] mb-10 z-10">
        <div className="fade-in-section space-y-8 p-8 rounded-lg backdrop-blur-sm leading-loose bg-white/30">
          <div className="space-y-2">
            <p className="text-lg">有些夜晚，我们会突然失眠，翻来覆去找不到原因。</p>
            <p className="text-lg">但其实，我们的身体并没有出错，</p>
            <p className="text-lg">它只是像月亮一样，在进行一场悄无声息的变化。</p>
          </div>

          <div className="space-y-2">
            <p className="text-lg">月经的潮汐、情绪的涨落、睡眠的深浅，</p>
            <p className="text-lg">都是我们身体与自然之间的共鸣。</p>
            <p className="text-lg">所以，当你发现自己睡不着，不必焦虑或责备。</p>
            <p className="text-lg">你正在经历的，只是你自己的"月亮"时刻。</p>
          </div>

          <div className="space-y-2">
            <p className="text-lg">你不是孤单的。</p>
            <p className="text-lg">月亮在我们的身体里，我们必定好梦。</p>
            <p className="text-lg">这是一款专为女性周期设计的白噪音工具，</p>
            <p className="text-lg">跟随你的周期，回应你的波动，用声音伴你入梦。</p>
          </div>
        </div>
      </div>
      
      {onContinue && (
        <button 
          onClick={onContinue}
          className="px-8 py-3 bg-transparent hover:bg-[#8c7db1]/20 border border-[#8c7db1] text-[#8c7db1] rounded-full font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg z-10 animate-fade-in"
          style={{ animationDelay: '1.5s' }}
        >
          继续
        </button>
      )}
    </div>
  );
};

export default Introduction;
