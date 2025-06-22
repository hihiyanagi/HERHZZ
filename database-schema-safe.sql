-- HerHzzz 数据库表结构安全版本
-- 在 Supabase SQL 编辑器中运行此文件
-- 此版本完全避免创建users表，只添加需要的字段和其他表

-- ================================
-- 1. 启用必要的扩展
-- ================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================
-- 2. 为现有users表添加缺失字段
-- ================================
-- 由于users表已存在，我们只添加需要的字段

DO $$
BEGIN
    -- 检查并添加 username 字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'username'
    ) THEN
        ALTER TABLE public.users ADD COLUMN username VARCHAR(100);
        RAISE NOTICE '添加了 username 字段';
    END IF;
    
    -- 检查并添加 avatar_url 字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE public.users ADD COLUMN avatar_url TEXT;
        RAISE NOTICE '添加了 avatar_url 字段';
    END IF;
    
    -- 检查并添加 birth_year 字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'birth_year'
    ) THEN
        ALTER TABLE public.users ADD COLUMN birth_year INTEGER;
        RAISE NOTICE '添加了 birth_year 字段';
    END IF;
    
    -- 检查并添加 timezone 字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'timezone'
    ) THEN
        ALTER TABLE public.users ADD COLUMN timezone VARCHAR(50) DEFAULT 'Asia/Shanghai';
        RAISE NOTICE '添加了 timezone 字段';
    END IF;
    
    -- 检查并添加 onboarding_completed 字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'onboarding_completed'
    ) THEN
        ALTER TABLE public.users ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
        RAISE NOTICE '添加了 onboarding_completed 字段';
    END IF;
    
    -- 检查并添加 created_at 字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE '添加了 created_at 字段';
    END IF;
    
    -- 检查并添加 updated_at 字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE '添加了 updated_at 字段';
    END IF;
    
    RAISE NOTICE 'users表字段检查完成';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '处理users表时出现错误: %', SQLERRM;
END $$;

-- ================================
-- 3. 创建用户设置表
-- ================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_settings'
    ) THEN
        CREATE TABLE public.user_settings (
            user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
            default_cycle_length INTEGER DEFAULT 28 CHECK (default_cycle_length >= 21 AND default_cycle_length <= 35),
            average_menstrual_days INTEGER DEFAULT 5 CHECK (average_menstrual_days >= 3 AND average_menstrual_days <= 7),
            notification_enabled BOOLEAN DEFAULT TRUE,
            theme_preference VARCHAR(20) DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
            privacy_mode BOOLEAN DEFAULT FALSE,
            data_sharing_consent BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE '创建了 user_settings 表';
    ELSE
        RAISE NOTICE 'user_settings 表已存在';
    END IF;
END $$;

-- ================================
-- 4. 创建月经周期表
-- ================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'menstrual_cycles'
    ) THEN
        CREATE TABLE public.menstrual_cycles (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            start_date DATE NOT NULL,
            end_date DATE,
            cycle_length INTEGER CHECK (cycle_length >= 21 AND cycle_length <= 45),
            flow_intensity VARCHAR(20) CHECK (flow_intensity IN ('light', 'normal', 'heavy')),
            symptoms TEXT[] DEFAULT '{}',
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            
            -- 确保结束日期在开始日期之后
            CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date > start_date)
        );
        RAISE NOTICE '创建了 menstrual_cycles 表';
    ELSE
        RAISE NOTICE 'menstrual_cycles 表已存在';
    END IF;
END $$;

-- ================================
-- 5. 创建音频会话表
-- ================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'audio_sessions'
    ) THEN
        CREATE TABLE public.audio_sessions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            cycle_id UUID REFERENCES public.menstrual_cycles(id) ON DELETE SET NULL,
            audio_name VARCHAR(100) NOT NULL,
            cycle_phase VARCHAR(20) NOT NULL CHECK (cycle_phase IN ('menstrual', 'follicular', 'ovulation', 'luteal')),
            start_time TIMESTAMP WITH TIME ZONE NOT NULL,
            end_time TIMESTAMP WITH TIME ZONE,
            duration_minutes INTEGER,
            completed BOOLEAN DEFAULT FALSE,
            sleep_timer_minutes INTEGER CHECK (sleep_timer_minutes > 0),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            
            -- 确保结束时间在开始时间之后
            CONSTRAINT valid_session_time CHECK (end_time IS NULL OR end_time > start_time)
        );
        RAISE NOTICE '创建了 audio_sessions 表';
    ELSE
        RAISE NOTICE 'audio_sessions 表已存在';
    END IF;
END $$;

-- ================================
-- 6. 创建睡眠记录表
-- ================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'sleep_records'
    ) THEN
        CREATE TABLE public.sleep_records (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            session_id UUID REFERENCES public.audio_sessions(id) ON DELETE SET NULL,
            sleep_date DATE NOT NULL,
            bedtime TIME,
            wake_time TIME,
            sleep_duration_hours DECIMAL(4,2) CHECK (sleep_duration_hours >= 0 AND sleep_duration_hours <= 24),
            sleep_quality_rating INTEGER CHECK (sleep_quality_rating >= 1 AND sleep_quality_rating <= 5),
            cycle_phase VARCHAR(20) NOT NULL CHECK (cycle_phase IN ('menstrual', 'follicular', 'ovulation', 'luteal')),
            audio_used VARCHAR(100),
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE '创建了 sleep_records 表';
    ELSE
        RAISE NOTICE 'sleep_records 表已存在';
    END IF;
END $$;

-- ================================
-- 7. 创建索引以提高查询性能
-- ================================

-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- 月经周期表索引  
CREATE INDEX IF NOT EXISTS idx_menstrual_cycles_user_id ON public.menstrual_cycles(user_id);
CREATE INDEX IF NOT EXISTS idx_menstrual_cycles_start_date ON public.menstrual_cycles(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_menstrual_cycles_user_date ON public.menstrual_cycles(user_id, start_date DESC);

-- 音频会话表索引
CREATE INDEX IF NOT EXISTS idx_audio_sessions_user_id ON public.audio_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_sessions_created_at ON public.audio_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audio_sessions_cycle_phase ON public.audio_sessions(cycle_phase);

-- 睡眠记录表索引
CREATE INDEX IF NOT EXISTS idx_sleep_records_user_id ON public.sleep_records(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_records_sleep_date ON public.sleep_records(sleep_date DESC);

-- ================================
-- 8. 创建更新时间触发器函数
-- ================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ================================
-- 9. 为需要的表添加更新时间触发器
-- ================================

-- 删除可能已存在的触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
DROP TRIGGER IF EXISTS update_menstrual_cycles_updated_at ON public.menstrual_cycles;

-- 重新创建触发器
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at 
    BEFORE UPDATE ON public.user_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menstrual_cycles_updated_at 
    BEFORE UPDATE ON public.menstrual_cycles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- 10. 设置行级安全策略 (RLS)
-- ================================

-- 启用行级安全
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menstrual_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_records ENABLE ROW LEVEL SECURITY;

-- 删除可能已存在的策略（使用DO块避免错误）
DO $$
BEGIN
    -- 用户表策略
    DROP POLICY IF EXISTS "用户只能查看自己的资料" ON public.users;
    DROP POLICY IF EXISTS "用户可以插入自己的资料" ON public.users;
    DROP POLICY IF EXISTS "用户可以更新自己的资料" ON public.users;
    
    -- 用户设置表策略
    DROP POLICY IF EXISTS "用户只能查看自己的设置" ON public.user_settings;
    DROP POLICY IF EXISTS "用户可以插入自己的设置" ON public.user_settings;
    DROP POLICY IF EXISTS "用户可以更新自己的设置" ON public.user_settings;
    
    -- 月经周期表策略
    DROP POLICY IF EXISTS "用户只能查看自己的周期数据" ON public.menstrual_cycles;
    DROP POLICY IF EXISTS "用户可以插入自己的周期数据" ON public.menstrual_cycles;
    DROP POLICY IF EXISTS "用户可以更新自己的周期数据" ON public.menstrual_cycles;
    DROP POLICY IF EXISTS "用户可以删除自己的周期数据" ON public.menstrual_cycles;
    
    -- 音频会话表策略
    DROP POLICY IF EXISTS "用户只能查看自己的音频会话" ON public.audio_sessions;
    DROP POLICY IF EXISTS "用户可以插入自己的音频会话" ON public.audio_sessions;
    DROP POLICY IF EXISTS "用户可以更新自己的音频会话" ON public.audio_sessions;
    
    -- 睡眠记录表策略
    DROP POLICY IF EXISTS "用户只能查看自己的睡眠记录" ON public.sleep_records;
    DROP POLICY IF EXISTS "用户可以插入自己的睡眠记录" ON public.sleep_records;
    DROP POLICY IF EXISTS "用户可以更新自己的睡眠记录" ON public.sleep_records;
    
    RAISE NOTICE '清理了已存在的策略';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '清理策略时出现错误: %', SQLERRM;
END $$;

-- 创建新的安全策略
-- 用户表安全策略
CREATE POLICY "用户只能查看自己的资料" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "用户可以插入自己的资料" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "用户可以更新自己的资料" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- 用户设置表安全策略
CREATE POLICY "用户只能查看自己的设置" ON public.user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以插入自己的设置" ON public.user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的设置" ON public.user_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- 月经周期表安全策略
CREATE POLICY "用户只能查看自己的周期数据" ON public.menstrual_cycles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以插入自己的周期数据" ON public.menstrual_cycles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的周期数据" ON public.menstrual_cycles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的周期数据" ON public.menstrual_cycles
    FOR DELETE USING (auth.uid() = user_id);

-- 音频会话表安全策略
CREATE POLICY "用户只能查看自己的音频会话" ON public.audio_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以插入自己的音频会话" ON public.audio_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的音频会话" ON public.audio_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- 睡眠记录表安全策略
CREATE POLICY "用户只能查看自己的睡眠记录" ON public.sleep_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以插入自己的睡眠记录" ON public.sleep_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的睡眠记录" ON public.sleep_records
    FOR UPDATE USING (auth.uid() = user_id);

-- ================================
-- 11. 创建有用的视图和函数
-- ================================

-- 获取用户当前周期阶段的函数
CREATE OR REPLACE FUNCTION get_current_cycle_phase(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    latest_cycle_start DATE;
    days_since_start INTEGER;
    cycle_length INTEGER;
    menstrual_days INTEGER;
BEGIN
    -- 获取用户设置
    SELECT 
        COALESCE(us.default_cycle_length, 28),
        COALESCE(us.average_menstrual_days, 5)
    INTO cycle_length, menstrual_days
    FROM public.user_settings us
    WHERE us.user_id = p_user_id;
    
    -- 如果没有设置，使用默认值
    IF cycle_length IS NULL THEN
        cycle_length := 28;
        menstrual_days := 5;
    END IF;
    
    -- 获取最近的月经开始日期
    SELECT start_date INTO latest_cycle_start
    FROM public.menstrual_cycles
    WHERE user_id = p_user_id
    ORDER BY start_date DESC
    LIMIT 1;
    
    -- 如果没有记录，返回月经期
    IF latest_cycle_start IS NULL THEN
        RETURN 'menstrual';
    END IF;
    
    -- 计算距离开始的天数
    days_since_start := CURRENT_DATE - latest_cycle_start;
    
    -- 计算当前周期中的天数（处理跨周期）
    days_since_start := days_since_start % cycle_length;
    
    -- 判断阶段
    IF days_since_start < menstrual_days THEN
        RETURN 'menstrual';
    ELSIF days_since_start < (cycle_length * 0.4)::INTEGER THEN
        RETURN 'follicular';
    ELSIF days_since_start < (cycle_length * 0.6)::INTEGER THEN
        RETURN 'ovulation';
    ELSE
        RETURN 'luteal';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- 12. 最终检查和状态报告
-- ================================
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    -- 检查创建的表数量
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public' 
    AND table_name IN ('users', 'user_settings', 'menstrual_cycles', 'audio_sessions', 'sleep_records');
    
    RAISE NOTICE '成功！共有 % 个表已准备就绪', table_count;
    RAISE NOTICE 'HerHzzz 数据库设置完成！';
END $$;

-- 完成提示
SELECT 'HerHzzz 数据库表结构安全设置完成！' as status; 