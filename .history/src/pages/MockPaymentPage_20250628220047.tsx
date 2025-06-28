import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, CreditCard, Smartphone, ArrowLeft, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function MockPaymentPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  // 从URL参数获取订单信息
  const orderInfo = {
    out_trade_no: searchParams.get('out_trade_no') || '',
    name: searchParams.get('name') || '商品',
    amount: searchParams.get('amount') || '0',
    type: searchParams.get('type') || 'subscription',
    return_url: searchParams.get('return_url') || '/'
  }

  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'wechat' | 'union'>('alipay')

  // 支付方式选项
  const paymentMethods = [
    {
      value: 'alipay' as const,
      label: '支付宝',
      icon: <Smartphone className="h-5 w-5" />,
      color: 'bg-blue-500'
    },
    {
      value: 'wechat' as const,
      label: '微信支付',
      icon: <CreditCard className="h-5 w-5" />,
      color: 'bg-green-500'
    },
    {
      value: 'union' as const,
      label: '银联支付',
      icon: <CreditCard className="h-5 w-5" />,
      color: 'bg-red-500'
    }
  ]

  // 模拟支付处理
  const handlePayment = async (success: boolean = true) => {
    setIsProcessing(true)
    
    try {
      // 模拟支付过程（3秒后完成）
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      if (success) {
        toast({
          title: "模拟支付成功！",
          description: "正在跳转到支付结果页面...",
          variant: "default"
        })
        
        // 跳转到支付结果页面，模拟支付成功
        const resultUrl = new URL(orderInfo.return_url)
        resultUrl.searchParams.set('success', 'true')
        resultUrl.searchParams.set('out_trade_no', orderInfo.out_trade_no)
        resultUrl.searchParams.set('amount', orderInfo.amount)
        resultUrl.searchParams.set('trade_status', 'TRADE_SUCCESS')
        
        window.location.href = resultUrl.toString()
      } else {
        // 模拟支付失败
        toast({
          title: "模拟支付失败",
          description: "模拟支付失败，请重试",
          variant: "destructive"
        })
        
        // 跳转到支付结果页面，模拟支付失败
        const resultUrl = new URL(orderInfo.return_url)
        resultUrl.searchParams.set('success', 'false')
        resultUrl.searchParams.set('out_trade_no', orderInfo.out_trade_no)
        resultUrl.searchParams.set('error', 'payment_failed')
        
        setTimeout(() => {
          window.location.href = resultUrl.toString()
        }, 2000)
      }
    } catch (error) {
      toast({
        title: "处理失败",
        description: "模拟支付处理失败",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      {/* 内容区域 */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
        </div>

        <div className="max-w-md mx-auto">
          {/* 模拟支付提示 */}
          <Card className="bg-yellow-500/20 border-yellow-500/50 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="font-medium">这是模拟支付页面</p>
                  <p className="text-sm text-yellow-200">用于演示支付流程，不会产生真实费用</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 订单信息 */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white text-center">订单信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-white/80 text-sm">
                  订单号：<span className="text-white font-mono text-xs">{orderInfo.out_trade_no}</span>
                </div>
                <div className="text-white/80 text-sm mt-1">
                  商品：<span className="text-white">{orderInfo.name}</span>
                </div>
                <div className="text-yellow-300 font-bold text-2xl mt-2">
                  ¥{orderInfo.amount}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 支付方式选择 */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white text-center">选择支付方式</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.value}
                    className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      paymentMethod === method.value
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                    onClick={() => setPaymentMethod(method.value)}
                  >
                    <div className={`p-2 rounded-full ${method.color}`}>
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{method.label}</div>
                      <div className="text-white/60 text-sm">模拟{method.label}支付</div>
                    </div>
                    {paymentMethod === method.value && (
                      <CheckCircle className="h-5 w-5 text-blue-400" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 支付按钮 */}
          <div className="space-y-3 mb-6">
            <Button
              onClick={() => handlePayment(true)}
              disabled={isProcessing}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  确认支付 ¥{orderInfo.amount}
                </>
              )}
            </Button>
            
            <Button
              onClick={() => handlePayment(false)}
              disabled={isProcessing}
              variant="outline"
              className="w-full bg-red-600/20 border-red-500 text-red-300 hover:bg-red-600/30"
            >
              <XCircle className="w-4 h-4 mr-2" />
              模拟支付失败
            </Button>
          </div>

          {/* 安全提示 */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="pt-6">
              <div className="text-center text-white/70 text-sm space-y-2">
                <p>• 这是安全的模拟支付环境</p>
                <p>• 不会产生任何真实费用</p>
                <p>• 仅用于功能演示和测试</p>
                <p>• 点击按钮模拟不同的支付结果</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 