-- 修复 user_memberships 表权限问题
-- 在 Supabase SQL 编辑器中运行此脚本

-- ================================
-- 1. 完全禁用 user_memberships 表的 RLS
-- ================================

-- 先删除所有现有的策略
DROP POLICY IF EXISTS "users_select_own_membership" ON public.user_memberships;
DROP POLICY IF EXISTS "users_update_own_membership" ON public.user_memberships;
DROP POLICY IF EXISTS "users_insert_own_membership" ON public.user_memberships;
DROP POLICY IF EXISTS "Users can view own memberships" ON public.user_memberships;
DROP POLICY IF EXISTS "Users can insert own memberships" ON public.user_memberships;
DROP POLICY IF EXISTS "Users can update own memberships" ON public.user_memberships;

-- 完全禁用 RLS
ALTER TABLE public.user_memberships DISABLE ROW LEVEL SECURITY;

-- ================================
-- 2. 确保表存在且结构正确
-- ================================

-- 检查并创建表（如果不存在）
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
    last_subscription_order_id UUID,
    
    -- 剩余试用次数（可选功能）
    trial_audio_plays_remaining INTEGER DEFAULT 0,
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- 3. 确保索引存在
-- ================================

CREATE INDEX IF NOT EXISTS idx_user_memberships_user_id ON public.user_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_expires_at ON public.user_memberships(membership_expires_at);
CREATE INDEX IF NOT EXISTS idx_user_memberships_type ON public.user_memberships(membership_type);

-- ================================
-- 4. 为当前用户创建默认会员记录（如果不存在）
-- ================================

-- 注意：这会为所有现有用户创建免费会员记录
INSERT INTO public.user_memberships (user_id, membership_type)
SELECT 
    au.id,
    'free'
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_memberships um 
    WHERE um.user_id = au.id
);

-- ================================
-- 5. 确保更新触发器存在
-- ================================

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_user_memberships_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 删除旧触发器（如果存在）
DROP TRIGGER IF EXISTS update_user_memberships_updated_at ON public.user_memberships;

-- 创建新触发器
CREATE TRIGGER update_user_memberships_updated_at 
    BEFORE UPDATE ON public.user_memberships 
    FOR EACH ROW EXECUTE FUNCTION update_user_memberships_updated_at_column();

-- ================================
-- 6. 测试查询
-- ================================

-- 测试表是否可以正常访问
SELECT 
    'user_memberships表修复完成' as status,
    COUNT(*) as total_records,
    COUNT(CASE WHEN membership_type = 'free' THEN 1 END) as free_users,
    COUNT(CASE WHEN is_lifetime_member = true THEN 1 END) as lifetime_users
FROM public.user_memberships;

-- ================================
-- 7. 完成提示
-- ================================

SELECT 
    '✅ user_memberships 表权限修复完成！' as message,
    '现在应该可以正常访问了' as status; 