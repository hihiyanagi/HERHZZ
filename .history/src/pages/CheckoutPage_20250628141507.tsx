import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCodePayment from '@/components/QRCodePayment'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CreditCard, Smartphone, Banknote } from 'lucide-react'

// 支付方式选项
const paymentMethods = [
  {
    value: 'alipay' as const,
    label: '支付宝',
    icon: <Smartphone className="h-4 w-4" />,
    description: '使用支付宝扫码支付'
  },
  {
    value: 'wechat' as const,
    label: '微信支付',
    icon: <CreditCard className="h-4 w-4" />,
    description: '使用微信扫码支付'
  },
  {
    value: 'union' as const,
    label: '银联支付',
    icon: <Banknote className="h-4 w-4" />,
    description: '使用银联云闪付'
  }
]

// 示例商品
const sampleProducts = [
  {
    id: '1',
    name: 'HERHZZZ 月度会员',
    price: 9.9,
    originalPrice: 19.9,
    description: '享受1个月的高级会员权限',
    features: ['无限制音频播放', '高品质音频', '离线下载', '专属客服']
  },
  {
    id: '2',
    name: 'HERHZZZ 季度会员',
    price: 25.8,
    originalPrice: 59.7,
    description: '享受3个月的高级会员权限',
    features: ['无限制音频播放', '高品质音频', '离线下载', '专属客服', '会员专享内容']
  },
  {
    id: '3',
    name: 'HERHZZZ 年度会员',
    price: 88.8,
    originalPrice: 238.8,
    description: '享受12个月的高级会员权限',
    features: ['无限制音频播放', '高品质音频', '离线下载', '专属客服', '会员专享内容', '生日礼包']
  }
]

export default function CheckoutPage() {
  const navigate = useNavigate()
  
  // 页面状态
  const [step, setStep] = useState<'product' | 'payment'>('product')
  const [selectedProduct, setSelectedProduct] = useState(sampleProducts[0])
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'wechat' | 'union'>('alipay')

  // 返回上一步
  const handleBack = () => {
    if (step === 'payment') {
      setStep('product')
    } else {
      navigate(-1)
    }
  }

  // 选择商品并进入支付页面
  const handleSelectProduct = (product: typeof sampleProducts[0]) => {
    setSelectedProduct(product)
    setStep('payment')
  }

  // 支付成功回调
  const handlePaymentSuccess = (orderInfo: any) => {
    console.log('支付成功:', orderInfo)
    // 这里可以进行支付成功后的处理，比如更新用户会员状态
  }

  // 支付错误回调
  const handlePaymentError = (error: string) => {
    console.error('支付失败:', error)
    // 这里可以进行错误处理，比如显示错误信息
  }

  // 取消支付
  const handlePaymentCancel = () => {
    setStep('product')
  }

  // 渲染商品选择页面
  const renderProductSelection = () => (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">选择会员套餐</h1>
        <p className="text-gray-600">选择最适合您的会员套餐，立即享受高级功能</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {sampleProducts.map((product) => (
          <Card 
            key={product.id} 
            className={`relative cursor-pointer transition-all hover:shadow-lg ${
              product.id === '2' ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleSelectProduct(product)}
          >
            {product.id === '2' && (
              <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-500">
                推荐
              </Badge>
            )}
            
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{product.name}</CardTitle>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-bold text-red-600">
                    ¥{product.price}
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    ¥{product.originalPrice}
                  </span>
                </div>
                <div className="text-sm text-green-600">
                  节省 ¥{(product.originalPrice - product.price).toFixed(1)}
                </div>
              </div>
              <CardDescription>{product.description}</CardDescription>
            </CardHeader>

            <CardContent>
              <ul className="space-y-2 mb-6">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button className="w-full">
                选择此套餐
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>• 所有套餐均可随时取消</p>
        <p>• 支持支付宝、微信、银联多种支付方式</p>
        <p>• 购买即可立即享受会员权限</p>
      </div>
    </div>
  )

  // 渲染支付页面
  const renderPaymentPage = () => (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回选择套餐
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">确认订单</h1>
        <p className="text-gray-600">请确认您的订单信息并选择支付方式</p>
      </div>

      {/* 订单摘要 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>订单摘要</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-medium">{selectedProduct.name}</h3>
              <p className="text-sm text-gray-600">{selectedProduct.description}</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-red-600">¥{selectedProduct.price}</div>
              <div className="text-sm text-gray-500 line-through">¥{selectedProduct.originalPrice}</div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>支付总额：</span>
              <span className="text-red-600">¥{selectedProduct.price}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 支付方式选择 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>选择支付方式</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(value: 'alipay' | 'wechat' | 'union') => setPaymentMethod(value)}
            className="space-y-3"
          >
            {paymentMethods.map((method) => (
              <div key={method.value} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50">
                <RadioGroupItem value={method.value} id={method.value} />
                <Label htmlFor={method.value} className="flex-1 flex items-center gap-3 cursor-pointer">
                  {method.icon}
                  <div>
                    <div className="font-medium">{method.label}</div>
                    <div className="text-sm text-gray-500">{method.description}</div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* 二维码支付组件 */}
      <QRCodePayment
        productName={selectedProduct.name}
        amount={selectedProduct.price}
        paymentType={paymentMethod}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
        onCancel={handlePaymentCancel}
        autoCreateOrder={true}
        pollInterval={5000}
        maxPollTime={600000}
      />
    </div>
  )

  // 根据当前步骤渲染对应页面
  return (
    <div className="min-h-screen bg-gray-50">
      {step === 'product' ? renderProductSelection() : renderPaymentPage()}
    </div>
  )
} 