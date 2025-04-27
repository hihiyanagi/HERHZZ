import React, { useState } from 'react';
import Introduction from '@/components/Introduction';
import CycleInfo from '@/components/CycleInfo';
import PersonalCycle from '@/components/PersonalCycle';

const Index = () => {
  const [currentSection, setCurrentSection] = useState<string>('intro');

  const handleContinue = () => {
    if (currentSection === 'intro') {
      setCurrentSection('cycle');
    } else if (currentSection === 'cycle') {
      setCurrentSection('personal');
    }
  };

  const handleReset = () => {
    setCurrentSection('intro');
  };

  return (
    <div className="starry-bg min-h-screen">
      {currentSection === 'intro' && <Introduction onContinue={handleContinue} />}
      {currentSection === 'cycle' && <CycleInfo />}
      {currentSection === 'personal' && <PersonalCycle onReset={handleReset} />}
    </div>
  );
};

export default Index;
