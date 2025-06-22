-- 删除外键约束 - 解决保存数据问题
-- 在 Supabase SQL 编辑器中运行此文件

-- ================================
-- 1. 删除 menstrual_cycles 表的外键约束
-- ================================

-- 删除用户ID外键约束
ALTER TABLE public.menstrual_cycles 
DROP CONSTRAINT IF EXISTS menstrual_cycles_user_id_fkey;

-- 验证约束已删除
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
AND table_name = 'menstrual_cycles'
AND constraint_type = 'FOREIGN KEY';

-- ================================
-- 2. 同时删除其他相关表的外键约束（可选）
-- ================================

-- 删除 user_settings 表的外键约束
ALTER TABLE public.user_settings 
DROP CONSTRAINT IF EXISTS user_settings_user_id_fkey;

-- 删除 audio_sessions 表的外键约束
ALTER TABLE public.audio_sessions 
DROP CONSTRAINT IF EXISTS audio_sessions_user_id_fkey;

-- 删除 sleep_records 表的外键约束
ALTER TABLE public.sleep_records 
DROP CONSTRAINT IF EXISTS sleep_records_user_id_fkey;

-- ================================
-- 3. 修改 user_id 列为可选（如果需要）
-- ================================

-- 让 user_id 列允许为空，这样匿名用户也能使用
ALTER TABLE public.menstrual_cycles 
ALTER COLUMN user_id DROP NOT NULL;

-- ================================
-- 4. 验证修改结果
-- ================================

-- 显示当前表结构
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'menstrual_cycles'
ORDER BY ordinal_position;

-- 完成提示
SELECT '🎉 外键约束已删除！现在可以正常保存数据了，无需强制用户登录。' as status; 