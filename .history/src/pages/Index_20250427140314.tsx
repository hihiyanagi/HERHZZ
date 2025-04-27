import React from 'react';
import Introduction from '@/components/Introduction';
import CycleInfo from '@/components/CycleInfo';
import PersonalCycle from '@/components/PersonalCycle';

const Index = () => {
  return (
    <div className="starry-bg min-h-screen">
      <div className="flex flex-col items-center w-full">
        <div className="w-full">
          <Introduction onContinue={() => {
            // 平滑滚动到周期信息部分
            document.getElementById('cycle-info')?.scrollIntoView({ behavior: 'smooth' });
          }} />
        </div>
        
        <div id="cycle-info" className="w-full">
          <CycleInfo onContinue={() => {
            // 平滑滚动到个人周期部分
            document.getElementById('personal-cycle')?.scrollIntoView({ behavior: 'smooth' });
          }} />
        </div>
        
        <div id="personal-cycle" className="w-full">
          <PersonalCycle onReset={() => {
            // 平滑滚动回顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} />
        </div>
      </div>
    </div>
  );
};

export default Index;
