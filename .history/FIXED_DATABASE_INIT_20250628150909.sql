-- ===============================================
-- HERHZZ 数据库初始化脚本 (修复版)
-- 解决 "relation does not exist" 错误
-- ===============================================
-- 
-- 使用方法：
-- 1. 复制整个文件内容
-- 2. 在 Supabase SQL 编辑器中粘贴
-- 3. 点击 "Run" 执行
--

-- 确保启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===============================================
-- 1. 创建支付订单表 (orders)
-- ===============================================

-- 先创建订单表
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
    
    -- 订单类型（支付 或 订阅）
    order_type VARCHAR(20) DEFAULT 'payment' 
        CHECK (order_type IN ('payment', 'subscription')),
    
    -- 订阅相关字段
    subscription_type VARCHAR(20) 
        CHECK (subscription_type IN ('monthly_3', 'yearly', 'lifetime')),
    subscription_duration_days INTEGER,
    subscription_start_date TIMESTAMP WITH TIME ZONE,
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    
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

-- 创建订单表索引
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_out_trade_no ON public.orders(out_trade_no);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON public.orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_subscription_type ON public.orders(subscription_type);

-- ===============================================
-- 2. 创建用户会员信息表 (user_memberships)
-- ===============================================

-- 创建用户会员信息表
CREATE TABLE IF NOT EXISTS public.user_memberships (
    -- 主键ID
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- 用户ID（关联到 Supabase Auth 用户）
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- 会员状态
    membership_type VARCHAR(20) DEFAULT 'free' NOT NULL 
        CHECK (membership_type IN ('free', 'monthly_3', 'yearly', 'lifetime')),
    
    -- 会员期限
    membership_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- 是否为永久会员
    is_lifetime_member BOOLEAN DEFAULT FALSE,
    
    -- 会员开始时间
    membership_started_at TIMESTAMP WITH TIME ZONE,
    
    -- 最后一次支付的订单ID
    last_subscription_order_id UUID REFERENCES public.orders(id),
    
    -- 剩余试用次数（可选功能）
    trial_audio_plays_remaining INTEGER DEFAULT 0,
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建会员表索引
CREATE INDEX IF NOT EXISTS idx_user_memberships_user_id ON public.user_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_expires_at ON public.user_memberships(membership_expires_at);
CREATE INDEX IF NOT EXISTS idx_user_memberships_type ON public.user_memberships(membership_type);

-- ===============================================
-- 3. 创建音频访问控制表 (audio_access_control)
-- ===============================================

-- 创建音频访问控制表
CREATE TABLE IF NOT EXISTS public.audio_access_control (
    -- 主键ID
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- 音频文件名
    audio_name VARCHAR(100) NOT NULL UNIQUE,
    
    -- 音频显示标题
    audio_title VARCHAR(200) NOT NULL,
    
    -- 音频所属周期阶段
    cycle_phase VARCHAR(20) NOT NULL 
        CHECK (cycle_phase IN ('menstrual', 'follicular', 'ovulation', 'luteal')),
    
    -- 访问级别：免费或付费
    access_level VARCHAR(10) DEFAULT 'free' NOT NULL 
        CHECK (access_level IN ('free', 'paid')),
    
    -- 音频顺序（用于确定每个阶段的第一个音频）
    display_order INTEGER NOT NULL,
    
    -- 音频描述
    description TEXT,
    
    -- 音频时长（秒）
    duration_seconds INTEGER,
    
    -- 创建时间
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建音频访问控制表索引
CREATE INDEX IF NOT EXISTS idx_audio_cycle_phase ON public.audio_access_control(cycle_phase);
CREATE INDEX IF NOT EXISTS idx_audio_access_level ON public.audio_access_control(access_level);
CREATE INDEX IF NOT EXISTS idx_audio_display_order ON public.audio_access_control(cycle_phase, display_order);

-- ===============================================
-- 4. 插入音频数据
-- ===============================================

INSERT INTO public.audio_access_control (audio_name, audio_title, cycle_phase, access_level, display_order, description) VALUES
-- 月经期音频
('yaolan_chaoxi.mp3', '摇篮潮汐', 'menstrual', 'free', 1, '月经期的舒缓音频，免费用户可听'),
('fenying_wenquan.mp3', '温泉芬影', 'menstrual', 'paid', 2, '月经期的高级音频，付费用户专享'),

-- 卵泡期音频  
('yueguang_paoyu.mp3', '月光泡浴', 'follicular', 'free', 1, '卵泡期的舒缓音频，免费用户可听'),
('yinguang_senlin.mp3', '银光森林', 'follicular', 'paid', 2, '卵泡期的高级音频，付费用户专享'),
('yinhe_fengqin.mp3', '银河风琴', 'follicular', 'paid', 3, '卵泡期的高级音频，付费用户专享'),

-- 排卵期音频
('rongrong_yuesheng.mp3', '茸茸月声', 'ovulation', 'free', 1, '排卵期的舒缓音频，免费用户可听'),
('xingji_shuilong.mp3', '星际水龙', 'ovulation', 'paid', 2, '排卵期的高级音频，付费用户专享'),

-- 黄体期音频
('yekong_simiao.mp3', '梦海深潜', 'luteal', 'free', 1, '黄体期的舒缓音频，免费用户可听'),
('taixian_zhengqi.mp3', '太虚正气', 'luteal', 'paid', 2, '黄体期的高级音频，付费用户专享'),
('qiudao_zhiye.mp3', '丘岛之夜', 'luteal', 'paid', 3, '黄体期的高级音频，付费用户专享'),
('xuedi_maobu.mp3', '雪地茅铺', 'luteal', 'paid', 4, '黄体期的高级音频，付费用户专享'),
('yueyun_ruanyu.mp3', '月云软语', 'luteal', 'paid', 5, '黄体期的高级音频，付费用户专享')

ON CONFLICT (audio_name) DO NOTHING;

-- ===============================================
-- 5. 启用行级安全策略 (RLS)
-- ===============================================

-- 启用所有表的 RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_access_control ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- 6. 清理可能存在的旧策略和触发器
-- ===============================================

-- 安全地删除可能存在的旧策略
DO $$ 
BEGIN
    -- 删除订单表的旧策略
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'users_select_own_orders') THEN
        DROP POLICY "users_select_own_orders" ON public.orders;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'users_insert_own_orders') THEN
        DROP POLICY "users_insert_own_orders" ON public.orders;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'users_update_own_orders') THEN
        DROP POLICY "users_update_own_orders" ON public.orders;
    END IF;
    
    -- 删除会员表的旧策略
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_memberships' AND policyname = 'users_select_own_membership') THEN
        DROP POLICY "users_select_own_membership" ON public.user_memberships;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_memberships' AND policyname = 'users_update_own_membership') THEN
        DROP POLICY "users_update_own_membership" ON public.user_memberships;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_memberships' AND policyname = 'users_insert_own_membership') THEN
        DROP POLICY "users_insert_own_membership" ON public.user_memberships;
    END IF;
    
    -- 删除音频访问控制表的旧策略
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audio_access_control' AND policyname = 'all_users_can_view_audio_list') THEN
        DROP POLICY "all_users_can_view_audio_list" ON public.audio_access_control;
    END IF;
END $$;

-- 安全地删除可能存在的旧触发器
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_orders_updated_at') THEN
        DROP TRIGGER update_orders_updated_at ON public.orders;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_memberships_updated_at') THEN
        DROP TRIGGER update_user_memberships_updated_at ON public.user_memberships;
    END IF;
END $$;

-- ===============================================
-- 7. 创建新的 RLS 策略
-- ===============================================

-- 订单表 RLS 策略
CREATE POLICY "users_select_own_orders" ON public.orders 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_orders" ON public.orders 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_orders" ON public.orders 
    FOR UPDATE USING (auth.uid() = user_id);

-- 会员表 RLS 策略
CREATE POLICY "users_select_own_membership" ON public.user_memberships 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_update_own_membership" ON public.user_memberships 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_membership" ON public.user_memberships 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 音频访问控制表策略（所有用户都可以查看）
CREATE POLICY "all_users_can_view_audio_list" ON public.audio_access_control 
    FOR SELECT USING (true);

-- ===============================================
-- 8. 创建触发器函数
-- ===============================================

-- 订单表更新时间触发器函数
CREATE OR REPLACE FUNCTION update_orders_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 会员表更新时间触发器函数
CREATE OR REPLACE FUNCTION update_user_memberships_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON public.orders 
    FOR EACH ROW EXECUTE FUNCTION update_orders_updated_at_column();

CREATE TRIGGER update_user_memberships_updated_at 
    BEFORE UPDATE ON public.user_memberships 
    FOR EACH ROW EXECUTE FUNCTION update_user_memberships_updated_at_column();

-- ===============================================
-- 9. 创建业务函数
-- ===============================================

-- 会员状态检查函数
CREATE OR REPLACE FUNCTION check_user_membership_status(user_uuid UUID)
RETURNS TABLE(
    is_member BOOLEAN,
    membership_type TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    days_remaining INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN um.is_lifetime_member = TRUE THEN TRUE
            WHEN um.membership_expires_at IS NULL THEN FALSE
            WHEN um.membership_expires_at > NOW() THEN TRUE
            ELSE FALSE
        END as is_member,
        COALESCE(um.membership_type, 'free') as membership_type,
        um.membership_expires_at,
        CASE 
            WHEN um.is_lifetime_member = TRUE THEN NULL
            WHEN um.membership_expires_at IS NULL THEN 0
            ELSE GREATEST(0, EXTRACT(DAY FROM (um.membership_expires_at - NOW()))::INTEGER)
        END as days_remaining
    FROM public.user_memberships um
    WHERE um.user_id = user_uuid
    UNION ALL
    SELECT FALSE, 'free', NULL::TIMESTAMP WITH TIME ZONE, 0
    WHERE NOT EXISTS (
        SELECT 1 FROM public.user_memberships um WHERE um.user_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 音频访问权限检查函数
CREATE OR REPLACE FUNCTION check_audio_access_permission(
    user_uuid UUID, 
    audio_file_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    audio_access_level VARCHAR(10);
    user_is_member BOOLEAN;
BEGIN
    -- 检查音频的访问级别
    SELECT access_level INTO audio_access_level 
    FROM public.audio_access_control 
    WHERE audio_name = audio_file_name;
    
    -- 如果音频不存在，返回 false
    IF audio_access_level IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- 如果是免费音频，直接返回 true
    IF audio_access_level = 'free' THEN
        RETURN TRUE;
    END IF;
    
    -- 检查用户是否为付费会员
    SELECT is_member INTO user_is_member 
    FROM check_user_membership_status(user_uuid) 
    LIMIT 1;
    
    RETURN COALESCE(user_is_member, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================
-- 10. 完成提示
-- ===============================================

SELECT 
    '🎉 HERHZZ 数据库初始化完成！' as status,
    'orders 表已创建' as orders_table,
    'user_memberships 表已创建' as memberships_table,
    'audio_access_control 表已创建' as audio_table,
    '所有索引和触发器已创建' as indexes_triggers,
    '行级安全策略已启用' as rls_policies,
    '业务函数已创建' as business_functions,
    '现在可以正常使用所有功能了！' as message; 