import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './env-test.ts' // 导入环境变量测试

// 测试环境变量是否被正确加载
console.log('主文件环境变量测试:');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY 是否存在:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);

createRoot(document.getElementById("root")!).render(<App />);
