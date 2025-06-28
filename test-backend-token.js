// 测试前端→后端Token传递
async function testBackendToken() {
  try {
    console.log('=== 🧪 测试前端→后端Token传递 ===')
    
    // 1. 获取前端token
    const { data: { session } } = await window.supabase.auth.getSession()
    if (!session?.access_token) {
      console.error('❌ 前端没有token，请先登录')
      return
    }
    
    console.log('✅ 前端token获取成功')
    console.log('Token长度:', session.access_token.length)
    
    // 2. 测试后端接收
    console.log('📡 发送请求到后端...')
    
    const response = await fetch('http://localhost:8000/api/protected', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('📊 后端响应状态:', response.status)
    
    if (response.status === 200) {
      const data = await response.json()
      console.log('✅ 后端验证成功!', data)
    } else if (response.status === 401) {
      const errorText = await response.text()
      console.log('❌ 后端验证失败 (401):', errorText)
      
      // 尝试解码token看看问题
      try {
        const payload = JSON.parse(atob(session.access_token.split('.')[1]))
        console.log('🔍 Token详情:')
        console.log('- 签发时间:', new Date(payload.iat * 1000))
        console.log('- 过期时间:', new Date(payload.exp * 1000))
        console.log('- 用户ID:', payload.sub)
        console.log('- 受众:', payload.aud)
        console.log('- 签发者:', payload.iss)
      } catch (e) {
        console.error('❌ 无法解码token:', e)
      }
    } else {
      console.log('❌ 其他错误:', response.status, await response.text())
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
  }
}

// 运行测试
testBackendToken() 