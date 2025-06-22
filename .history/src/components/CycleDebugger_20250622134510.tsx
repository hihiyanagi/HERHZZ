import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCycle } from '@/hooks/useCycle';
import { cycleService } from '@/lib/database';

const CycleDebugger: React.FC = () => {
  const { user } = useAuth();
  const { cycles, currentCycle, loading, addCycle } = useCycle();
  const [testDate, setTestDate] = useState('');
  const [debugInfo, setDebugInfo] = useState<any[]>([]);
  const [isTestingDb, setIsTestingDb] = useState(false);

  // 测试数据库连接
  const testDatabaseConnection = async () => {
    setIsTestingDb(true);
    const logs: any[] = [];
    
    try {
      if (!user) {
        logs.push({ type: 'error', message: '用户未登录' });
        setDebugInfo(logs);
        return;
      }

      logs.push({ type: 'info', message: `当前用户ID: ${user.id}` });

      // 测试读取周期数据
      try {
        const existingCycles = await cycleService.getUserCycles(user.id);
        logs.push({ 
          type: 'success', 
          message: `成功读取周期数据，共 ${existingCycles.length} 条记录`,
          data: existingCycles 
        });
      } catch (error) {
        logs.push({ 
          type: 'error', 
          message: '读取周期数据失败', 
          error: error instanceof Error ? error.message : String(error) 
        });
      }

      // 测试写入一条测试数据
      if (testDate) {
        try {
          const testCycle = await cycleService.addCycle({
            user_id: user.id,
            start_date: testDate,
            symptoms: ['测试症状'],
            notes: '这是一条测试数据'
          });
          
          logs.push({ 
            type: 'success', 
            message: '成功添加测试周期数据',
            data: testCycle 
          });
        } catch (error) {
          logs.push({ 
            type: 'error', 
            message: '添加测试周期数据失败', 
            error: error instanceof Error ? error.message : String(error) 
          });
        }
      }

    } catch (error) {
      logs.push({ 
        type: 'error', 
        message: '数据库连接测试失败', 
        error: error instanceof Error ? error.message : String(error) 
      });
    }

    setDebugInfo(logs);
    setIsTestingDb(false);
  };

  return (
    <div className="p-6 bg-white/10 backdrop-blur-sm rounded-lg max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-white mb-6">🔧 月经周期数据调试器</h2>
      
      {/* 用户信息 */}
      <div className="mb-6 p-4 bg-white/5 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-2">用户状态</h3>
        <div className="text-white/80">
          <p>登录状态: {user ? '✅ 已登录' : '❌ 未登录'}</p>
          {user && <p>用户ID: {user.id}</p>}
          {user && <p>邮箱: {user.email}</p>}
        </div>
      </div>

      {/* 周期数据状态 */}
      <div className="mb-6 p-4 bg-white/5 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-2">周期数据状态</h3>
        <div className="text-white/80">
          <p>加载状态: {loading ? '🔄 加载中' : '✅ 加载完成'}</p>
          <p>周期数据数量: {cycles.length} 条</p>
          <p>当前周期: {currentCycle ? '✅ 存在' : '❌ 无'}</p>
          
          {cycles.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">最近的周期记录:</h4>
              <div className="bg-white/5 p-3 rounded text-sm">
                {cycles.slice(0, 3).map((cycle, index) => (
                  <div key={cycle.id} className="mb-2">
                    <span>#{index + 1}: {cycle.start_date}</span>
                    {cycle.notes && <span className="ml-2 text-white/60">- {cycle.notes}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 数据库测试工具 */}
      <div className="mb-6 p-4 bg-white/5 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-4">数据库连接测试</h3>
        
        <div className="flex gap-4 mb-4">
          <input
            type="date"
            value={testDate}
            onChange={(e) => setTestDate(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
            placeholder="选择测试日期"
          />
          <button
            onClick={testDatabaseConnection}
            disabled={isTestingDb || !user}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white rounded transition-colors"
          >
            {isTestingDb ? '测试中...' : '测试数据库'}
          </button>
        </div>

        {/* 调试信息显示 */}
        {debugInfo.length > 0 && (
          <div className="bg-black/30 p-4 rounded max-h-60 overflow-y-auto">
            <h4 className="text-white font-medium mb-2">调试日志:</h4>
            {debugInfo.map((log, index) => (
              <div 
                key={index} 
                className={`mb-2 p-2 rounded text-sm ${
                  log.type === 'error' ? 'bg-red-500/20 text-red-200' :
                  log.type === 'success' ? 'bg-green-500/20 text-green-200' :
                  'bg-blue-500/20 text-blue-200'
                }`}
              >
                <div className="font-medium">{log.message}</div>
                {log.error && (
                  <div className="text-xs mt-1 opacity-80">错误: {log.error}</div>
                )}
                {log.data && (
                  <pre className="text-xs mt-1 opacity-80 overflow-x-auto">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 使用说明 */}
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <h3 className="text-lg font-medium text-yellow-200 mb-2">⚠️ 调试说明</h3>
        <div className="text-yellow-100 text-sm space-y-1">
          <p>1. 确保你已经登录并且Supabase配置正确</p>
          <p>2. 如果没有周期数据，请使用"输入周期"功能添加数据</p>
          <p>3. 如果数据库测试失败，请检查环境变量配置</p>
          <p>4. 数据应该会自动同步到Supabase的menstrual_cycles表</p>
        </div>
      </div>
    </div>
  );
};

export default CycleDebugger; 