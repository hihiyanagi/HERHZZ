import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

// 用户仪表板组件 - 登录后的主要页面
export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* 顶部导航栏 */}
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">我的应用</h1>
            <p className="text-gray-600">欢迎回来，{user?.email}</p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            登出
          </Button>
        </header>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* 用户信息卡片 */}
          <Card>
            <CardHeader>
              <CardTitle>👤 用户信息</CardTitle>
              <CardDescription>您的账户详情</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>邮箱:</strong> {user?.email}</p>
                <p><strong>用户ID:</strong> {user?.id}</p>
                <p><strong>注册时间:</strong> {new Date(user?.created_at || '').toLocaleDateString('zh-CN')}</p>
              </div>
            </CardContent>
          </Card>

          {/* 功能模块1 */}
          <Card>
            <CardHeader>
              <CardTitle>📊 数据统计</CardTitle>
              <CardDescription>查看您的数据概览</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>总项目数:</span>
                  <span className="font-bold">5</span>
                </div>
                <div className="flex justify-between">
                  <span>完成任务:</span>
                  <span className="font-bold text-green-600">12</span>
                </div>
                <div className="flex justify-between">
                  <span>待办事项:</span>
                  <span className="font-bold text-orange-600">3</span>
                </div>
                <Button className="w-full" variant="outline">
                  查看详情
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 功能模块2 */}
          <Card>
            <CardHeader>
              <CardTitle>⚡ 快速操作</CardTitle>
              <CardDescription>常用功能快捷入口</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  📝 新建项目
                </Button>
                <Button className="w-full" variant="outline">
                  📋 任务管理
                </Button>
                <Button className="w-full" variant="outline">
                  📈 数据分析
                </Button>
                <Button className="w-full" variant="outline">
                  ⚙️ 设置
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 最近活动 */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>🕒 最近活动</CardTitle>
              <CardDescription>您的最新操作记录</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">登录成功</p>
                    <p className="text-sm text-gray-600">刚刚</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">完成认证设置</p>
                    <p className="text-sm text-gray-600">今天 下午2:30</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">账户创建成功</p>
                    <p className="text-sm text-gray-600">今天 下午2:00</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* 底部信息 */}
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>🎉 恭喜！您的 Supabase 认证系统已完美运行</p>
          <p>现在可以开始构建您的应用功能了</p>
        </footer>
        
      </div>
    </div>
  )
} 