-- ==========================================
-- MR DAMICE CRM - SUPABASE DATABASE SCHEMA
-- ==========================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS & TYPES
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'worker');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE call_status AS ENUM (
    'Poko rele',
    'Pa jwenn li',
    'Gen follow up',
    'Pa enterese',
    'Mwen pale ak li',
    'Close',
    'Assistance'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE offer_program AS ENUM (
    'Fòmasyon $199 USD',
    'Done For You $1,000 USD'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. USERS / PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'worker',
  is_online BOOLEAN NOT NULL DEFAULT false,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. LEADS TABLE
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  current_status call_status NOT NULL DEFAULT 'Poko rele',
  last_call_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast phone duplicate checks & queries
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON public.leads(assigned_to);

-- 4. CALLS TABLE
CREATE TABLE IF NOT EXISTS public.calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status call_status NOT NULL,
  closed_program offer_program,
  assistance_note TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calls_lead ON public.calls(lead_id);
CREATE INDEX IF NOT EXISTS idx_calls_agent ON public.calls(agent_id);

-- 5. HISTORY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.history_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- e.g. 'DUPLICATE_ATTEMPT', 'CALL_ADDED', 'STATUS_CHANGE'
  status call_status,
  closed_program offer_program,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_history_lead ON public.history_logs(lead_id);

-- 6. AUTOMATIC TRIGGER FOR NEW USERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'worker')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.history_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
CREATE POLICY "Admins have full access to profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Workers can view all profiles for dropdowns/assignment lists" ON public.profiles;
CREATE POLICY "Workers can view all profiles for dropdowns/assignment lists"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Workers can update own profile" ON public.profiles;
CREATE POLICY "Workers can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- Leads Policies
DROP POLICY IF EXISTS "Admins have full access to leads" ON public.leads;
CREATE POLICY "Admins have full access to leads"
  ON public.leads FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Workers can view leads assigned to them or created by them" ON public.leads;
CREATE POLICY "Workers can view leads assigned to them or created by them"
  ON public.leads FOR SELECT
  USING (assigned_to = auth.uid() OR created_by = auth.uid());

DROP POLICY IF EXISTS "Workers can insert leads" ON public.leads;
CREATE POLICY "Workers can insert leads"
  ON public.leads FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Workers can update leads assigned to them" ON public.leads;
CREATE POLICY "Workers can update leads assigned to them"
  ON public.leads FOR UPDATE
  USING (assigned_to = auth.uid() OR created_by = auth.uid());

-- Calls Policies
DROP POLICY IF EXISTS "Admins have full access to calls" ON public.calls;
CREATE POLICY "Admins have full access to calls"
  ON public.calls FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Workers can view calls for their leads or made by them" ON public.calls;
CREATE POLICY "Workers can view calls for their leads or made by them"
  ON public.calls FOR SELECT
  USING (
    agent_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.leads WHERE leads.id = calls.lead_id AND (leads.assigned_to = auth.uid() OR leads.created_by = auth.uid()))
  );

DROP POLICY IF EXISTS "Workers can insert calls for their assigned leads" ON public.calls;
CREATE POLICY "Workers can insert calls for their assigned leads"
  ON public.calls FOR INSERT
  WITH CHECK (agent_id = auth.uid());

-- History Logs Policies
DROP POLICY IF EXISTS "Admins have full access to history logs" ON public.history_logs;
CREATE POLICY "Admins have full access to history logs"
  ON public.history_logs FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Workers can view history logs for their assigned leads" ON public.history_logs;
CREATE POLICY "Workers can view history logs for their assigned leads"
  ON public.history_logs FOR SELECT
  USING (
    agent_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.leads WHERE leads.id = history_logs.lead_id AND (leads.assigned_to = auth.uid() OR leads.created_by = auth.uid()))
  );

DROP POLICY IF EXISTS "Workers can insert history logs" ON public.history_logs;
CREATE POLICY "Workers can insert history logs"
  ON public.history_logs FOR INSERT
  WITH CHECK (agent_id = auth.uid());


-- ==========================================
-- SEED TEST ACCOUNTS FOR ADMIN & WORKER
-- ==========================================

-- 1. Insert Admin Test Profile & Auth (Note: Password hash must be created via Auth API or SQL extension if enabled)
-- Note: Replace UUIDs if needed or let Supabase Auth manage user creation.
-- The trigger `on_auth_user_created` will automatically create profiles when users register via AuthScreen!

-- Example SQL snippet to grant admin role manually if an account already registered:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'Admintest@damice.com';
