-- 创建支付订单表
-- 在 Supabase SQL 编辑器中运行此文件

-- 确保启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建订单表
CREATE TABLE IF NOT EXISTS public.orders (
    -- 主键ID
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- 商户订单号（唯一，用于与第三方支付对接）
    out_trade_no TEXT UNIQUE NOT NULL,
    
    -- 用户ID（关联到 Supabase Auth 用户）
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- 商品信息
    name TEXT NOT NULL,                    -- 商品名称
    amount NUMERIC(10,2) NOT NULL,         -- 金额（单位：元，最多两位小数）
    
    -- 支付信息
    payment_type VARCHAR(20) NOT NULL,     -- 支付方式（如 alipay, wechat 等）
    
    -- 订单状态
    status VARCHAR(20) DEFAULT 'pending' NOT NULL 
        CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
    
    -- 第三方支付相关信息
    zpay_trade_no TEXT,                    -- ZPay 返回的交易号
    pay_url TEXT,                          -- 支付链接
    qr_code TEXT,                          -- 二维码链接
    
    -- 用户IP和设备信息
    client_ip INET,                        -- 用户IP地址
    device VARCHAR(20) DEFAULT 'pc',       -- 设备类型
    
    -- 扩展参数
    params JSONB,                          -- 业务扩展参数
    
    -- 支付完成时间
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_out_trade_no ON public.orders(out_trade_no);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON public.orders(user_id, status);

-- 启用行级安全策略 (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略：用户只能看到自己的订单
CREATE POLICY "users_select_own_orders" ON public.orders 
    FOR SELECT USING (auth.uid() = user_id);

-- 创建 RLS 策略：用户只能创建自己的订单
CREATE POLICY "users_insert_own_orders" ON public.orders 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 创建 RLS 策略：用户只能更新自己的订单
CREATE POLICY "users_update_own_orders" ON public.orders 
    FOR UPDATE USING (auth.uid() = user_id);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_orders_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建更新时间触发器
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON public.orders 
    FOR EACH ROW EXECUTE FUNCTION update_orders_updated_at_column();

-- 完成提示
SELECT 'Orders 表创建完成！' as status; 