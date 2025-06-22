// API配置 - 修改为完全使用 Supabase
// const API_BASE_URL = 'http://localhost:8000' // 暂时注释掉后端URL

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
  // 这个函数现在主要用于兼容性，实际应用中我们直接使用 Supabase 客户端
  throw new Error('请直接使用 Supabase 客户端进行数据操作')
}

// 便捷的API请求方法 - 保留接口但不实际使用
export const api = {
  get: <T = any>(endpoint: string, requireAuth = true) => {
    console.warn('建议直接使用 Supabase 客户端')
    return Promise.reject('请直接使用 Supabase 客户端')
  },
  post: <T = any>(endpoint: string, data: any, requireAuth = true) => {
    console.warn('建议直接使用 Supabase 客户端')
    return Promise.reject('请直接使用 Supabase 客户端')
  },
  put: <T = any>(endpoint: string, data: any, requireAuth = true) => {
    console.warn('建议直接使用 Supabase 客户端')
    return Promise.reject('请直接使用 Supabase 客户端')
  },
  delete: <T = any>(endpoint: string, requireAuth = true) => {
    console.warn('建议直接使用 Supabase 客户端')
    return Promise.reject('请直接使用 Supabase 客户端')
  },
}

// 使用示例：
// const userData = await api.get('/api/user/profile')
// const newPost = await api.post('/api/posts', { title: '标题', content: '内容' })
// await api.delete('/api/posts/123')

// 示例：在组件中直接操作数据库
// import { supabase } from '@/lib/supabase'
// import { useAuth } from '@/hooks/useAuth'

// 插入数据示例
// const insertData = async (userId: string) => {
//   const { data, error } = await supabase
//     .from('your_table')
//     .insert([
//       { user_id: userId, content: 'some data' }
//     ])
// }

// 查询数据示例
// const fetchData = async (userId: string) => {
//   const { data, error } = await supabase
//     .from('your_table')
//     .select('*')
//     .eq('user_id', userId)
// } 