// 测试环境变量是否被正确加载
console.log('环境变量测试:');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '已设置(不显示完整值)' : '未设置');
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);

// 导出一个空函数，避免导入错误
export function testEnv() {
  return {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
    hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || ''
  };
} 