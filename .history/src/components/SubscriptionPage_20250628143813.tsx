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
import QRCodePayment from '@/components/QRCodePayment'

export default function SubscriptionPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'select' | 'payment'>('select')
  const [selectedPlan, setSelectedPlan] = useState<typeof SUBSCRIPTION_PLANS[0] | null>(null)
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
  const handleSubscribe = (plan: typeof SUBSCRIPTION_PLANS[0]) => {
    if (!user) {
      toast({
        title: "请先登录",
        description: "订阅服务需要先登录账户",
        variant: "destructive"
      })
      return
    }

    // 设置选中的套餐并切换到支付界面
    setSelectedPlan(plan)
    setStep('payment')
  }

  // 返回套餐选择
  const handleBackToSelection = () => {
    setStep('select')
    setSelectedPlan(null)
  }

  // 支付成功回调
  const handlePaymentSuccess = (orderInfo: any) => {
    console.log('支付成功:', orderInfo)
    toast({
      title: "支付成功！",
      description: "会员权限正在激活中...",
    })
    
    // 重新加载用户会员状态
    loadUserMembership()
    
    // 可以跳转到结果页面或者重置状态
    setTimeout(() => {
      setStep('select')
      setSelectedPlan(null)
    }, 2000)
  }

  // 支付失败回调
  const handlePaymentError = (error: string) => {
    console.error('支付失败:', error)
    toast({
      title: "支付失败",
      description: error,
      variant: "destructive"
    })
  }

  // 取消支付
  const handlePaymentCancel = () => {
    setStep('select')
    setSelectedPlan(null)
  }

  // 渲染套餐选择界面
  const renderPlanSelection = () => (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8 pt-16">
        <h1 className="text-3xl md:text-5xl font-biaoxiao moon-glow mb-4 animate-float tracking-wide">
          <Sparkles className="w-8 h-8 text-yellow-500 inline mr-2" />
          升级会员
        </h1>
        <p className="text-lg text-white/80">
          解锁全周期专属的梦境白噪音
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
              <div className="text-4xl font-bold text-yellow-300 mb-3">¥{plan.price}</div>
              
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
            
            <CardContent className="flex-shrink-0">
              <Button
                onClick={() => handleSubscribe(plan)}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3"
              >
                {isLoading && selectedPlan?.type === plan.type ? (
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
  )

  // 使用现有订阅系统创建订单
  const handleCreateSubscriptionOrder = async () => {
    if (!selectedPlan) return

    try {
      setIsLoading(true)
      
      // 使用现有的订阅系统创建订单
      const paymentUrl = await createSubscriptionOrder(selectedPlan.type)
      
      // 显示支付链接或打开新窗口
      if (paymentUrl) {
        // 你可以选择在新窗口打开，或者显示链接
        const userChoice = window.confirm(
          `订单创建成功！\n\n点击"确定"在新窗口打开支付页面\n点击"取消"复制支付链接到剪贴板`
        )
        
        if (userChoice) {
          window.open(paymentUrl, '_blank')
        } else {
          navigator.clipboard.writeText(paymentUrl)
          toast({
            title: "支付链接已复制",
            description: "支付链接已复制到剪贴板，你可以在浏览器中打开进行支付"
          })
        }
      }
      
    } catch (error) {
      console.error('创建订阅订单失败:', error)
      toast({
        title: "创建订单失败",
        description: error instanceof Error ? error.message : "创建订单时发生错误，请稍后重试",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 渲染支付界面
  const renderPaymentPage = () => (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8 pt-16">
        <h1 className="text-2xl font-bold text-white mb-2">
          购买 {selectedPlan?.name}
        </h1>
        <p className="text-white/80">
          确认购买信息
        </p>
      </div>

      {selectedPlan && (
        <div className="max-w-md mx-auto">
          {/* 订单摘要 */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white">订单摘要</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/80">商品名称：</span>
                  <span className="text-white font-medium">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">价格：</span>
                  <span className="text-yellow-300 font-bold text-lg">¥{selectedPlan.price}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">时长：</span>
                  <span className="text-white">
                    {selectedPlan.duration_days === null ? '永久' : `${selectedPlan.duration_days}天`}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-white/20">
                <Button
                  onClick={handleCreateSubscriptionOrder}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      创建订单中...
                    </>
                  ) : (
                    "确认购买"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* 提示信息 */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="pt-6">
              <div className="text-center text-white/70 text-sm space-y-2">
                <p>• 点击"确认购买"后将跳转到支付页面</p>
                <p>• 支持支付宝、微信等多种支付方式</p>
                <p>• 支付完成后会员权限将自动激活</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen relative">
      {/* 返回按钮 - 固定在左上角 */}
      <div className="fixed top-6 left-6 z-50">
        <Button
          variant="outline"
          onClick={step === 'payment' ? handleBackToSelection : () => navigate('/')}
          className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {step === 'payment' ? '返回选择套餐' : '返回主页'}
        </Button>
      </div>

      {step === 'select' ? renderPlanSelection() : renderPaymentPage()}
    </div>
  )
} 