import React, { useEffect, useRef } from 'react';
import Introduction from '@/components/Introduction';
import CycleInfo from '@/components/CycleInfo';
import PersonalCycle from '@/components/PersonalCycle';

const Index = () => {
  const cycleInfoRef = useRef<HTMLDivElement>(null);
  const personalCycleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 设置滚动观察器，自动检测视口位置并应用视觉效果
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100");
            entry.target.classList.remove("opacity-0");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
    );

    // 观察需要淡入的元素
    const sections = document.querySelectorAll(".scroll-section");
    sections.forEach((section) => {
      section.classList.add("opacity-0", "transition-opacity", "duration-1000");
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  // 平滑滚动到指定元素
  const scrollToElement = (elementRef: React.RefObject<HTMLDivElement>) => {
    elementRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="starry-bg min-h-screen">
      <div className="flex flex-col items-center w-full">
        <Introduction onContinue={() => scrollToElement(cycleInfoRef)} />
        
        <div ref={cycleInfoRef} className="w-full scroll-section">
          <CycleInfo onContinue={() => scrollToElement(personalCycleRef)} />
        </div>
        
        <div ref={personalCycleRef} className="w-full scroll-section">
          <PersonalCycle onReset={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} />
        </div>
      </div>
    </div>
  );
};

export default Index;
