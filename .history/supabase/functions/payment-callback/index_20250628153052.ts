// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// MD5 实现（与前端保持一致）
function md5(input: string): string {
  function safeAdd(x: number, y: number): number {
    const lsw = (x & 0xFFFF) + (y & 0xFFFF)
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16)
    return (msw << 16) | (lsw & 0xFFFF)
  }

  function bitRotateLeft(num: number, cnt: number): number {
    return (num << cnt) | (num >>> (32 - cnt))
  }

  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b)
  }

  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn((b & c) | ((~b) & d), a, b, x, s, t)
  }

  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn((b & d) | (c & (~d)), a, b, x, s, t)
  }

  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn(b ^ c ^ d, a, b, x, s, t)
  }

  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn(c ^ (b | (~d)), a, b, x, s, t)
  }

  function binlMD5(x: number[], len: number): number[] {
    x[len >> 5] |= 0x80 << (len % 32)
    x[(((len + 64) >>> 9) << 4) + 14] = len

    let a = 1732584193
    let b = -271733879
    let c = -1732584194
    let d = 271733878

    for (let i = 0; i < x.length; i += 16) {
      const olda = a, oldb = b, oldc = c, oldd = d

      a = md5ff(a, b, c, d, x[i], 7, -680876936)
      d = md5ff(d, a, b, c, x[i + 1], 12, -389564586)
      c = md5ff(c, d, a, b, x[i + 2], 17, 606105819)
      b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330)
      a = md5ff(a, b, c, d, x[i + 4], 7, -176418897)
      d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426)
      c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341)
      b = md5ff(b, c, d, a, x[i + 7], 22, -45705983)
      a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416)
      d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417)
      c = md5ff(c, d, a, b, x[i + 10], 17, -42063)
      b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162)
      a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682)
      d = md5ff(d, a, b, c, x[i + 13], 12, -40341101)
      c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290)
      b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329)

      a = md5gg(a, b, c, d, x[i + 1], 5, -165796510)
      d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632)
      c = md5gg(c, d, a, b, x[i + 11], 14, 643717713)
      b = md5gg(b, c, d, a, x[i], 20, -373897302)
      a = md5gg(a, b, c, d, x[i + 5], 5, -701558691)
      d = md5gg(d, a, b, c, x[i + 10], 9, 38016083)
      c = md5gg(c, d, a, b, x[i + 15], 14, -660478335)
      b = md5gg(b, c, d, a, x[i + 4], 20, -405537848)
      a = md5gg(a, b, c, d, x[i + 9], 5, 568446438)
      d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690)
      c = md5gg(c, d, a, b, x[i + 3], 14, -187363961)
      b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501)
      a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467)
      d = md5gg(d, a, b, c, x[i + 2], 9, -51403784)
      c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473)
      b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734)

      a = md5hh(a, b, c, d, x[i + 5], 4, -378558)
      d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463)
      c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562)
      b = md5hh(b, c, d, a, x[i + 14], 23, -35309556)
      a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060)
      d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353)
      c = md5hh(c, d, a, b, x[i + 7], 16, -155497632)
      b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640)
      a = md5hh(a, b, c, d, x[i + 13], 4, 681279174)
      d = md5hh(d, a, b, c, x[i], 11, -358537222)
      c = md5hh(c, d, a, b, x[i + 3], 16, -722521979)
      b = md5hh(b, c, d, a, x[i + 6], 23, 76029189)
      a = md5hh(a, b, c, d, x[i + 9], 4, -640364487)
      d = md5hh(d, a, b, c, x[i + 12], 11, -421815835)
      c = md5hh(c, d, a, b, x[i + 15], 16, 530742520)
      b = md5hh(b, c, d, a, x[i + 2], 23, -995338651)

      a = md5ii(a, b, c, d, x[i], 6, -198630844)
      d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415)
      c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905)
      b = md5ii(b, c, d, a, x[i + 5], 21, -57434055)
      a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571)
      d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606)
      c = md5ii(c, d, a, b, x[i + 10], 15, -1051523)
      b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799)
      a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359)
      d = md5ii(d, a, b, c, x[i + 15], 10, -30611744)
      c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380)
      b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649)
      a = md5ii(a, b, c, d, x[i + 4], 6, -145523070)
      d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379)
      c = md5ii(c, d, a, b, x[i + 2], 15, 718787259)
      b = md5ii(b, c, d, a, x[i + 9], 21, -343485551)

      a = safeAdd(a, olda)
      b = safeAdd(b, oldb)
      c = safeAdd(c, oldc)
      d = safeAdd(d, oldd)
    }
    return [a, b, c, d]
  }

  function binl2hex(binarray: number[]): string {
    const hexTab = '0123456789abcdef'
    let str = ''
    for (let i = 0; i < binarray.length * 4; i++) {
      str += hexTab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) +
             hexTab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xF)
    }
    return str
  }

  function str2binl(str: string): number[] {
    const bin = []
    const mask = (1 << 8) - 1
    for (let i = 0; i < str.length * 8; i += 8) {
      bin[i >> 5] |= (str.charCodeAt(i / 8) & mask) << (i % 32)
    }
    return bin
  }

  return binl2hex(binlMD5(str2binl(input), input.length * 8))
}

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
    
    // 拼接成键值对格式：a=b&c=d&e=f
    const paramString = sortedKeys.map(key => `${key}=${filteredParams[key]}`).join('&')
    
    // 拼接商户密钥：paramString + KEY
    const signString = paramString + key
    
    console.log('🔐 服务端签名验证:')
    console.log('🔐 参数字符串:', paramString)
    console.log('🔐 完整签名字符串:', signString)
    
    // 使用 MD5 加密，结果转为小写
    const expectedSign = md5(signString).toLowerCase()
    
    console.log('🔐 计算签名:', expectedSign)
    console.log('🔐 接收签名:', sign.toLowerCase())
    
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