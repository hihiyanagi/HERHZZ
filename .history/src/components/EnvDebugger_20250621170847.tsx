import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const EnvDebugger: React.FC = () => {
  const checkAllEnvVars = () => {
    console.log('🔍 环境变量完整检查:')
    console.log('import.meta.env:', import.meta.env)
    console.log('所有VITE_变量:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')))
    
    // 检查具体的变量
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    console.log('VITE_SUPABASE_URL:', supabaseUrl || '❌ 未定义')
    console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? `✅ 已定义 (${supabaseKey.substring(0, 20)}...)` : '❌ 未定义')
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  return (
    <Card className="border-purple-200 bg-purple-50 mb-4">
      <CardHeader>
        <CardTitle className="text-purple-800">🐛 环境变量调试器</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white p-4 rounded border">
          <h3 className="font-medium mb-2">当前环境变量状态:</h3>
          <div className="space-y-2 text-sm font-mono">
            <div>
              <strong>VITE_SUPABASE_URL:</strong> 
              <span className={supabaseUrl ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
                {supabaseUrl || '❌ 未定义'}
              </span>
            </div>
            <div>
              <strong>VITE_SUPABASE_ANON_KEY:</strong> 
              <span className={supabaseKey ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
                {supabaseKey ? `✅ 已定义 (${supabaseKey.substring(0, 20)}...)` : '❌ 未定义'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Button onClick={checkAllEnvVars} variant="outline" size="sm">
            在控制台查看详细信息
          </Button>
          
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>🔧 如果显示"❌ 未定义"，请检查：</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• .env 文件是否在项目根目录（与package.json同级）</li>
              <li>• 文件名是否正确（.env，不是.env.txt）</li>
              <li>• 变量名是否以 VITE_ 开头</li>
              <li>• 等号两边是否没有空格</li>
              <li>• 是否重启了开发服务器</li>
            </ul>
          </div>
        </div>

        <div className="bg-yellow-50 p-3 rounded border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>💡 提示:</strong> 点击上面的按钮，然后按 F12 查看控制台输出获取更详细的调试信息
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 