import React, { useState } from 'react';
import { supabase, isSupabaseConfigured, getSupabaseConfig } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

const ConnectionTester: React.FC = () => {
  const { user } = useAuth();
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionResults, setConnectionResults] = useState<any[]>([]);

  const testDatabaseConnection = async () => {
    setIsTestingConnection(true);
    const results: any[] = [];

    try {
      // 1. 检查配置
      const config = getSupabaseConfig();
      results.push({
        test: '配置检查',
        status: config.configured ? 'success' : 'error',
        message: config.configured ? '✅ Supabase配置正确' : '❌ Supabase配置缺失',
        details: config
      });

      if (!config.configured) {
        setConnectionResults(results);
        setIsTestingConnection(false);
        return;
      }

      // 2. 检查用户认证
      results.push({
        test: '用户认证',
        status: user ? 'success' : 'error',
        message: user ? `✅ 用户已登录: ${user.email}` : '❌ 用户未登录',
        details: user ? { id: user.id, email: user.email } : null
      });

      // 3. 测试数据库连接
      try {
        const { data, error } = await supabase.from('menstrual_cycles').select('count').limit(1);
        results.push({
          test: '数据库连接',
          status: error ? 'error' : 'success',
          message: error ? `❌ 数据库连接失败: ${error.message}` : '✅ 数据库连接正常',
          details: error || data
        });
      } catch (dbError) {
        results.push({
          test: '数据库连接',
          status: 'error',
          message: `❌ 数据库连接异常: ${dbError}`,
          details: dbError
        });
      }

      // 4. 如果用户已登录，测试权限
      if (user) {
        try {
          const { data, error } = await supabase
            .from('menstrual_cycles')
            .select('*')
            .eq('user_id', user.id)
            .limit(1);
          
          results.push({
            test: '数据库权限',
            status: error ? 'error' : 'success',
            message: error ? `❌ 权限检查失败: ${error.message}` : '✅ 数据库权限正常',
            details: error || `查询到 ${data?.length || 0} 条记录`
          });
        } catch (permError) {
          results.push({
            test: '数据库权限',
            status: 'error',
            message: `❌ 权限检查异常: ${permError}`,
            details: permError
          });
        }
      }

    } catch (generalError) {
      results.push({
        test: '总体测试',
        status: 'error',
        message: `❌ 测试过程中发生错误: ${generalError}`,
        details: generalError
      });
    }

    setConnectionResults(results);
    setIsTestingConnection(false);
  };

  return (
    <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg max-w-2xl mx-auto">
      <h3 className="text-lg font-bold text-white mb-4">🔍 快速连接测试</h3>
      
      <button
        onClick={testDatabaseConnection}
        disabled={isTestingConnection}
        className="mb-4 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white rounded transition-colors"
      >
        {isTestingConnection ? '测试中...' : '开始测试'}
      </button>

      {connectionResults.length > 0 && (
        <div className="space-y-3">
          {connectionResults.map((result, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg border ${
                result.status === 'success' 
                  ? 'bg-green-500/20 border-green-500/30 text-green-200'
                  : 'bg-red-500/20 border-red-500/30 text-red-200'
              }`}
            >
              <div className="font-medium">{result.test}: {result.message}</div>
              {result.details && (
                <pre className="text-xs mt-2 opacity-80 overflow-x-auto">
                  {typeof result.details === 'string' 
                    ? result.details 
                    : JSON.stringify(result.details, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConnectionTester; 