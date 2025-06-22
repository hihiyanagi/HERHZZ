import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const QuickAuth: React.FC = () => {
  const { user, signIn, signUp, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async () => {
    if (!email || !password) {
      setMessage('请输入邮箱和密码');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      if (isRegistering) {
        console.log('📝 尝试注册用户:', email);
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes('already registered')) {
            setMessage('用户已存在，请尝试登录');
            setIsRegistering(false);
          } else {
            setMessage(`注册失败: ${error.message}`);
          }
        } else {
          setMessage('✅ 注册成功！请检查邮箱验证或等待自动登录');
        }
      } else {
        console.log('🔑 尝试登录用户:', email);
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setMessage('邮箱或密码错误，或者用户不存在');
          } else {
            setMessage(`登录失败: ${error.message}`);
          }
        } else {
          setMessage('✅ 登录成功！');
        }
      }
    } catch (err) {
      setMessage(`操作失败: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    const demoEmail = `demo_${Date.now()}@example.com`;
    const demoPassword = 'demo123456';
    
    setEmail(demoEmail);
    setPassword(demoPassword);
    setMessage('🚀 创建演示账号中...');
    setLoading(true);

    try {
      const { error } = await signUp(demoEmail, demoPassword);
      if (error) {
        setMessage(`演示账号创建失败: ${error.message}`);
      } else {
        setMessage('✅ 演示账号创建成功！可以开始使用了');
      }
    } catch (err) {
      setMessage(`演示账号创建失败: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-200 font-medium">✅ 已登录</p>
            <p className="text-green-100/80 text-sm">{user.email}</p>
          </div>
          <Button
            onClick={signOut}
            variant="outline"
            size="sm"
            className="text-green-200 border-green-500/30 hover:bg-green-500/20"
          >
            登出
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
      <h3 className="text-yellow-200 font-medium mb-3">
        ⚠️ 需要登录才能保存数据
      </h3>
      
      {message && (
        <div className="mb-3 p-2 bg-blue-500/20 rounded text-blue-200 text-sm">
          {message}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/60"
          />
        </div>
        
        <div>
          <input
            type="password"
            placeholder="密码 (至少6位)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/60"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleAuth}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? '⏳' : (isRegistering ? '注册' : '登录')}
          </Button>
          
          <Button
            onClick={() => setIsRegistering(!isRegistering)}
            variant="outline"
            className="text-white border-white/30"
          >
            {isRegistering ? '切换到登录' : '切换到注册'}
          </Button>
        </div>

        <Button
          onClick={handleQuickDemo}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          🚀 创建演示账号（一键开始）
        </Button>
        
        <p className="text-white/60 text-xs text-center">
          💡 演示账号会自动生成，无需记住密码
        </p>
      </div>
    </div>
  );
};

export default QuickAuth; 