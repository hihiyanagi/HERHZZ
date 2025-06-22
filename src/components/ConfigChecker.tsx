import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getSupabaseConfig } from '@/lib/supabase'

export const ConfigChecker: React.FC = () => {
  const config = getSupabaseConfig()
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">⚠️ 配置检查</CardTitle>
            <CardDescription>
              检测到环境变量配置问题，请按照以下步骤解决
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* 当前配置状态 */}
            <div className="bg-white p-4 rounded border">
              <h3 className="font-medium mb-2">当前配置状态:</h3>
              <div className="space-y-1 text-sm">
                <p>🔗 <strong>Supabase URL:</strong> {config.url ? '✅ 已配置' : '❌ 未配置'}</p>
                <p>🔑 <strong>匿名密钥:</strong> {config.hasAnonKey ? '✅ 已配置' : '❌ 未配置'}</p>
                <p>✅ <strong>整体状态:</strong> {config.configured ? '✅ 配置完整' : '❌ 配置不完整'}</p>
              </div>
              
              {config.url && (
                <p className="mt-2 text-xs text-gray-600">
                  <strong>URL:</strong> {config.url}
                </p>
              )}
            </div>

            {/* 修复步骤 */}
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>🔧 修复步骤:</strong></p>
                  
                  <div className="ml-4 space-y-2 text-sm">
                    <p><strong>1. 创建/检查 .env 文件</strong></p>
                    <p className="ml-4 text-gray-600">
                      在项目根目录（与 package.json 同级）创建 .env 文件
                    </p>
                    
                    <p><strong>2. 添加正确的配置</strong></p>
                    <div className="ml-4 bg-gray-100 p-2 rounded text-xs font-mono">
                      <p># 不要使用引号，等号两边不要空格</p>
                      <p>VITE_SUPABASE_URL=https://你的项目id.supabase.co</p>
                      <p>VITE_SUPABASE_ANON_KEY=你的匿名密钥</p>
                    </div>
                    
                    <p><strong>3. 获取配置信息</strong></p>
                    <div className="ml-4 space-y-1 text-xs">
                      <p>• 登录 <a href="https://supabase.com/dashboard" target="_blank" className="text-blue-600 hover:underline">Supabase控制台</a></p>
                      <p>• 选择你的项目</p>
                      <p>• 点击 Settings → API</p>
                      <p>• 复制 Project URL 和 anon public key</p>
                    </div>
                    
                    <p><strong>4. 重启开发服务器</strong></p>
                    <div className="ml-4 bg-gray-100 p-2 rounded text-xs font-mono">
                      <p>按 Ctrl+C 停止服务器</p>
                      <p>然后运行: npm run dev</p>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {/* 常见问题 */}
            <div className="bg-blue-50 p-4 rounded border-blue-200">
              <h3 className="font-medium text-blue-800 mb-2">🐛 常见问题:</h3>
              <div className="space-y-2 text-sm text-blue-700">
                <p><strong>Q: 白屏问题</strong></p>
                <p className="ml-4">A: 通常是 .env 文件格式错误或环境变量缺失导致</p>
                
                <p><strong>Q: 配置后仍然不生效</strong></p>
                <p className="ml-4">A: 需要重启开发服务器 (Ctrl+C 然后 npm run dev)</p>
                
                <p><strong>Q: .env 文件位置</strong></p>
                <p className="ml-4">A: 必须在项目根目录，与 package.json 同级</p>
              </div>
            </div>
            
            {/* 手动刷新按钮 */}
            <div className="text-center pt-4">
              <button 
                onClick={() => window.location.reload()} 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                配置完成后点击刷新
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 