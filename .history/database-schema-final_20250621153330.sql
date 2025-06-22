CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    default_cycle_length INTEGER DEFAULT 28,
    average_menstrual_days INTEGER DEFAULT 5,
    notification_enabled BOOLEAN DEFAULT TRUE,
    theme_preference VARCHAR(20) DEFAULT 'system',
    privacy_mode BOOLEAN DEFAULT FALSE,
    data_sharing_consent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.menstrual_cycles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    cycle_length INTEGER,
    flow_intensity VARCHAR(20),
    symptoms TEXT[] DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audio_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cycle_id UUID REFERENCES public.menstrual_cycles(id) ON DELETE SET NULL,
    audio_name VARCHAR(100) NOT NULL,
    cycle_phase VARCHAR(20) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    sleep_timer_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sleep_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.audio_sessions(id) ON DELETE SET NULL,
    sleep_date DATE NOT NULL,
    bedtime TIME,
    wake_time TIME,
    sleep_duration_hours DECIMAL(4,2),
    sleep_quality_rating INTEGER,
    cycle_phase VARCHAR(20) NOT NULL,
    audio_used VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menstrual_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_records ENABLE ROW LEVEL SECURITY;

-- 删除所有可能存在的策略
DROP POLICY IF EXISTS "users_select_own" ON public.user_settings;
DROP POLICY IF EXISTS "users_insert_own" ON public.user_settings;
DROP POLICY IF EXISTS "users_update_own" ON public.user_settings;

DROP POLICY IF EXISTS "cycles_select_own" ON public.menstrual_cycles;
DROP POLICY IF EXISTS "cycles_insert_own" ON public.menstrual_cycles;
DROP POLICY IF EXISTS "cycles_update_own" ON public.menstrual_cycles;
DROP POLICY IF EXISTS "cycles_delete_own" ON public.menstrual_cycles;

DROP POLICY IF EXISTS "audio_select_own" ON public.audio_sessions;
DROP POLICY IF EXISTS "audio_insert_own" ON public.audio_sessions;
DROP POLICY IF EXISTS "audio_update_own" ON public.audio_sessions;

DROP POLICY IF EXISTS "sleep_select_own" ON public.sleep_records;
DROP POLICY IF EXISTS "sleep_insert_own" ON public.sleep_records;
DROP POLICY IF EXISTS "sleep_update_own" ON public.sleep_records;

-- 创建新的策略
CREATE POLICY "users_select_own" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "cycles_select_own" ON public.menstrual_cycles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cycles_insert_own" ON public.menstrual_cycles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cycles_update_own" ON public.menstrual_cycles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cycles_delete_own" ON public.menstrual_cycles FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "audio_select_own" ON public.audio_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "audio_insert_own" ON public.audio_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "audio_update_own" ON public.audio_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "sleep_select_own" ON public.sleep_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sleep_insert_own" ON public.sleep_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sleep_update_own" ON public.sleep_records FOR UPDATE USING (auth.uid() = user_id); 