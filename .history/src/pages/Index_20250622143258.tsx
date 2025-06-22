import React from 'react';
import Introduction from '@/components/Introduction';
import CycleInfo from '@/components/CycleInfo';
import SimpleCycle from '@/components/SimpleCycle';
import ConsistentBackground from '@/components/ConsistentBackground';

const Index = () => {
  return (
    <ConsistentBackground>
      <div className="min-h-screen space-y-12 py-12">
        <Introduction />
        <CycleInfo />
        <SimpleCycle onReset={() => {}} />
      </div>
    </ConsistentBackground>
  );
};

export default Index;
