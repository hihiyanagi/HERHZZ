import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Crown, Check, Sparkles, ArrowLeft } from 'lucide-react'
import { 
  SUBSCRIPTION_PLANS, 
  createSubscriptionOrder, 
  getUserMembershipStatus,
  type SubscriptionType,
  type UserMembership 
} from '@/lib/subscription'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'

export default function SubscriptionPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionType | null>(null)
  const [userMembership, setUserMembership] = useState<UserMembership | null>(null)
  const [membershipLoading, setMembershipLoading] = useState(true)

  // 加载用户会员状态
  useEffect(() => {
    loadUserMembership()
  }, [user])

  const loadUserMembership = async () => {
    if (!user) return
    
    try {
      setMembershipLoading(true)
      const membership = await getUserMembershipStatus()
      setUserMembership(membership)
    } catch (error) {
      console.error('加载会员状态失败:', error)
    } finally {
      setMembershipLoading(false)
    }
  }

  // 处理购买订阅
  const handleSubscribe = async (planType: SubscriptionType) => {
    if (!user) {
      toast({
        title: "请先登录",
        description: "订阅服务需要先登录账户",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)
      setSelectedPlan(planType)
      
      // 创建订阅订单并获取支付URL
      const paymentUrl = await createSubscriptionOrder(planType)
      
      // 跳转到支付页面
      window.location.href = paymentUrl
      
    } catch (error) {
      console.error('创建订阅失败:', error)
      toast({
        title: "订阅失败",
        description: error instanceof Error ? error.message : "创建订阅时发生错误，请稍后重试",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
      setSelectedPlan(null)
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* 返回按钮 - 固定在左上角 */}
      <div className="fixed top-6 left-6 z-50">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回主页
        </Button>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 pt-16">
          <h1 className="text-3xl md:text-5xl font-biaoxiao moon-glow mb-4 animate-float tracking-wide">
            <Sparkles className="w-8 h-8 text-yellow-500 inline mr-2" />
            升级会员
          </h1>
          <p className="text-lg text-white/80">
            解锁全部12种专业助眠音频
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <Card key={plan.type} className="relative bg-white/10 backdrop-blur-md border-white/20 flex flex-col h-full">
              {/* 特别标签 */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-3 py-1 rounded-full text-sm font-medium">
                    {plan.badge}
                  </div>
                </div>
              )}
              
                             <CardHeader className="text-center pb-4 flex-grow">
                <CardTitle className="text-xl text-white mb-2">{plan.name}</CardTitle>
                <CardDescription className="text-white/70 mb-3">{plan.description}</CardDescription>
                <div className="text-4xl font-bold text-white mb-3">¥{plan.price}</div>
                
                {/* 诗意描述 */}
                <div className="mb-4">
                  <p className="text-lg text-yellow-300 font-medium italic leading-relaxed">
                    {plan.poeticDescription}
                  </p>
                </div>
                
                {/* 详细描述 */}
                <div className="mb-4">
                  <p className="text-white/80 text-sm leading-relaxed">
                    {plan.detailedDescription}
                  </p>
                </div>
                
                {/* 每日价格（仅年度会员显示） */}
                {plan.pricePerDay && (
                  <div className="mb-4">
                    <p className="text-green-300 text-sm font-medium">
                      {plan.pricePerDay}
                    </p>
                  </div>
                )}
              </CardHeader>
              
              <CardContent>
                <Button
                  onClick={() => handleSubscribe(plan.type)}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3"
                >
                  {isLoading && selectedPlan === plan.type ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    "立即购买"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 