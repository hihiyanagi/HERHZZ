import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

// MD5 签名验证函数
async function verifyMD5Signature(params: Record<string, any>, key: string, sign: string): Promise<boolean> {
  try {
    // 过滤掉 sign、sign_type 和空值
    const filteredParams: Record<string, string> = {}
    for (const [k, v] of Object.entries(params)) {
      if (k !== 'sign' && k !== 'sign_type' && v !== null && v !== '' && v !== undefined) {
        filteredParams[k] = String(v)
      }
    }
    
    // 按照参数名ASCII码排序
    const sortedKeys = Object.keys(filteredParams).sort()
    
    // 拼接成 URL 键值对格式（不做URL编码）
    const paramString = sortedKeys.map(key => `${key}=${filteredParams[key]}`).join('&')
    
    // 拼接商户密钥
    const signString = paramString + key
    
    console.log('签名原始字符串:', signString)
    
    // 使用 MD5 加密
    const encoder = new TextEncoder()
    const data = encoder.encode(signString)
    const hashBuffer = await crypto.subtle.digest('MD5', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const expectedSign = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toLowerCase()
    
    console.log('计算签名:', expectedSign)
    console.log('接收签名:', sign.toLowerCase())
    
    return expectedSign === sign.toLowerCase()
  } catch (error) {
    console.error('签名验证失败:', error)
    return false
  }
}

serve(async (req) => {
  try {
    // 只允许GET请求（ZPay使用GET发送通知）
    if (req.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 })
    }

    // 获取环境变量
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const ZPAY_MERCHANT_KEY = Deno.env.get('ZPAY_MERCHANT_KEY')!

    // 创建Supabase客户端
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 解析GET请求参数
    const url = new URL(req.url)
    const notificationData: Record<string, any> = {}
    
    // 获取所有查询参数
    for (const [key, value] of url.searchParams.entries()) {
      notificationData[key] = value
    }

    console.log('收到支付通知 (GET):', notificationData)

    // 验证必要参数
    const requiredParams = ['pid', 'out_trade_no', 'trade_status', 'sign', 'money']
    for (const param of requiredParams) {
      if (!notificationData[param]) {
        console.error(`缺少必要参数: ${param}`)
        return new Response(`缺少必要参数: ${param}`, { status: 400 })
      }
    }

    // 验证签名
    const receivedSign = notificationData.sign || ''
    const isSignatureValid = await verifyMD5Signature(notificationData, ZPAY_MERCHANT_KEY, receivedSign)
    
    if (!isSignatureValid) {
      console.error('签名验证失败')
      return new Response('fail', { status: 400 })
    }

    // 获取订单信息
    const outTradeNo = notificationData.out_trade_no
    const tradeStatus = notificationData.trade_status || ''
    const notifiedAmount = parseFloat(notificationData.money || '0')

    // 查询订单
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('out_trade_no', outTradeNo)
      .single()

    if (orderError || !order) {
      console.error('订单不存在:', orderError)
      return new Response('fail', { status: 200 }) // ZPay要求返回200状态码
    }

    // 校验金额是否一致
    if (Math.abs(order.amount - notifiedAmount) > 0.01) { // 允许0.01的浮点误差
      console.error(`金额不匹配: 订单金额=${order.amount}, 通知金额=${notifiedAmount}`)
      return new Response('fail', { status: 200 })
    }

    // 根据交易状态更新订单
    if (tradeStatus === 'TRADE_SUCCESS') {
      // 检查订单是否已经是paid状态（幂等处理）
      if (order.status === 'paid') {
        console.log(`订单 ${outTradeNo} 已经是支付成功状态，跳过处理`)
        return new Response('success', { 
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        })
      }

      // 只有pending状态的订单才能更新为paid
      if (order.status !== 'pending') {
        console.error(`订单状态异常: ${order.status}，只能从pending更新为paid`)
        return new Response('fail', { status: 200 })
      }

      // 支付成功，更新订单状态
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          zpay_trade_no: notificationData.trade_no,
          paid_at: new Date().toISOString()
        })
        .eq('out_trade_no', outTradeNo)
        .eq('status', 'pending') // 确保只更新pending状态的订单

      if (updateError) {
        console.error('更新订单状态失败:', updateError)
        return new Response('fail', { status: 200 })
      }

      // 如果是订阅订单，更新用户会员状态
      if (order.order_type === 'subscription') {
        await updateUserMembership(supabase, order)
      }

      console.log(`订单 ${outTradeNo} 支付成功，金额: ${notifiedAmount}`)
    } else {
      // 其他状态暂不处理，但返回success避免重复通知
      console.log(`订单 ${outTradeNo} 状态: ${tradeStatus}`)
    }

    // 返回成功响应给ZPay（必须返回纯字符串"success"）
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