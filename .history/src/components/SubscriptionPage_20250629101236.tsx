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
  checkOrderPaymentStatus,
  type SubscriptionType,
  type UserMembership 
} from '@/lib/subscription'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'
import QRCode from 'qrcode'

export default function SubscriptionPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'select' | 'payment' | 'qrcode'>('select')
  const [selectedPlan, setSelectedPlan] = useState<typeof SUBSCRIPTION_PLANS[0] | null>(null)
  const [userMembership, setUserMembership] = useState<UserMembership | null>(null)
  const [membershipLoading, setMembershipLoading] = useState(true)
  const [qrCodeData, setQRCodeData] = useState<any>(null)
  const [qrCodeImage, setQRCodeImage] = useState<string | null>(null)

  // 生成二维码图片
  const generateQRCodeImage = async (url: string): Promise<string | null> => {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      return qrCodeDataURL
    } catch (error) {
      toast({
        title: "二维码生成失败",
        description: "无法生成支付二维码，请刷新页面重试",
        variant: "destructive"
      })
      return null
    }
  }

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

    setSelectedPlan(plan)
    setStep('payment')
  }

  // 返回套餐选择
  const handleBackToSelection = () => {
    setStep('select')
    setSelectedPlan(null)
    setQRCodeData(null)
    setQRCodeImage(null)
  }

  // 检查支付状态
  const handleCheckPaymentStatus = async () => {
    if (!qrCodeData?.out_trade_no) {
      toast({
        title: "检查失败",
        description: "订单信息不完整",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)
      
      const result = await checkOrderPaymentStatus(qrCodeData.out_trade_no)
      
      if (result.status === 'paid') {
        toast({
          title: "支付成功！",
          description: "恭喜您成功开通会员，正在跳转..."
        })
        
        await loadUserMembership()
        
        setTimeout(() => {
          navigate('/')
        }, 2000)
      } else if (result.status === 'pending') {
        toast({
          title: "支付未完成",
          description: "请确认已完成支付后再次检查",
          variant: "default"
        })
      } else {
        toast({
          title: "支付异常",
          description: `订单状态：${result.status}，请联系客服`,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "检查失败",
        description: error instanceof Error ? error.message : "检查支付状态时发生错误",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
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
      
      const paymentUrl = await createSubscriptionOrder(selectedPlan.type)
      
      if (paymentUrl) {
        try {
          const qrData = JSON.parse(paymentUrl)
          if (qrData.type === 'qr_code') {
            toast({
              title: "订单创建成功！",
              description: "请使用支付宝扫描二维码完成支付"
            })
            
            const qrCodeImage = await generateQRCodeImage(qrData.qr_code)
            if (qrCodeImage) {
              setQRCodeImage(qrCodeImage)
            }
            
            setStep('qrcode')
            setQRCodeData(qrData)
          } else {
            throw new Error('返回数据格式错误')
          }
        } catch (error) {
          toast({
            title: "二维码生成失败",
            description: "请稍后重试或联系客服",
            variant: "destructive"
          })
        }
      } else {
        toast({
          title: "创建订单失败",
          description: "二维码生成失败，请检查ZPay配置",
          variant: "destructive"
        })
      }
      
    } catch (error) {
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
                <p>• 仅支持支付宝二维码支付</p>
                <p>• 点击"确认购买"后将生成支付二维码</p>
                <p>• 使用支付宝扫描二维码完成支付</p>
                <p>• 支付完成后手动检查状态激活会员</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )

  // 渲染二维码支付界面
  const renderQRCodePage = () => (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8 pt-16">
        <h1 className="text-2xl font-bold text-white mb-2">
          扫码支付 - {selectedPlan?.name}
        </h1>
        <p className="text-white/80">
          请使用支付宝扫描下方二维码完成支付
        </p>
      </div>

      {qrCodeData && (
        <div className="max-w-md mx-auto">
          {/* 订单信息卡片 */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white text-center">订单信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-center">
                <div className="text-white/80">
                  订单号：<span className="text-white font-mono text-sm">{qrCodeData.out_trade_no}</span>
                </div>
                <div className="text-white/80">
                  商品：<span className="text-white font-medium">{qrCodeData.name}</span>
                </div>
                <div className="text-yellow-300 font-bold text-2xl">
                  ¥{qrCodeData.amount}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 二维码显示卡片 */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white text-center">支付二维码</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-white p-4 rounded-lg mx-auto w-fit mb-4">
                {qrCodeImage ? (
                  <img 
                    src={qrCodeImage} 
                    alt="支付二维码" 
                    className="w-48 h-48 mx-auto"
                  />
                ) : (
                  <div className="w-48 h-48 mx-auto flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-500" />
                      <p className="text-gray-500 text-sm">生成二维码中...</p>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-white/70 text-sm">
                使用支付宝扫描二维码完成支付
              </p>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={handleBackToSelection}
              className="w-full bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              返回重新选择
            </Button>
          </div>

          {/* 提示信息 */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10 mt-6">
            <CardContent className="pt-6">
              <div className="text-center text-white/70 text-sm space-y-2">
                <p>• 请确保使用支付宝扫描二维码</p>
                <p>• 支付完成后点击"检查状态"确认</p>
                <p>• 二维码有效期为15分钟</p>
                <p>• 如有问题请联系客服</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )

  // 根据当前步骤渲染不同的界面
  const renderCurrentStep = () => {
    switch (step) {
      case 'select':
        return renderPlanSelection()
      case 'payment':
        return renderPaymentPage()
      case 'qrcode':
        return renderQRCodePage()
      default:
        return renderPlanSelection()
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* 返回按钮 - 固定在左上角 */}
      <div className="fixed top-6 left-6 z-50">
        <Button
          variant="outline"
          onClick={() => {
            if (step === 'qrcode') {
              setStep('payment')
            } else if (step === 'payment') {
              handleBackToSelection()
            } else {
              navigate('/')
            }
          }}
          className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {step === 'qrcode' ? '返回支付页面' : step === 'payment' ? '返回选择套餐' : '返回主页'}
        </Button>
      </div>

      {renderCurrentStep()}
    </div>
  )
} 