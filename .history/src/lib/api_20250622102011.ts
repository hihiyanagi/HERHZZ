import { supabase } from './supabase'

// API基础URL，可以从环境变量获取
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// API请求选项接口
interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  headers?: Record<string, string>
  requireAuth?: boolean  // 是否需要认证，默认为true
}

// 通用API请求函数
// 这个函数会自动添加JWT Token到请求头中
export const apiRequest = async <T = any>(
  endpoint: string, 
  options: ApiRequestOptions = {}
): Promise<T> => {
  const {
    method = 'GET',
    body,
    headers = {},
    requireAuth = true
  } = options

  // 构建请求头
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers
  }

  // 如果需要认证，添加JWT Token到请求头
  if (requireAuth) {
    try {
      // 获取当前会话和JWT Token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('用户未登录或Token已过期')
      }

      // 添加Authorization头，使用Bearer Token格式
      // 这是标准的JWT Token传递格式：Authorization: Bearer <token>
      requestHeaders['Authorization'] = `Bearer ${session.access_token}`
    } catch (error) {
      console.error('获取认证Token失败:', error)
      throw new Error('认证失败，请重新登录')
    }
  }

  // 构建请求URL
  const url = `${API_BASE_URL}${endpoint}`

  try {
    // 发起HTTP请求
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    })

    // 检查响应状态
    if (!response.ok) {
      // 如果是401未授权，可能是Token过期
      if (response.status === 401) {
        throw new Error('认证失败，请重新登录')
      }
      
      // 尝试解析错误消息
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.detail || errorMessage
      } catch {
        // 如果无法解析JSON，使用默认错误消息
      }
      
      throw new Error(errorMessage)
    }

    // 解析响应数据
    const data = await response.json()
    return data
  } catch (error) {
    console.error('API请求失败:', error)
    throw error
  }
}

// 便捷的API请求方法
export const api = {
  // GET请求
  get: <T = any>(endpoint: string, requireAuth = true) =>
    apiRequest<T>(endpoint, { method: 'GET', requireAuth }),

  // POST请求
  post: <T = any>(endpoint: string, data: any, requireAuth = true) =>
    apiRequest<T>(endpoint, { method: 'POST', body: data, requireAuth }),

  // PUT请求
  put: <T = any>(endpoint: string, data: any, requireAuth = true) =>
    apiRequest<T>(endpoint, { method: 'PUT', body: data, requireAuth }),

  // DELETE请求
  delete: <T = any>(endpoint: string, requireAuth = true) =>
    apiRequest<T>(endpoint, { method: 'DELETE', requireAuth }),
}

// 使用示例：
// const userData = await api.get('/api/user/profile')
// const newPost = await api.post('/api/posts', { title: '标题', content: '内容' })
// await api.delete('/api/posts/123')

// 示例：在组件中直接操作数据库
import { supabase } from '@/lib/supabase'

// 插入数据
const insertData = async () => {
  const { data, error } = await supabase
    .from('your_table')
    .insert([
      { user_id: user.id, content: 'some data' }
    ])
}

// 查询数据
const fetchData = async () => {
  const { data, error } = await supabase
    .from('your_table')
    .select('*')
    .eq('user_id', user.id)
} 