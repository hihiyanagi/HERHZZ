import React, { useState } from 'react';
import Introduction from '@/components/Introduction';
import CycleInfo from '@/components/CycleInfo';
// import PersonalCycle from '@/components/PersonalCycle';
import SimpleCycle from '@/components/SimpleCycle';
import ConsistentBackground from '@/components/ConsistentBackground';
import DebugPanel from '@/components/DebugPanel';

const Index = () => {
  const [showDebug, setShowDebug] = useState(false);
  const [useSimpleVersion, setUseSimpleVersion] = useState(true);

  return (
    <ConsistentBackground>
      <div className="min-h-screen space-y-12 py-12">
        {/* 调试按钮和版本切换 - 固定在页面顶部 */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="px-4 py-2 bg-blue-600/80 hover:bg-blue-700/80 backdrop-blur-sm text-white text-sm rounded-lg shadow-lg transition-colors"
          >
            {showDebug ? '❌ 关闭调试' : '🔧 打开调试'}
          </button>
          
          <div className="px-4 py-2 bg-green-600/80 backdrop-blur-sm text-white text-sm rounded-lg shadow-lg">
            ✅ 使用简化版本（确保能保存）
          </div>
        </div>

        <Introduction />
        <CycleInfo />
        
        {/* 使用简化版本确保能正常保存 */}
        <SimpleCycle onReset={() => {}} />
        
        {/* 调试面板 */}
        {showDebug && (
          <section className="py-12">
            <DebugPanel />
          </section>
        )}
      </div>
    </ConsistentBackground>
  );
};

export default Index;
