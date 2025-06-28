// Token 调试工具
// 在浏览器控制台中运行此代码来检查JWT token

async function debugToken() {
  try {
    console.log('=== 🔍 JWT Token 调试工具 ===');
    
    // 从Supabase获取当前session
    const { data: { session }, error } = await window.supabase.auth.getSession();
    
    if (error) {
      console.error('❌ 获取session失败:', error);
      return;
    }
    
    if (!session) {
      console.log('❌ 用户未登录');
      return;
    }
    
    const token = session.access_token;
    console.log('✅ Token获取成功');
    console.log('Token长度:', token.length);
    console.log('Token前100个字符:', token.substring(0, 100) + '...');
    
    // 解码JWT Token (不验证签名)
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('❌ Token格式错误，不是有效的JWT');
        return;
      }
      
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      
      console.log('📋 Token Header:', header);
      console.log('📋 Token Payload:', payload);
      
      // 检查过期时间
      const now = Math.floor(Date.now() / 1000);
      const exp = payload.exp;
      
      console.log('⏰ 当前时间 (Unix):', now);
      console.log('⏰ Token过期时间 (Unix):', exp);
      console.log('⏰ Token是否过期:', now > exp ? '❌ 已过期' : '✅ 未过期');
      
      if (now > exp) {
        const expiredMinutes = Math.floor((now - exp) / 60);
        console.log(`Token已过期 ${expiredMinutes} 分钟`);
      } else {
        const remainingMinutes = Math.floor((exp - now) / 60);
        console.log(`Token还有 ${remainingMinutes} 分钟过期`);
      }
      
      // 检查用户信息
      console.log('👤 用户ID:', payload.sub);
      console.log('📧 用户邮箱:', payload.email);
      console.log('🏢 受众 (aud):', payload.aud);
      console.log('🏷️ 角色 (role):', payload.role);
      
    } catch (decodeError) {
      console.error('❌ Token解码失败:', decodeError);
    }
    
    // 测试后端API连接
    console.log('\n=== 🧪 测试后端API连接 ===');
    
    try {
      const response = await fetch('http://localhost:8000/api/protected', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🌐 后端API响应状态:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ 后端API测试成功:', data);
      } else {
        const errorText = await response.text();
        console.log('❌ 后端API测试失败:', errorText);
      }
      
    } catch (apiError) {
      console.error('❌ 后端API连接失败:', apiError);
    }
    
  } catch (error) {
    console.error('❌ 调试过程中发生错误:', error);
  }
}

// 自动运行调试
debugToken(); 