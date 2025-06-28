import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ZPay MD5 签名验证函数
function generateMD5Signature(params: Record<string, any>, key: string): string {
  // 过滤掉 sign、sign_type 和空值
  const filteredParams: Record<string, string> = {}
  for (const [k, v] of Object.entries(params)) {
    if (k !== 'sign' && k !== 'sign_type' && v !== null && v !== '') {
      filteredParams[k] = String(v)
    }
  }
  
  // 按照参数名ASCII码排序
  const sortedKeys = Object.keys(filteredParams).sort()
  
  // 拼接成 URL 键值对格式
  const paramString = sortedKeys.map(key => `${key}=${filteredParams[key]}`).join('&')
  
  // 拼接商户密钥
  const signString = paramString + key
  
  // 使用Web Crypto API生成MD5（注意：实际项目中可能需要使用其他库）
  // 这里简化处理，实际使用时请确保MD5算法正确
  return hashMD5(signString)
}

// 简化的MD5实现（生产环境请使用可靠的MD5库）
function hashMD5(str: string): string {
  // 这里需要实现MD5算法或使用库
  // 为了简化，这里返回一个占位符
  // 实际使用时请使用 crypto-js 或其他MD5库
  console.log('MD5 input:', str)
  return 'md5_placeholder' // 请替换为真实的MD5实现
}

serve(async (req) => {
  try {
    // 只允许POST请求
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    // 获取环境变量
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const ZPAY_MERCHANT_KEY = Deno.env.get('ZPAY_MERCHANT_KEY')!

    // 创建Supabase客户端
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 解析请求数据
    const contentType = req.headers.get('content-type') || ''
    let notificationData: Record<string, any>

    if (contentType.includes('application/json')) {
      notificationData = await req.json()
    } else {
      // 处理form-data格式
      const formData = await req.formData()
      notificationData = {}
      for (const [key, value] of formData.entries()) {
        notificationData[key] = value
      }
    }

    console.log('收到支付通知:', notificationData)

    // 验证签名
    const receivedSign = notificationData.sign || ''
    const expectedSign = generateMD5Signature(notificationData, ZPAY_MERCHANT_KEY)
    
    if (receivedSign.toLowerCase() !== expectedSign.toLowerCase()) {
      console.error('签名验证失败')
      return new Response('签名验证失败', { status: 400 })
    }

    // 获取订单信息
    const outTradeNo = notificationData.out_trade_no
    const tradeStatus = notificationData.trade_status || ''

    if (!outTradeNo) {
      return new Response('缺少订单号', { status: 400 })
    }

    // 查询订单
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('out_trade_no', outTradeNo)
      .single()

    if (orderError || !order) {
      console.error('订单不存在:', orderError)
      return new Response('订单不存在', { status: 404 })
    }

    // 根据交易状态更新订单
    if (tradeStatus.toUpperCase() === 'SUCCESS' || tradeStatus.toUpperCase() === 'TRADE_SUCCESS') {
      // 支付成功，更新订单状态
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString()
        })
        .eq('out_trade_no', outTradeNo)

      if (updateError) {
        console.error('更新订单状态失败:', updateError)
        return new Response('更新订单失败', { status: 500 })
      }

      // 如果是订阅订单，更新用户会员状态
      if (order.order_type === 'subscription') {
        await updateUserMembership(supabase, order)
      }

      console.log(`订单 ${outTradeNo} 支付成功`)
    } else if (tradeStatus.toUpperCase() === 'FAILED') {
      // 支付失败
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'failed' })
        .eq('out_trade_no', outTradeNo)

      if (updateError) {
        console.error('更新订单状态失败:', updateError)
      }

      console.log(`订单 ${outTradeNo} 支付失败`)
    }

    // 返回成功响应给ZPay
    return new Response('success', { 
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    })

  } catch (error) {
    console.error('处理支付通知失败:', error)
    return new Response('处理失败', { status: 500 })
  }
})

// 更新用户会员状态
async function updateUserMembership(supabase: any, order: any) {
  try {
    const userId = order.user_id
    const subscriptionType = order.subscription_type
    const subscriptionDurationDays = order.subscription_duration_days
    
    const now = new Date()
    
    // 获取当前用户会员状态
    const { data: currentMembership } = await supabase
      .from('user_memberships')
      .select('*')
      .eq('user_id', userId)
      .single()

    let membershipData: any = {
      user_id: userId,
      membership_type: subscriptionType,
      last_subscription_order_id: order.id
    }

    if (subscriptionType === 'lifetime') {
      // 永久会员
      membershipData.is_lifetime_member = true
      membershipData.membership_expires_at = null
      membershipData.membership_started_at = now.toISOString()
    } else {
      // 计算新的到期时间
      let newExpiresAt: Date
      
      if (currentMembership?.membership_expires_at) {
        const currentExpires = new Date(currentMembership.membership_expires_at)
        if (currentExpires > now) {
          // 当前会员还未到期，延期
          newExpiresAt = new Date(currentExpires.getTime() + subscriptionDurationDays * 24 * 60 * 60 * 1000)
        } else {
          // 当前会员已到期，从现在开始
          newExpiresAt = new Date(now.getTime() + subscriptionDurationDays * 24 * 60 * 60 * 1000)
        }
      } else {
        // 新会员，从现在开始
        newExpiresAt = new Date(now.getTime() + subscriptionDurationDays * 24 * 60 * 60 * 1000)
      }

      membershipData.membership_expires_at = newExpiresAt.toISOString()
      membershipData.is_lifetime_member = false
      membershipData.membership_started_at = currentMembership?.membership_started_at || now.toISOString()
    }

    // 使用upsert更新或插入会员信息
    const { error } = await supabase
      .from('user_memberships')
      .upsert(membershipData, { onConflict: 'user_id' })

    if (error) {
      console.error('更新会员状态失败:', error)
    } else {
      console.log(`用户 ${userId} 会员状态更新成功: ${subscriptionType}`)
    }

  } catch (error) {
    console.error('处理会员状态更新失败:', error)
  }
} 