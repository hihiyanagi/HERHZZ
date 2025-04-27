
import React from 'react';
import Introduction from '@/components/Introduction';
import CycleInfo from '@/components/CycleInfo';
import PersonalCycle from '@/components/PersonalCycle';

const Index = () => {
  return (
    <div className="min-h-screen bg-moon-soft space-y-12 py-12">
      <Introduction />
      <CycleInfo />
      <PersonalCycle onReset={() => {}} />
    </div>
  );
};

export default Index;
