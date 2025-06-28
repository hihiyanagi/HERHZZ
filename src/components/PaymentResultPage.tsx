import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Crown, 
  ArrowRight,
  Home,
  Loader2 
} from 'lucide-react'
import { 
  getUserMembershipStatus,
  checkUserMembershipValid,
  type UserMembership 
} from '@/lib/subscription'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [isLoading, setIsLoading] = useState(true)
  const [membershipStatus, setMembershipStatus] = useState<UserMembership | null>(null)
  const [isVipUser, setIsVipUser] = useState(false)

  // 从URL参数获取支付结果信息
  const tradeStatus = searchParams.get('trade_status')
  const outTradeNo = searchParams.get('out_trade_no')
  const tradeNo = searchParams.get('trade_no')
  const money = searchParams.get('money')
  const name = searchParams.get('name')

  useEffect(() => {
    // 延迟加载会员状态，给支付回调处理一些时间
    const timer = setTimeout(() => {
      loadMembershipStatus()
    }, 2000) // 等待2秒后检查会员状态

    return () => clearTimeout(timer)
  }, [user])

  const loadMembershipStatus = async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      
      // 获取会员状态
      const membership = await getUserMembershipStatus()
      setMembershipStatus(membership)
      
      // 检查是否是VIP
      const vipStatus = await checkUserMembershipValid()
      setIsVipUser(vipStatus)
      
    } catch (error) {
      console.error('加载会员状态失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 获取支付状态
  const getPaymentStatus = () => {
    if (tradeStatus === 'TRADE_SUCCESS') {
      return 'success'
    } else if (tradeStatus === 'TRADE_CLOSED' || tradeStatus === 'TRADE_FINISHED') {
      return 'failed'
    } else {
      return 'pending'
    }
  }

  const paymentStatus = getPaymentStatus()

  // 渲染支付状态图标
  const renderStatusIcon = () => {
    switch (paymentStatus) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
      case 'failed':
        return <XCircle className="w-16 h-16 text-red-500 mx-auto" />
      default:
        return <Clock className="w-16 h-16 text-yellow-500 mx-auto" />
    }
  }

  // 渲染状态标题
  const renderStatusTitle = () => {
    switch (paymentStatus) {
      case 'success':
        return '支付成功！'
      case 'failed':
        return '支付失败'
      default:
        return '支付处理中'
    }
  }

  // 渲染状态描述
  const renderStatusDescription = () => {
    switch (paymentStatus) {
      case 'success':
        return '恭喜您，订阅支付已完成，会员权限正在激活中...'
      case 'failed':
        return '很抱歉，支付未能完成，您可以重新尝试支付'
      default:
        return '支付正在处理中，请稍候...'
    }
  }

  // 格式化会员到期时间
  const formatMembershipExpiry = (membership: UserMembership) => {
    if (membership.is_lifetime_member) {
      return '终身有效'
    }
    if (membership.membership_expires_at) {
      const expiryDate = new Date(membership.membership_expires_at)
      return expiryDate.toLocaleDateString('zh-CN')
    }
    return '未知'
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="text-center">
        <CardHeader className="pb-4">
          {renderStatusIcon()}
          <CardTitle className="text-2xl mt-4">
            {renderStatusTitle()}
          </CardTitle>
          <CardDescription className="text-base">
            {renderStatusDescription()}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 订单信息 */}
          {outTradeNo && (
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <h3 className="font-medium text-gray-900 mb-2">订单详情</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>订单号：</span>
                  <span className="font-mono">{outTradeNo}</span>
                </div>
                {tradeNo && (
                  <div className="flex justify-between">
                    <span>支付单号：</span>
                    <span className="font-mono">{tradeNo}</span>
                  </div>
                )}
                {name && (
                  <div className="flex justify-between">
                    <span>商品名称：</span>
                    <span>{name}</span>
                  </div>
                )}
                {money && (
                  <div className="flex justify-between">
                    <span>支付金额：</span>
                    <span className="font-medium text-green-600">¥{money}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 会员状态 */}
          {paymentStatus === 'success' && (
            <div>
              {isLoading ? (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    正在检查会员状态...
                  </AlertDescription>
                </Alert>
              ) : isVipUser && membershipStatus ? (
                <Alert className="border-green-200 bg-green-50">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  <AlertDescription>
                    <div className="font-medium text-green-800 mb-1">
                      🎉 会员权限已激活！
                    </div>
                    <div className="text-sm text-green-700">
                      类型：{membershipStatus.membership_type === 'monthly_3' ? '季度会员' : 
                           membershipStatus.membership_type === 'yearly' ? '年度会员' : 
                           membershipStatus.membership_type === 'lifetime' ? '终身会员' : '会员'}
                      <br />
                      有效期：{formatMembershipExpiry(membershipStatus)}
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <AlertDescription>
                    会员权限正在激活中，通常在1-2分钟内完成。
                    如果长时间未激活，请联系客服。
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {paymentStatus === 'success' ? (
              <>
                <Button 
                  onClick={() => navigate('/audio')}
                  className="flex-1"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  开始体验音频
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  返回首页
                </Button>
              </>
            ) : paymentStatus === 'failed' ? (
              <>
                <Button 
                  onClick={() => navigate('/subscription')}
                  className="flex-1"
                >
                  重新支付
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  返回首页
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline"
                  onClick={loadMembershipStatus}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    '刷新状态'
                  )}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  返回首页
                </Button>
              </>
            )}
          </div>

          {/* 帮助信息 */}
          <div className="text-xs text-gray-500 pt-4 border-t">
            如有疑问，请联系客服或查看
            <Button 
              variant="link" 
              className="p-0 h-auto text-xs"
              onClick={() => navigate('/help')}
            >
              帮助中心
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 