/**
 * API 配置文件
 * 
 * 这个文件统一管理所有 API 相关的配置
 * 支持开发环境和生产环境的自动切换
 */

// 获取 API 基础 URL
// 优先使用环境变量，如果没有则根据环境自动判断
const getApiBaseUrl = (): string => {
  // 1. 优先使用显式设置的环境变量
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // 2. 根据当前环境自动判断
  if (import.meta.env.DEV) {
    // 开发环境：使用本地后端
    return 'http://localhost:8000';
  } else {
    // 生产环境：使用 Vercel 部署的后端
    return 'https://herhzz-backend.vercel.app';
  }
};

// 导出 API 配置
export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  ENDPOINTS: {
    // 认证相关
    PROTECTED: '/api/protected',
    
    // 用户相关
    USER_PROFILE: '/api/user/profile',
    USER_MEMBERSHIP: '/api/user/membership',
    USER_AUDIO_ACCESS: '/api/user/audio-access',
    
    // 订单相关
    CREATE_ORDER: '/api/create_order',
    CREATE_SUBSCRIPTION_ORDER: '/api/create_subscription_qr_order',
    GET_ORDERS: '/api/orders',
    GET_ORDER_STATUS: '/api/get_order_status',
    
    // 支付相关
    PAYMENT_NOTIFY: '/notify_url',
    
    // 音频相关
    CHECK_AUDIO_ACCESS: '/api/audio',
    
    // 订阅相关
    SUBSCRIPTION_PRICING: '/api/subscription/pricing',
  }
} as const;

// 辅助函数：构建完整的 API URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// 辅助函数：创建 API 请求的通用配置
export const createApiConfig = (token?: string) => {
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (token) {
    (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  return config;
};

// 调试信息（仅在开发环境显示）
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    BASE_URL: API_CONFIG.BASE_URL,
    ENVIRONMENT: import.meta.env.DEV ? 'development' : 'production',
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  });
} 