import React from 'react';

export default function TestPage() {
  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '600px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>测试页面</h1>
      <p>如果您能看到这个页面，说明基本路由功能正常。</p>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h2>环境变量测试</h2>
        <p>VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL || '未设置'}</p>
        <p>VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '已设置(不显示完整值)' : '未设置'}</p>
        <p>VITE_API_BASE_URL: {import.meta.env.VITE_API_BASE_URL || '未设置'}</p>
      </div>
    </div>
  );
} 