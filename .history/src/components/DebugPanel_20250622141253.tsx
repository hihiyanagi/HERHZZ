import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useCycle } from '@/hooks/useCycle';

const DebugPanel: React.FC = () => {
  const { user, signIn, signUp } = useAuth();
  const { addCycle } = useCycle();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isTestingCycle, setIsTestingCycle] = useState(false);
  
  const addTestResult = (test: string, status: 'success' | 'error' | 'info', message: string, details?: any) => {
    const result = {
      timestamp: new Date().toLocaleTimeString(),
      test,
      status,
      message,
      details
    };
    setTestResults(prev => [result, ...prev]);
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setTestResults([]);
    
    addTestResult('配置检查', 'info', '开始检查Supabase配置...');
    
    // 1. 检查配置
    const isConfigured = isSupabaseConfigured();
    addTestResult('配置检查', isConfigured ? 'success' : 'error', 
      isConfigured ? '✅ Supabase配置正确' : '❌ Supabase配置缺失');
    
    if (!isConfigured) {
      setIsTestingConnection(false);
      return;
    }

    // 2. 检查数据库连接
    try {
      const { data, error } = await supabase.from('menstrual_cycles').select('count').limit(1);
      if (error) {
        addTestResult('数据库连接', 'error', `❌ 数据库连接失败: ${error.message}`, error);
      } else {
        addTestResult('数据库连接', 'success', '✅ 数据库连接成功');
      }
    } catch (err) {
      addTestResult('数据库连接', 'error', `❌ 数据库连接异常: ${err}`, err);
    }

    // 3. 检查用户认证
    addTestResult('用户认证', user ? 'success' : 'error', 
      user ? `✅ 用户已登录: ${user.email}` : '❌ 用户未登录');

    // 4. 检查表结构
    try {
      const { data, error } = await supabase
        .from('menstrual_cycles')
        .select('*')
        .limit(1);
      
      if (error) {
        if (error.code === '42P01') {
          addTestResult('表结构', 'error', '❌ menstrual_cycles表不存在，需要运行数据库脚本');
        } else {
          addTestResult('表结构', 'error', `❌ 表访问错误: ${error.message}`, error);
        }
      } else {
        addTestResult('表结构', 'success', '✅ menstrual_cycles表存在且可访问');
      }
    } catch (err) {
      addTestResult('表结构', 'error', `❌ 表结构检查异常: ${err}`, err);
    }

    setIsTestingConnection(false);
  };

  const testCycleSave = async () => {
    if (!user) {
      addTestResult('周期保存', 'error', '❌ 请先登录');
      return;
    }

    setIsTestingCycle(true);
    addTestResult('周期保存', 'info', '开始测试周期数据保存...');

    try {
      const testDate = new Date().toISOString().split('T')[0];
      const result = await addCycle(testDate, ['测试症状'], '这是一条测试记录');
      addTestResult('周期保存', 'success', '✅ 周期数据保存成功！', result);
    } catch (error) {
      addTestResult('周期保存', 'error', `❌ 周期数据保存失败: ${error}`, error);
    } finally {
      setIsTestingCycle(false);
    }
  };

  const testQuickRegister = async () => {
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'test123456';

    try {
      addTestResult('快速注册', 'info', `正在注册测试账号: ${testEmail}`);
      const { data, error } = await signUp(testEmail, testPassword);
      
      if (error) {
        addTestResult('快速注册', 'error', `❌ 注册失败: ${error.message}`, error);
      } else {
        addTestResult('快速注册', 'success', '✅ 注册成功！请检查邮箱验证或等待自动登录');
      }
    } catch (err) {
      addTestResult('快速注册', 'error', `❌ 注册异常: ${err}`, err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white/10 backdrop-blur-md rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-6">🔧 调试面板</h2>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testConnection}
          disabled={isTestingConnection}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
        >
          {isTestingConnection ? '🔄 检测中...' : '🔍 测试数据库连接'}
        </button>

        {!user && (
          <button
            onClick={testQuickRegister}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            👤 快速注册测试账号
          </button>
        )}

        {user && (
          <button
            onClick={testCycleSave}
            disabled={isTestingCycle}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            {isTestingCycle ? '🔄 测试中...' : '💾 测试周期数据保存'}
          </button>
        )}
      </div>

      {/* 当前状态显示 */}
      <div className="mb-6 p-4 bg-black/20 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">当前状态</h3>
        <div className="space-y-1 text-sm">
          <p className="text-white">
            🔧 配置状态: {isSupabaseConfigured() ? '✅ 已配置' : '❌ 未配置'}
          </p>
          <p className="text-white">
            👤 用户状态: {user ? `✅ 已登录 (${user.email})` : '❌ 未登录'}
          </p>
        </div>
      </div>

      {/* 测试结果 */}
      {testResults.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">测试结果</h3>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  result.status === 'success' ? 'bg-green-600/20 border border-green-500/30' :
                  result.status === 'error' ? 'bg-red-600/20 border border-red-500/30' :
                  'bg-blue-600/20 border border-blue-500/30'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-white">{result.test}</p>
                    <p className="text-sm text-white/80">{result.message}</p>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-white/60 cursor-pointer">查看详情</summary>
                        <pre className="mt-1 text-xs text-white/80 bg-black/20 p-2 rounded overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                  <span className="text-xs text-white/60">{result.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel; 