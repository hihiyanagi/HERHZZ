import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import MoonAnimation from "./MoonAnimation";
import { Moon, Sun, Cloud, Stars } from "lucide-react";

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
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-gradient-to-b from-night-light to-moon-soft">
      <div className="flex flex-col items-center mb-6">
        <h2 className="text-5xl font-bold text-moon-dark tracking-wider animate-title">
          HERHZZZ
        </h2>
      </div>
      
      <MoonAnimation />
      
      <h3 className="text-xl md:text-2xl font-semibold text-night-dark mb-12">
        你的周期，你的声音
      </h3>
      
      <div ref={textRef} className="max-w-2xl space-y-12 text-night-dark mb-10">
        {/* 第一章节：失眠的困扰 */}
        <div className="fade-in-section space-y-4 p-6 rounded-lg bg-white/50 backdrop-blur-sm">
          <div className="flex items-center justify-center mb-4">
            <Moon className="w-8 h-8 text-moon-dark" />
          </div>
          <p className="delay-[100ms] text-lg">有些夜，我们会突然失眠，翻来覆去找不到原因。</p>
          <p className="delay-[300ms]">但其实，我们的身体并没有出错，</p>
          <p className="delay-[500ms]">它只是像月亮一样，在进行一场悄无声息的变化。</p>
        </div>

        {/* 第二章节：身体的韵律 */}
        <div className="fade-in-section space-y-4 p-6 rounded-lg bg-white/50 backdrop-blur-sm">
          <div className="flex items-center justify-center mb-4">
            <Sun className="w-8 h-8 text-moon-dark" />
          </div>
          <p className="delay-[700ms]">月经的潮汐、情绪的涨落、睡眠的深浅，</p>
          <p className="delay-[900ms]">都是我们身体与自然之间的共鸣。</p>
          <p className="delay-[1100ms]">所以，当你发现自己睡不着，不必焦虑或责备。</p>
        </div>

        {/* 第三章节：月亮时刻 */}
        <div className="fade-in-section space-y-4 p-6 rounded-lg bg-white/50 backdrop-blur-sm">
          <div className="flex items-center justify-center mb-4">
            <Stars className="w-8 h-8 text-moon-dark" />
          </div>
          <p className="delay-[1300ms]">你正在经历的，只是你自己的"月亮"时刻。</p>
          <p className="delay-[1500ms]">你不是孤单的。</p>
          <p className="delay-[1700ms]">月亮在我们的身体里，我们必定好梦。</p>
        </div>

        {/* 第四章节：我们的承诺 */}
        <div className="fade-in-section space-y-4 p-6 rounded-lg bg-white/50 backdrop-blur-sm">
          <div className="flex items-center justify-center mb-4">
            <Cloud className="w-8 h-8 text-moon-dark" />
          </div>
          <p className="delay-[1900ms] font-medium">我们为你设计了这款 app：</p>
          <p className="delay-[2100ms]">跟随你的周期，回应你的波动，用声音伴你入梦。</p>
        </div>
      </div>
      
      {onContinue && (
        <button 
          onClick={onContinue}
          className="px-8 py-3 bg-moon-DEFAULT hover:bg-moon-dark text-white rounded-full font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
        >
          继续
        </button>
      )}
    </div>
  );
};

export default Introduction;
