import { supabase } from './supabase'

// 订阅类型定义
export type SubscriptionType = 'monthly_3' | 'yearly' | 'lifetime'

export interface SubscriptionPlan {
  type: SubscriptionType
  name: string
  price: number
  duration_days: number
  description: string
  features: string[]
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
    description: '3个月会员权益',
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
    description: '12个月会员权益',
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
    description: '一次购买，终身享受',
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

// MD5签名生成（前端实现）
async function generateMD5Signature(params: Record<string, any>, key: string): Promise<string> {
  // 过滤掉空值和特殊字段
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
  
  // 使用简化的MD5实现（生产环境建议使用crypto-js库）
  const md5Hash = await simpleMD5(signString)
  
  console.log('生成签名:', md5Hash)
  
  return md5Hash
}

// 简化的MD5实现（仅用于演示，生产环境请使用crypto-js）
async function simpleMD5(str: string): Promise<string> {
  // 注意：这是一个简化的实现
  // 生产环境请使用: npm install crypto-js
  // import CryptoJS from 'crypto-js'
  // return CryptoJS.MD5(str).toString().toLowerCase()
  
  // 临时使用SHA-256作为替代（请在生产环境中替换为真正的MD5）
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  // 截取前32位模拟MD5长度（这不是真正的MD5！）
  return hashHex.substring(0, 32).toLowerCase()
}

// 生成ZPay跳转支付URL
export async function generateZPayJumpUrl(orderData: {
  pid: string
  type: string
  out_trade_no: string
  notify_url: string
  return_url: string
  name: string
  money: string
}): Promise<string> {
  const ZPAY_MERCHANT_KEY = import.meta.env.VITE_ZPAY_MERCHANT_KEY || ''
  
  if (!ZPAY_MERCHANT_KEY) {
    throw new Error('ZPay商户密钥未配置')
  }

  // 生成签名
  const sign = await generateMD5Signature(orderData, ZPAY_MERCHANT_KEY)
  
  // 构建完整的参数对象
  const fullParams = {
    ...orderData,
    sign_type: 'MD5',
    sign
  }
  
  // 构建URL参数
  const params = new URLSearchParams()
  Object.entries(fullParams).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params.append(key, String(value))
    }
  })
  
  return `https://zpayz.cn/submit.php?${params.toString()}`
}

// 创建订阅订单
export async function createSubscriptionOrder(subscriptionType: SubscriptionType): Promise<string> {
  try {
    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('用户未登录')
    }

    // 获取订阅套餐信息
    const plan = SUBSCRIPTION_PLANS.find(p => p.type === subscriptionType)
    if (!plan) {
      throw new Error('订阅套餐不存在')
    }

    // 生成订单号
    const outTradeNo = generateOrderNumber()

    // 创建订单记录
    const orderData = {
      out_trade_no: outTradeNo,
      user_id: user.id,
      name: plan.name,
      amount: plan.price,
      payment_type: 'zpay',
      status: 'pending' as const,
      order_type: 'subscription' as const,
      subscription_type: subscriptionType,
      subscription_duration_days: plan.duration_days,
      client_ip: '127.0.0.1', // 前端无法获取真实IP
      device: navigator.userAgent,
      params: { plan_features: plan.features }
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single()

    if (orderError) {
      console.error('创建订单失败:', orderError)
      throw new Error('创建订单失败')
    }

    // 生成支付跳转URL
    const ZPAY_PID = import.meta.env.VITE_ZPAY_PID || ''
    const ZPAY_NOTIFY_URL = import.meta.env.VITE_ZPAY_NOTIFY_URL || ''
    const ZPAY_RETURN_URL = import.meta.env.VITE_ZPAY_RETURN_URL || window.location.origin

    if (!ZPAY_PID || !ZPAY_NOTIFY_URL) {
      throw new Error('ZPay配置不完整')
    }

    const paymentUrl = await generateZPayJumpUrl({
      pid: ZPAY_PID,
      type: 'wxpay', // 或其他支付方式
      out_trade_no: outTradeNo,
      notify_url: ZPAY_NOTIFY_URL,
      return_url: ZPAY_RETURN_URL,
      name: plan.name,
      money: plan.price.toFixed(2)
    })

    // 更新订单的支付URL
    await supabase
      .from('orders')
      .update({ pay_url: paymentUrl })
      .eq('out_trade_no', outTradeNo)

    return paymentUrl

  } catch (error) {
    console.error('创建订阅订单失败:', error)
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