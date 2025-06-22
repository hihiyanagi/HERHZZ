-- HerHzzz RLS (Row Level Security) 策略设置
-- 在 Supabase SQL 编辑器中运行此文件以设置数据安全策略

-- ================================
-- 1. 启用表的行级安全
-- ================================

-- 启用用户设置表的RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- 启用月经周期表的RLS
ALTER TABLE public.menstrual_cycles ENABLE ROW LEVEL SECURITY;

-- 启用音频会话表的RLS
ALTER TABLE public.audio_sessions ENABLE ROW LEVEL SECURITY;

-- 启用睡眠记录表的RLS
ALTER TABLE public.sleep_records ENABLE ROW LEVEL SECURITY;

-- ================================
-- 2. 创建用户设置表的策略
-- ================================

-- 用户只能查看自己的设置
CREATE POLICY "Users can view own settings" ON public.user_settings
    FOR SELECT USING (auth.uid() = user_id);

-- 用户只能插入自己的设置
CREATE POLICY "Users can insert own settings" ON public.user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的设置
CREATE POLICY "Users can update own settings" ON public.user_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- 用户可以删除自己的设置
CREATE POLICY "Users can delete own settings" ON public.user_settings
    FOR DELETE USING (auth.uid() = user_id);

-- ================================
-- 3. 创建月经周期表的策略
-- ================================

-- 用户只能查看自己的周期记录
CREATE POLICY "Users can view own cycles" ON public.menstrual_cycles
    FOR SELECT USING (auth.uid() = user_id);

-- 用户只能插入自己的周期记录
CREATE POLICY "Users can insert own cycles" ON public.menstrual_cycles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的周期记录
CREATE POLICY "Users can update own cycles" ON public.menstrual_cycles
    FOR UPDATE USING (auth.uid() = user_id);

-- 用户可以删除自己的周期记录
CREATE POLICY "Users can delete own cycles" ON public.menstrual_cycles
    FOR DELETE USING (auth.uid() = user_id);

-- ================================
-- 4. 创建音频会话表的策略
-- ================================

-- 用户只能查看自己的音频会话
CREATE POLICY "Users can view own audio sessions" ON public.audio_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- 用户只能插入自己的音频会话
CREATE POLICY "Users can insert own audio sessions" ON public.audio_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的音频会话
CREATE POLICY "Users can update own audio sessions" ON public.audio_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- 用户可以删除自己的音频会话
CREATE POLICY "Users can delete own audio sessions" ON public.audio_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- ================================
-- 5. 创建睡眠记录表的策略
-- ================================

-- 用户只能查看自己的睡眠记录
CREATE POLICY "Users can view own sleep records" ON public.sleep_records
    FOR SELECT USING (auth.uid() = user_id);

-- 用户只能插入自己的睡眠记录
CREATE POLICY "Users can insert own sleep records" ON public.sleep_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的睡眠记录
CREATE POLICY "Users can update own sleep records" ON public.sleep_records
    FOR UPDATE USING (auth.uid() = user_id);

-- 用户可以删除自己的睡眠记录
CREATE POLICY "Users can delete own sleep records" ON public.sleep_records
    FOR DELETE USING (auth.uid() = user_id);

-- ================================
-- 6. 验证策略是否生效
-- ================================

-- 查看当前用户的权限（可选，用于测试）
-- SELECT auth.uid(); -- 显示当前用户ID
-- SELECT * FROM public.menstrual_cycles; -- 应该只显示当前用户的数据

-- 完成！现在每个用户只能访问自己的数据
-- 这确保了数据隐私和安全性 