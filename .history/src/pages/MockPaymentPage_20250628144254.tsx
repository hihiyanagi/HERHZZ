import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  CreditCard, 
  Smartphone, 
  QrCode,
  ArrowLeft,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function MockPaymentPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'wechat' | 'union'>('alipay')
  const [isProcessing, setIsProcessing] = useState(false)
  const [countdown, setCountdown] = useState(10)

  // 从URL参数获取订单信息
  const outTradeNo = searchParams.get('out_trade_no') || ''
  const productName = searchParams.get('name') || ''
  const amount = parseFloat(searchParams.get('amount') || '0')
  const subscriptionType = searchParams.get('type') || ''
  const returnUrl = searchParams.get('return_url') || window.location.origin

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
      label: '银联云闪付',
      icon: <QrCode className="h-5 w-5" />,
      color: 'bg-red-500'
    }
  ]

  // 模拟支付处理
  const handlePayment = () => {
    setIsProcessing(true)
    
    // 模拟支付过程（3秒后完成）
    setTimeout(() => {
      setIsProcessing(false)
      
      // 显示成功提示
      toast({
        title: "支付成功！",
        description: "订单已完成支付，正在跳转..."
      })
      
      // 跳转到支付结果页面，模拟支付成功
      setTimeout(() => {
        const resultParams = new URLSearchParams({
          trade_status: 'TRADE_SUCCESS',
          out_trade_no: outTradeNo,
          trade_no: `mock_${Date.now()}`,
          money: amount.toString(),
          name: productName
        })
        
        navigate(`/payment-result?${resultParams.toString()}`)
      }, 1500)
    }, 3000)
  }

  // 模拟支付失败
  const handlePaymentFail = () => {
    toast({
      title: "支付失败",
      description: "模拟支付失败，请重试",
      variant: "destructive"
    })
    
    // 跳转到支付结果页面，模拟支付失败
    setTimeout(() => {
      const resultParams = new URLSearchParams({
        trade_status: 'TRADE_FAILED',
        out_trade_no: outTradeNo,
        money: amount.toString(),
        name: productName
      })
      
      navigate(`/payment-result?${resultParams.toString()}`)
    }, 1000)
  }

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        
        {/* 返回按钮 */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>

        {/* 模拟支付提示 */}
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">这是模拟支付页面</p>
                <p>用于演示支付流程，不会产生真实费用</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 订单信息 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              订单信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">订单号：</span>
                <span className="font-mono text-sm">{outTradeNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">商品名称：</span>
                <span className="font-medium">{productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">订阅类型：</span>
                <Badge variant="outline">
                  {subscriptionType === 'monthly_3' ? '季度会员' : 
                   subscriptionType === 'yearly' ? '年度会员' : 
                   subscriptionType === 'lifetime' ? '终身会员' : subscriptionType}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span>支付金额：</span>
                <span className="text-red-600">¥{amount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 支付方式选择 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>选择支付方式</CardTitle>
            <CardDescription>请选择您的支付方式</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.value}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    paymentMethod === method.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod(method.value)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full text-white ${method.color}`}>
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{method.label}</div>
                      <div className="text-sm text-gray-500">
                        使用{method.label}完成支付
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      paymentMethod === method.value
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {paymentMethod === method.value && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 支付操作 */}
        <Card>
          <CardContent className="pt-6">
            {!isProcessing ? (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Button 
                    onClick={handlePayment}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    确认支付 ¥{amount.toFixed(2)}
                  </Button>
                  <Button 
                    onClick={handlePaymentFail}
                    variant="outline"
                    size="lg"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    模拟失败
                  </Button>
                </div>
                
                <div className="text-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 inline mr-1" />
                  请在15分钟内完成支付
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <div className="text-lg font-medium mb-2">支付处理中...</div>
                <div className="text-gray-500">请稍候，正在确认您的支付</div>
                <div className="mt-4 text-sm text-gray-400">
                  预计还需 {Math.max(1, 3 - Math.floor((Date.now() % 10000) / 1000))} 秒
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 安全提示 */}
        <div className="mt-6 text-center text-xs text-gray-500 space-y-1">
          <p>• 这是安全的模拟支付环境</p>
          <p>• 您的个人信息和资金安全得到保护</p>
          <p>• 支付完成后会员权限将立即生效</p>
        </div>
      </div>
    </div>
  )
} 