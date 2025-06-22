-- 修复数据库表结构 - 添加缺失的列
-- 在 Supabase SQL 编辑器中运行此文件

-- 添加 symptoms 列（如果不存在）
ALTER TABLE public.menstrual_cycles ADD COLUMN IF NOT EXISTS symptoms TEXT[] DEFAULT '{}';

-- 添加 notes 列（如果不存在）
ALTER TABLE public.menstrual_cycles ADD COLUMN IF NOT EXISTS notes TEXT;

-- 添加其他可能缺失的列
ALTER TABLE public.menstrual_cycles ADD COLUMN IF NOT EXISTS cycle_length INTEGER;
ALTER TABLE public.menstrual_cycles ADD COLUMN IF NOT EXISTS flow_intensity VARCHAR(20);
ALTER TABLE public.menstrual_cycles ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE public.menstrual_cycles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 验证表结构
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'menstrual_cycles'
ORDER BY ordinal_position; 