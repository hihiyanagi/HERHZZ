-- 创建会员订阅系统数据库表
-- 在 Supabase SQL 编辑器中运行此文件

-- 确保启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 扩展现有的 orders 表，添加订阅相关字段
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_type VARCHAR(20) DEFAULT 'payment' 
    CHECK (order_type IN ('payment', 'subscription'));

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(20) 
    CHECK (subscription_type IN ('3_months', '1_year', 'lifetime'));

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subscription_duration_days INTEGER;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE;

-- 2. 创建用户会员信息表
CREATE TABLE IF NOT EXISTS public.user_memberships (
    -- 主键ID
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- 用户ID（关联到 Supabase Auth 用户）
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- 会员状态
    membership_type VARCHAR(20) DEFAULT 'free' NOT NULL 
        CHECK (membership_type IN ('free', '3_months', '1_year', 'lifetime')),
    
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

-- 3. 创建音频访问控制表
CREATE TABLE IF NOT EXISTS public.audio_access_control (
    -- 主键ID
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- 音频文件名
    audio_name VARCHAR(100) NOT NULL,
    
    -- 音频显示名称
    audio_display_name VARCHAR(200) NOT NULL,
    
    -- 音频所属周期阶段
    cycle_phase VARCHAR(20) NOT NULL 
        CHECK (cycle_phase IN ('menstrual', 'follicular', 'ovulation', 'luteal')),
    
    -- 是否为免费音频（每个周期的第一个音频）
    is_free BOOLEAN DEFAULT FALSE,
    
    -- 音频顺序（用于确定每个阶段的第一个音频）
    display_order INTEGER NOT NULL,
    
    -- 音频描述
    description TEXT,
    
    -- 音频时长（秒）
    duration_seconds INTEGER,
    
    -- 创建时间
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 插入音频数据（基于您提到的音频文件）
INSERT INTO public.audio_access_control (audio_name, audio_display_name, cycle_phase, is_free, display_order, description) VALUES
-- 月经期音频
('yaolan_chaoxi.mp3', '摇篮潮汐', 'menstrual', TRUE, 1, '月经期的舒缓音频，免费用户可听'),
('fenying_wenquan.mp3', '温泉芬影', 'menstrual', FALSE, 2, '月经期的高级音频，付费用户专享'),

-- 卵泡期音频  
('yueguang_paoyu.mp3', '月光泡浴', 'follicular', TRUE, 1, '卵泡期的舒缓音频，免费用户可听'),
('yinguang_senlin.mp3', '银光森林', 'follicular', FALSE, 2, '卵泡期的高级音频，付费用户专享'),
('yinhe_fengqin.mp3', '银河风琴', 'follicular', FALSE, 3, '卵泡期的高级音频，付费用户专享'),

-- 排卵期音频
('rongrong_yuesheng.mp3', '茸茸月声', 'ovulation', TRUE, 1, '排卵期的舒缓音频，免费用户可听'),
('xingji_shuilong.mp3', '星际水龙', 'ovulation', FALSE, 2, '排卵期的高级音频，付费用户专享'),

-- 黄体期音频
('yekong_simiao.mp3', '梦海深潜', 'luteal', TRUE, 1, '黄体期的舒缓音频，免费用户可听'),
('taixian_zhengqi.mp3', '太虚正气', 'luteal', FALSE, 2, '黄体期的高级音频，付费用户专享'),
('qiudao_zhiye.mp3', '丘岛之夜', 'luteal', FALSE, 3, '黄体期的高级音频，付费用户专享'),
('xuedi_maobu.mp3', '雪地茅铺', 'luteal', FALSE, 4, '黄体期的高级音频，付费用户专享'),
('yueyun_ruanyu.mp3', '月云软语', 'luteal', FALSE, 5, '黄体期的高级音频，付费用户专享')

ON CONFLICT (audio_name) DO NOTHING;

-- 5. 创建索引
CREATE INDEX IF NOT EXISTS idx_user_memberships_user_id ON public.user_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_expires_at ON public.user_memberships(membership_expires_at);
CREATE INDEX IF NOT EXISTS idx_user_memberships_type ON public.user_memberships(membership_type);

CREATE INDEX IF NOT EXISTS idx_audio_cycle_phase ON public.audio_access_control(cycle_phase);
CREATE INDEX IF NOT EXISTS idx_audio_is_free ON public.audio_access_control(is_free);
CREATE INDEX IF NOT EXISTS idx_audio_display_order ON public.audio_access_control(cycle_phase, display_order);

-- 6. 启用行级安全策略 (RLS)
ALTER TABLE public.user_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_access_control ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略：用户只能看到自己的会员信息
CREATE POLICY "users_select_own_membership" ON public.user_memberships 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_update_own_membership" ON public.user_memberships 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_membership" ON public.user_memberships 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 音频访问控制表：所有用户都可以查看（但访问权限由应用层控制）
CREATE POLICY "all_users_can_view_audio_list" ON public.audio_access_control 
    FOR SELECT USING (true);

-- 7. 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_user_memberships_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_memberships_updated_at 
    BEFORE UPDATE ON public.user_memberships 
    FOR EACH ROW EXECUTE FUNCTION update_user_memberships_updated_at_column();

-- 8. 创建会员状态检查函数
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

-- 9. 创建音频访问权限检查函数
CREATE OR REPLACE FUNCTION check_audio_access_permission(
    user_uuid UUID, 
    audio_file_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    audio_is_free BOOLEAN;
    user_is_member BOOLEAN;
BEGIN
    -- 检查音频是否为免费音频
    SELECT is_free INTO audio_is_free 
    FROM public.audio_access_control 
    WHERE audio_name = audio_file_name;
    
    -- 如果音频不存在，返回 false
    IF audio_is_free IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- 如果是免费音频，直接返回 true
    IF audio_is_free = TRUE THEN
        RETURN TRUE;
    END IF;
    
    -- 检查用户是否为付费会员
    SELECT is_member INTO user_is_member 
    FROM check_user_membership_status(user_uuid) 
    LIMIT 1;
    
    RETURN COALESCE(user_is_member, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 完成提示
SELECT '会员订阅系统数据库表创建完成！' as status; 