import { supabase } from './supabase'
// 请先安装: npm install crypto-js @types/crypto-js
// import CryptoJS from 'crypto-js'

// 订阅类型定义
export type SubscriptionType = 'monthly_3' | 'yearly' | 'lifetime'

export interface SubscriptionPlan {
  type: SubscriptionType
  name: string
  price: number
  duration_days: number
  description: string
  poeticDescription: string
  detailedDescription: string
  features: string[]
  badge?: string // 特别标签，如"最受欢迎"
  pricePerDay?: string // 每日价格
}

export interface UserMembership {
  user_id: string
  membership_type: SubscriptionType | null
  is_lifetime_member: boolean
  membership_started_at: string | null
  membership_expires_at: string | null
  last_subscription_order_id: string | null
}

export interface OrderData {
  id: string
  out_trade_no: string
  user_id: string
  name: string
  amount: number
  payment_type: string
  status: 'pending' | 'paid' | 'failed' | 'cancelled'
  order_type: 'subscription' | 'product'
  subscription_type?: SubscriptionType
  pay_url?: string
  qr_code?: string
  created_at: string
}

// 订阅套餐配置
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    type: 'monthly_3',
    name: '季度会员',
    price: 29.99,
    duration_days: 90,
    description: '3个月权益',
    poeticDescription: '「试着与身体同步一个季节」',
    detailedDescription: '轻盈入门，体验三个周期的声音陪伴',
    features: [
      '解锁全部12种助眠音频',
      '无限制播放次数',
      '高品质音频',
      '专属会员音频'
    ]
  },
  {
    type: 'yearly',
    name: '年度会员',
    price: 99.99,
    duration_days: 365,
    description: '12个月权益',
    poeticDescription: '「让一年中的月亮都记得你」',
    detailedDescription: '每月匹配更新的疗愈声音，与你的身体温柔同步',
    badge: '最受欢迎',
    pricePerDay: '仅 ¥0.27/天，安心入眠一整年',
    features: [
      '解锁全部12种助眠音频',
      '无限制播放次数',
      '高品质音频',
      '专属会员音频',
      '新音频优先体验',
      '24/7 客服支持'
    ]
  },
  {
    type: 'lifetime',
    name: '终身会员',
    price: 299.99,
    duration_days: 0, // 0表示永久
    description: '一次购买，永久使用',
    poeticDescription: '「送给自己的月亮资产」',
    detailedDescription: '身体有美妙节律，你也该拥有一生相伴的月梦之声',
    features: [
      '解锁全部12种助眠音频',
      '无限制播放次数',
      '高品质音频',
      '专属会员音频',
      '新音频优先体验',
      '24/7 客服支持',
      '终身免费更新',
      '独家定制音频'
    ]
  }
]

// 生成唯一订单号
function generateOrderNumber(): string {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '')
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${dateStr}-${timeStr}-${randomStr}`
}

// 检测设备类型（简化版本，符合数据库20字符限制）
function getDeviceType(): string {
  const userAgent = navigator.userAgent.toLowerCase()
  
  if (/mobile|android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    if (/ipad|android(?=.*tablet)|tablet/i.test(userAgent)) {
      return 'tablet'
    }
    return 'mobile'
  }
  
  return 'desktop'
}

// MD5签名生成（前端实现）
async function generateMD5Signature(params: Record<string, any>, key: string): Promise<string> {
  // 过滤掉空值和特殊字段
  const filteredParams: Record<string, string> = {}
  for (const [k, v] of Object.entries(params)) {
    if (k !== 'sign' && k !== 'sign_type' && v !== null && v !== '' && v !== undefined) {
      // 不进行URL编码，直接使用原始值进行签名
      filteredParams[k] = String(v)
    }
  }
  
  // 按照参数名ASCII码排序
  const sortedKeys = Object.keys(filteredParams).sort()
  
  // 拼接成键值对格式：a=b&c=d&e=f
  const paramString = sortedKeys.map(key => `${key}=${filteredParams[key]}`).join('&')
  
  // 拼接商户密钥：paramString + KEY（字符串拼接，不是加号字符）
  const signString = paramString + key
  
  console.log('🔐 签名参数（原始值）:', filteredParams)
  console.log('🔐 排序后的键:', sortedKeys)
  console.log('🔐 参数字符串:', paramString)
  console.log('🔐 商户密钥:', key ? `${key.substring(0, 4)}****${key.substring(key.length-4)}` : 'undefined')
  console.log('🔐 完整签名字符串:', signString)
  
  // 使用MD5加密，结果转为小写
  const md5Hash = await simpleMD5(signString)
  
  console.log('🔐 生成的MD5签名:', md5Hash)
  
  return md5Hash
}

// MD5实现（使用Web Crypto API的变通方案）
async function simpleMD5(str: string): Promise<string> {
  // 由于浏览器不直接支持MD5，我们使用一个简单的MD5实现
  // 注意：这是一个基础实现，生产环境建议使用 crypto-js 库
  
  function md5(input: string): string {
    // 基础MD5实现
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
        const olda = a
        const oldb = b
        const oldc = c
        const oldd = d

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

  return md5(str)
}

// 生成ZPay二维码支付数据
export async function generateZPayQRCode(orderData: {
  pid: string
  type: string
  out_trade_no: string
  notify_url?: string
  name: string
  money: string
}): Promise<{
  qr_code: string
  order_id: string
}> {
  // This function should no longer make direct API calls to ZPay
  // Instead, it should use the backend API
  throw new Error('This function is deprecated. Use createSubscriptionOrder instead.')
}

// 创建订阅订单
export async function createSubscriptionOrder(subscriptionType: SubscriptionType): Promise<string> {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('用户未登录')
    }

    // Get subscription plan info
    const plan = SUBSCRIPTION_PLANS.find(p => p.type === subscriptionType)
    if (!plan) {
      throw new Error('订阅套餐不存在')
    }

    console.log('🚀 正在通过后端API创建订阅订单:', {
      subscriptionType,
      planName: plan.name,
      amount: plan.price
    })

    // Get user session for auth header
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      throw new Error('用户登录状态无效')
    }

    // Convert subscriptionType to backend format
    let backendSubscriptionType: string
    switch (subscriptionType) {
      case 'monthly_3':
        backendSubscriptionType = '3_months'
        break
      case 'yearly':
        backendSubscriptionType = '1_year'
        break
      case 'lifetime':
        backendSubscriptionType = 'lifetime'
        break
      default:
        throw new Error(`不支持的订阅类型: ${subscriptionType}`)
    }

    // Call backend API to create subscription QR code order
    const response = await fetch('http://localhost:8000/api/create_subscription_qr_order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        subscription_type: backendSubscriptionType,
        payment_type: 'alipay', // Use Alipay for QR code
        return_url: window.location.origin + '/subscription/success'
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `后端API错误: ${response.status}`)
    }

    const result = await response.json()
    console.log('✅ 后端API响应:', result)

    // Check if this is a QR code response or redirect URL
    if (result.pay_url && result.pay_url.startsWith('http')) {
      // This is a redirect URL - we need to request QR code instead
      console.log('📱 收到跳转链接，需要生成二维码支付')
      
      // For now, return the jump URL format for compatibility
      // In a real implementation, you'd want to add a QR code endpoint to your backend
      return JSON.stringify({
        type: 'redirect',
        pay_url: result.pay_url,
        out_trade_no: result.out_trade_no,
        amount: result.amount,
        name: result.subscription_name
      })
    } else {
      // This might already be QR code data
      return JSON.stringify({
        type: 'qr_code',
        qr_code: result.qr_code || result.pay_url,
        order_id: result.out_trade_no,
        out_trade_no: result.out_trade_no,
        amount: result.amount,
        name: result.subscription_name
      })
    }

  } catch (error) {
    console.error('❌ 创建订阅订单失败:', error)
    throw error
  }
}

// 获取用户会员状态
export async function getUserMembershipStatus(): Promise<UserMembership | null> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return null
    }

    const { data, error } = await supabase
      .from('user_memberships')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 是没有找到记录的错误码
      console.error('获取会员状态失败:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('获取会员状态失败:', error)
    return null
  }
}

// 检查用户是否有有效会员
export async function checkUserMembershipValid(): Promise<boolean> {
  const membership = await getUserMembershipStatus()
  
  if (!membership) {
    return false
  }

  // 终身会员
  if (membership.is_lifetime_member) {
    return true
  }

  // 检查会员是否过期
  if (membership.membership_expires_at) {
    const expiresAt = new Date(membership.membership_expires_at)
    const now = new Date()
    return expiresAt > now
  }

  return false
}

// 获取音频访问权限列表
export async function getUserAudioAccess(): Promise<Array<{
  audio_name: string
  audio_title: string
  cycle_phase: string
  access_level: 'free' | 'paid'
  can_access: boolean
}>> {
  try {
    // 获取用户会员状态
    const isVip = await checkUserMembershipValid()

    // 获取音频访问控制信息
    const { data: audioList, error } = await supabase
      .from('audio_access_control')
      .select('*')
      .order('cycle_phase')

    if (error) {
      console.error('获取音频列表失败:', error)
      throw error
    }

    // 返回包含访问权限的音频列表
    return audioList.map(audio => ({
      ...audio,
      can_access: audio.access_level === 'free' || isVip
    }))

  } catch (error) {
    console.error('获取音频访问权限失败:', error)
    throw error
  }
}

// 检查特定音频的访问权限
export async function checkAudioAccess(audioName: string): Promise<boolean> {
  try {
    // 获取音频信息
    const { data: audio, error } = await supabase
      .from('audio_access_control')
      .select('access_level')
      .eq('audio_name', audioName)
      .single()

    if (error) {
      console.error('获取音频信息失败:', error)
      return false
    }

    // 如果是免费音频，直接允许访问
    if (audio.access_level === 'free') {
      return true
    }

    // 如果是付费音频，检查用户会员状态
    return await checkUserMembershipValid()

  } catch (error) {
    console.error('检查音频访问权限失败:', error)
    return false
  }
}

// 检查订单支付状态
export async function checkOrderPaymentStatus(outTradeNo: string): Promise<{
  status: 'pending' | 'paid' | 'failed' | 'cancelled'
  order: OrderData | null
}> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('用户未登录')
    }

    // 查询订单状态
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('out_trade_no', outTradeNo)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('查询订单状态失败:', error)
      throw new Error('查询订单状态失败')
    }

    if (!order) {
      throw new Error('订单不存在')
    }

    return {
      status: order.status,
      order
    }
  } catch (error) {
    console.error('检查订单支付状态失败:', error)
    throw error
  }
}

// 获取用户订单列表
export async function getUserOrders(limit: number = 10, offset: number = 0): Promise<OrderData[]> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('用户未登录')
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('获取订单列表失败:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('获取订单列表失败:', error)
    throw error
  }
} 