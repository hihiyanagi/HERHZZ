import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  CheckCircle, 
  Loader2, 
  RefreshCw,
  AlertCircle,
  Copy,
  QrCode
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'

// 订单状态类型
type OrderStatus = 'pending' | 'paid' | 'failed' | 'cancelled'

// 订单信息接口
interface OrderInfo {
  out_trade_no: string
  status: OrderStatus
  name: string
  amount: number
  payment_type: string
  qr_code?: string
  pay_url?: string
  created_at: string
  paid_at?: string
}

// 创建订单请求接口
interface CreateOrderRequest {
  name: string
  amount: number
  payment_type: 'alipay' | 'wechat' | 'union'
  user_id: string
}

// 组件属性接口
interface QRCodePaymentProps {
  // 商品信息
  productName: string
  amount: number
  paymentType?: 'alipay' | 'wechat' | 'union'
  
  // 回调函数
  onPaymentSuccess?: (orderInfo: OrderInfo) => void
  onPaymentError?: (error: string) => void
  onCancel?: () => void
  
  // 配置选项
  autoCreateOrder?: boolean // 是否自动创建订单
  pollInterval?: number     // 轮询间隔（毫秒），默认5秒
  maxPollTime?: number      // 最大轮询时间（毫秒），默认10分钟
}

export default function QRCodePayment({
  productName,
  amount,
  paymentType = 'alipay',
  onPaymentSuccess,
  onPaymentError,
  onCancel,
  autoCreateOrder = true,
  pollInterval = 5000,
  maxPollTime = 600000 // 10分钟
}: QRCodePaymentProps) {
  const navigate = useNavigate()
  const { user, getAccessToken } = useAuth()
  
  // 组件状态
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [remainingTime, setRemainingTime] = useState(maxPollTime)
  
  // 轮询相关的 ref
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollStartTimeRef = useRef<number | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // 后端 API 基础 URL - 根据你的实际后端地址调整
  const API_BASE_URL = 'http://localhost:8000'

  // 清理所有定时器
  const cleanupTimers = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
  }

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      cleanupTimers()
    }
  }, [])

  // 自动创建订单
  useEffect(() => {
    if (autoCreateOrder && user && !orderInfo && !isCreatingOrder) {
      createOrder()
    }
  }, [autoCreateOrder, user])

  // 创建订单
  const createOrder = async () => {
    if (!user) {
      setError('用户未登录，请先登录')
      return
    }

    setIsCreatingOrder(true)
    setError(null)

    try {
      const token = await getAccessToken()
      
      const orderRequest: CreateOrderRequest = {
        name: productName,
        amount: amount,
        payment_type: paymentType,
        user_id: user.id
      }

      const response = await fetch(`${API_BASE_URL}/api/create_order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderRequest)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || '创建订单失败')
      }

      const result = await response.json()
      
      const newOrderInfo: OrderInfo = {
        out_trade_no: result.out_trade_no,
        status: result.status,
        name: productName,
        amount: amount,
        payment_type: paymentType,
        qr_code: result.qrcode,
        pay_url: result.payurl,
        created_at: new Date().toISOString(),
      }

      setOrderInfo(newOrderInfo)
      
      // 开始轮询订单状态
      startPolling(result.out_trade_no)
      
      toast({
        title: "订单创建成功",
        description: `订单号：${result.out_trade_no}`
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建订单失败'
      setError(errorMessage)
      onPaymentError?.(errorMessage)
      
      toast({
        title: "创建订单失败",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsCreatingOrder(false)
    }
  }

  // 开始轮询订单状态
  const startPolling = (outTradeNo: string) => {
    setIsPolling(true)
    pollStartTimeRef.current = Date.now()
    setRemainingTime(maxPollTime)

    // 开始倒计时
    countdownIntervalRef.current = setInterval(() => {
      if (pollStartTimeRef.current) {
        const elapsed = Date.now() - pollStartTimeRef.current
        const remaining = Math.max(0, maxPollTime - elapsed)
        setRemainingTime(remaining)
        
        if (remaining === 0) {
          stopPolling()
          setError('支付超时，请重新创建订单')
        }
      }
    }, 1000)

    // 轮询订单状态
    pollIntervalRef.current = setInterval(async () => {
      await checkOrderStatus(outTradeNo)
    }, pollInterval)

    // 立即检查一次
    checkOrderStatus(outTradeNo)
  }

  // 停止轮询
  const stopPolling = () => {
    setIsPolling(false)
    cleanupTimers()
    pollStartTimeRef.current = null
  }

  // 检查订单状态
  const checkOrderStatus = async (outTradeNo: string) => {
    try {
      const token = await getAccessToken()
      
      const response = await fetch(`${API_BASE_URL}/api/get_order_status/${outTradeNo}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        console.error('查询订单状态失败:', response.status)
        return
      }

      const orderData = await response.json()
      
      // 更新订单信息
      setOrderInfo(prev => prev ? { ...prev, ...orderData } : orderData)

      // 检查支付状态
      if (orderData.status === 'paid') {
        stopPolling()
        setShowSuccessDialog(true)
        onPaymentSuccess?.(orderData)
        
        toast({
          title: "支付成功！",
          description: "订单已完成支付",
        })
      } else if (orderData.status === 'failed') {
        stopPolling()
        setError('支付失败，请重新尝试')
        onPaymentError?.('支付失败')
      }

    } catch (error) {
      console.error('查询订单状态出错:', error)
    }
  }

  // 手动刷新订单状态
  const handleRefreshStatus = () => {
    if (orderInfo?.out_trade_no) {
      checkOrderStatus(orderInfo.out_trade_no)
    }
  }

  // 复制订单号
  const copyOrderNumber = () => {
    if (orderInfo?.out_trade_no) {
      navigator.clipboard.writeText(orderInfo.out_trade_no)
      toast({
        title: "已复制",
        description: "订单号已复制到剪贴板"
      })
    }
  }

  // 取消支付
  const handleCancel = () => {
    stopPolling()
    onCancel?.()
  }

  // 支付成功后跳转
  const handleSuccessConfirm = () => {
    setShowSuccessDialog(false)
    navigate('/payment-result', {
      state: {
        success: true,
        orderInfo: orderInfo
      }
    })
  }

  // 格式化倒计时时间
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // 渲染加载状态
  if (isCreatingOrder) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-600">正在创建订单...</p>
        </CardContent>
      </Card>
    )
  }

  // 渲染错误状态
  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex gap-2 mt-4">
            <Button onClick={createOrder} className="flex-1">
              重新创建订单
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              取消
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 渲染支付界面
  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <QrCode className="h-5 w-5" />
            扫码支付
          </CardTitle>
          <CardDescription>
            请使用{paymentType === 'alipay' ? '支付宝' : paymentType === 'wechat' ? '微信' : '银联'}扫描下方二维码完成支付
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 订单信息 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">订单信息</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">商品名称：</span>
                <span className="font-medium">{productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">支付金额：</span>
                <span className="font-bold text-red-600">¥{amount.toFixed(2)}</span>
              </div>
              {orderInfo && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">订单号：</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs">{orderInfo.out_trade_no}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={copyOrderNumber}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 二维码 */}
          {orderInfo?.qr_code ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <QRCode
                  value={orderInfo.qr_code}
                  size={200}
                  level="M"
                  includeMargin={true}
                />
              </div>
              
              {/* 支付状态 */}
              <div className="text-center">
                {isPolling ? (
                  <div className="flex items-center justify-center gap-2 text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">等待支付中...</span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">请扫描二维码完成支付</p>
                )}
                
                {/* 倒计时 */}
                {isPolling && remainingTime > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    剩余时间：{formatTime(remainingTime)}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-8">
              <p className="text-gray-500 mb-4">正在生成二维码...</p>
              <Button onClick={createOrder} disabled={isCreatingOrder}>
                重新生成
              </Button>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefreshStatus}
              disabled={!orderInfo}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新状态
            </Button>
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              取消支付
            </Button>
          </div>

          {/* 支付说明 */}
          <Alert>
            <AlertDescription className="text-xs">
              • 请在 {Math.floor(maxPollTime / 60000)} 分钟内完成支付<br/>
              • 支付完成后页面会自动刷新<br/>
              • 如果支付后页面未自动跳转，请点击"刷新状态"按钮
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* 支付成功弹窗 */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <DialogTitle className="text-center">支付成功！</DialogTitle>
            <DialogDescription className="text-center">
              恭喜您，订单支付已完成
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-gray-50 rounded-lg p-4 my-4">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">订单号：</span>
                <span className="font-mono">{orderInfo?.out_trade_no}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">支付金额：</span>
                <span className="font-bold text-green-600">¥{orderInfo?.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">支付时间：</span>
                <span>{orderInfo?.paid_at ? new Date(orderInfo.paid_at).toLocaleString() : '刚刚'}</span>
              </div>
            </div>
          </div>

          <Button onClick={handleSuccessConfirm} className="w-full">
            确认
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
} 